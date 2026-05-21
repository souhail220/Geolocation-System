package com.geolocation.radiomanagement.services;

import com.geolocation.radiomanagement.data.entities.CurrentLocation;
import com.geolocation.radiomanagement.data.entities.LocationHistory;
import com.geolocation.radiomanagement.data.entities.Radio;
import com.geolocation.radiomanagement.data.model.ChangedRadio;
import com.geolocation.radiomanagement.data.model.RadioChangesResponse;
import com.geolocation.radiomanagement.repositories.CurrentLocationRepository;
import com.geolocation.radiomanagement.repositories.LocationHistoryRepository;
import com.geolocation.radiomanagement.repositories.RadioRepository;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.List;

@Service
@Slf4j
public class RadioPollService {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);

    private final WebClient webClient;
    private final CurrentLocationRepository currentLocationRepository;
    private final LocationHistoryRepository locationHistoryRepository;
    private final RadioRepository radioRepository;

    @Autowired
    public RadioPollService(WebClient.Builder builder, RadioRepository radioRepository,
                            CurrentLocationRepository currentLocationRepository, LocationHistoryRepository locationHistoryRepository
    ) {
        this.webClient = builder.baseUrl("http://localhost:80").build();
        this.currentLocationRepository = currentLocationRepository;
        this.locationHistoryRepository = locationHistoryRepository;
        this.radioRepository = radioRepository;
    }

    private Flux<RadioChangesResponse> streamRadios(Instant since) {
        Flux<RadioChangesResponse> flux = webClient
                .get()
                .uri(uriBuilder -> uriBuilder
                        .path("/radios/status")
                        .queryParam("since", since)
                        .build())
                .retrieve()
                .onStatus(
                        HttpStatusCode::isError,
                        res -> res.bodyToMono(String.class)
                                .map(body -> new RuntimeException(
                                        "Radio service error " + res.statusCode() + ": " + body
                                ))
                )
                .bodyToFlux(RadioChangesResponse.class)
                .timeout(Duration.ofSeconds(30))
                .doOnComplete(() -> log.info("Finished streaming all radios"))
                .doOnError(ex -> log.error("Stream error: {}", ex.getMessage()))
                .onErrorResume(ex -> Flux.empty());
        return flux;
    }

    public Mono<String> saveRadioSim(Instant since) {

        return streamRadios(since)
                .flatMap(response -> Mono
                        .fromCallable(() -> saveRadioChanges(response))
                        .subscribeOn(Schedulers.boundedElastic()))
                .reduce(0, Integer::sum)
                .map(total -> "Saved " + total + " radios successfully")
                .doOnError(ex -> log.error("Failed saving radios", ex));
    }

    private int saveRadioChanges(RadioChangesResponse response) {
        List<ChangedRadio> changedRadios = response.getChangedRadios();
        if (changedRadios == null || changedRadios.isEmpty()) {
            return 0;
        }

        List<LocationHistory> histories = new ArrayList<>(changedRadios.size());
        List<CurrentLocation> currentLocations = new ArrayList<>(changedRadios.size());

        for (ChangedRadio changedRadio : changedRadios) {
            Radio radio = radioRepository.getReferenceById(changedRadio.getRadioId());
            histories.add(toLocationHistory(changedRadio, radio));
            currentLocations.add(toCurrentLocation(changedRadio, radio));
        }

        locationHistoryRepository.saveAll(histories);
        currentLocationRepository.saveAll(currentLocations);
        return histories.size();
    }

    private LocationHistory toLocationHistory(ChangedRadio changedRadio, Radio radio) {
        LocationHistory locationHistory = new LocationHistory();
        locationHistory.setRadio(radio);
        locationHistory.setLatitude(BigDecimal.valueOf(changedRadio.getLat()));
        locationHistory.setLongitude(BigDecimal.valueOf(changedRadio.getLng()));
        locationHistory.setGeom(toPoint(changedRadio));
        locationHistory.setSignalStrength(changedRadio.getSignalStrength());
        locationHistory.setBatteryLevel(BigDecimal.valueOf(changedRadio.getBattery()));
        locationHistory.setRecordedAt(changedRadio.getChangedAt().atOffset(ZoneOffset.UTC));
        return locationHistory;
    }

    private CurrentLocation toCurrentLocation(ChangedRadio changedRadio, Radio radio) {
        CurrentLocation currentLocation = new CurrentLocation();
        currentLocation.setRadio(radio);
        currentLocation.setLatitude(BigDecimal.valueOf(changedRadio.getLat()));
        currentLocation.setLongitude(BigDecimal.valueOf(changedRadio.getLng()));
        currentLocation.setGeom(toPoint(changedRadio));
        currentLocation.setSignalStrength(changedRadio.getSignalStrength());
        currentLocation.setBatteryLevel(BigDecimal.valueOf(changedRadio.getBattery()));
        currentLocation.setTimestamp(changedRadio.getChangedAt().atOffset(ZoneOffset.UTC));
        return currentLocation;
    }

    private Point toPoint(ChangedRadio changedRadio) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(changedRadio.getLng(), changedRadio.getLat()));
    }
}
