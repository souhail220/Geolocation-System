package com.geolocation.radiomanagement.services;

import com.geolocation.radiomanagement.data.entities.Radio;
import com.geolocation.radiomanagement.data.model.RadioSimDTO;
import com.geolocation.radiomanagement.repositories.CurrentLocationRepository;
import com.geolocation.radiomanagement.repositories.RadioRepository;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatusCode;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.List;

@Service
@Slf4j
public class RadioService {

    private final WebClient webClient;
    private final ModelMapper modelMapper;
    private final RadioRepository radioRepository;
    private final CurrentLocationRepository currentLocationRepository;

    @Autowired
    public RadioService(
            WebClient.Builder builder, ModelMapper modelMapper,
            RadioRepository radioRepository, CurrentLocationRepository currentLocationRepository
    ) {
        this.webClient = builder.baseUrl("http://localhost:80").build();
        this.modelMapper = modelMapper;
        this.radioRepository = radioRepository;
        this.currentLocationRepository = currentLocationRepository;
    }

    public Flux<RadioSimDTO> streamRadios() {
        return webClient
                .get()
                .uri("/radios")
                .retrieve()
                .onStatus(
                        HttpStatusCode::isError,
                        res -> res.bodyToMono(String.class)
                                .map(body -> new RuntimeException(
                                        "Radio service error " + res.statusCode() + ": " + body
                                ))
                )
                .bodyToFlux(RadioSimDTO.class)
                .timeout(Duration.ofSeconds(30))
                .doOnNext(radio -> log.info(
                        "Received radio — id: {}, serial: {}, name: {}, active: {}, team: {}",
                        radio.getId(),
                        radio.getSerialNumber(),
                        radio.getName(),
                        radio.isActive(),
                        radio.getTeam()
                ))
                .doOnComplete(() -> log.info("Finished streaming all radios"))
                .doOnError(ex -> log.error("Stream error: {}", ex.getMessage()))
                .onErrorResume(ex -> Flux.empty());
    }

    public Mono<String> saveRadioSim() {

        return streamRadios()
                .map(radioSimDTO -> {
                    Radio radio = modelMapper.map(radioSimDTO, Radio.class);
                    radio.setTeamId(radioSimDTO.getTeam());
                    return radio;
                })
                .buffer(100)
                .flatMap(batch ->
                        Mono.fromCallable(() -> radioRepository.saveAll(batch))
                                .subscribeOn(Schedulers.boundedElastic()),
                        4
                )
                .map(List::size)
                .reduce(0, Integer::sum)
                .map(total -> "Saved " + total + " radios successfully")
                .doOnError(ex -> log.error("Failed saving radios", ex));
    }


}
