package com.geolocation.radiomanagement.services;

import com.geolocation.radiomanagement.data.entities.LocationHistory;
import com.geolocation.radiomanagement.data.entities.Radio;
import com.geolocation.radiomanagement.data.model.ChangedRadio;
import com.geolocation.radiomanagement.data.model.RadioChangesResponse;
import com.geolocation.radiomanagement.repositories.LocationHistoryRepository;
import com.geolocation.radiomanagement.repositories.RadioRepository;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.Coordinate;
import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.Point;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.support.TransactionTemplate;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.math.BigDecimal;
import java.sql.Statement;
import java.time.Duration;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Objects;

@Service
@Slf4j
public class RadioPollService {

    private static final GeometryFactory GEOMETRY_FACTORY = new GeometryFactory(new PrecisionModel(), 4326);
    private static final String UPSERT_CURRENT_LOCATION_SQL = """
            INSERT INTO current_location (
                radio_id,
                latitude,
                longitude,
                geom,
                battery_level,
                signal_strength,
                active,
                stolen,
                outside_zone,
                timestamp
            )
            VALUES (?, ?, ?, ST_SetSRID(ST_MakePoint(?, ?), 4326)::geography, ?, ?, ?, ?, ?, ?)
            ON CONFLICT (radio_id) DO UPDATE SET
                latitude = EXCLUDED.latitude,
                longitude = EXCLUDED.longitude,
                geom = EXCLUDED.geom,
                battery_level = EXCLUDED.battery_level,
                signal_strength = EXCLUDED.signal_strength,
                active = EXCLUDED.active,
                stolen = EXCLUDED.stolen,
                outside_zone = EXCLUDED.outside_zone,
                timestamp = EXCLUDED.timestamp
            """;

    private final WebClient webClient;
    private final LocationHistoryRepository locationHistoryRepository;
    private final RadioRepository radioRepository;
    private final JdbcTemplate jdbcTemplate;
    private final TransactionTemplate transactionTemplate;

    @Autowired
    public RadioPollService(WebClient.Builder builder, RadioRepository radioRepository,
                            LocationHistoryRepository locationHistoryRepository,
                            JdbcTemplate jdbcTemplate,
                            TransactionTemplate transactionTemplate
    ) {
        this.webClient = builder.baseUrl("http://localhost:80").build();
        this.locationHistoryRepository = locationHistoryRepository;
        this.radioRepository = radioRepository;
        this.jdbcTemplate = jdbcTemplate;
        this.transactionTemplate = transactionTemplate;
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

        for (ChangedRadio changedRadio : changedRadios) {
            Radio radio = radioRepository.getReferenceById(changedRadio.getRadioId());
            histories.add(toLocationHistory(changedRadio, radio));
        }

        return Objects.requireNonNullElse(transactionTemplate.execute(status -> {
            locationHistoryRepository.saveAll(histories);
            upsertCurrentLocations(changedRadios);
            return histories.size();
        }), 0);
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

    private Point toPoint(ChangedRadio changedRadio) {
        return GEOMETRY_FACTORY.createPoint(new Coordinate(changedRadio.getLng(), changedRadio.getLat()));
    }

    private int upsertCurrentLocations(List<ChangedRadio> changedRadios) {
        int[][] updateCounts = jdbcTemplate.batchUpdate(
                UPSERT_CURRENT_LOCATION_SQL,
                changedRadios,
                changedRadios.size(),
                (ps, radio) -> {
                    ps.setString(1, radio.getRadioId());
                    ps.setBigDecimal(2, BigDecimal.valueOf(radio.getLat()));
                    ps.setBigDecimal(3, BigDecimal.valueOf(radio.getLng()));
                    ps.setDouble(4, radio.getLng());
                    ps.setDouble(5, radio.getLat());
                    ps.setBigDecimal(6, BigDecimal.valueOf(radio.getBattery()));
                    ps.setInt(7, radio.getSignalStrength());
                    ps.setBoolean(8, radio.isActive());
                    ps.setBoolean(9, radio.isStolen());
                    ps.setBoolean(10, radio.isOutsideZone());
                    ps.setObject(11, radio.getChangedAt().atOffset(ZoneOffset.UTC));
                }
        );

        return Arrays.stream(updateCounts)
                .flatMapToInt(Arrays::stream)
                .map(this::updatedRowCount)
                .sum();
    }

    private int updatedRowCount(int updateCount) {
        if (updateCount == Statement.SUCCESS_NO_INFO) {
            return 1;
        }
        if (updateCount == Statement.EXECUTE_FAILED) {
            return 0;
        }
        return updateCount;
    }
}
