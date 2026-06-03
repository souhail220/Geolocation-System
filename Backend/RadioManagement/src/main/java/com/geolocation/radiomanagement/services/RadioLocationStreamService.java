package com.geolocation.radiomanagement.services;

import com.geolocation.radiomanagement.data.model.RadioLocationEvent;
import com.geolocation.radiomanagement.repositories.CurrentLocationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.scheduler.Schedulers;

import java.time.Duration;
import java.util.List;

@Service
public class RadioLocationStreamService {

    private final CurrentLocationRepository currentLocationRepository;

    @Autowired
    public RadioLocationStreamService(CurrentLocationRepository currentLocationRepository) {
        this.currentLocationRepository = currentLocationRepository;
    }

    public Flux<ServerSentEvent<List<RadioLocationEvent>>> streamCurrentLocations(Duration interval) {
        return Flux.interval(Duration.ZERO, interval)
                .onBackpressureDrop()
                .flatMap(tick -> Mono.fromCallable(this::findCurrentLocations)
                        .subscribeOn(Schedulers.boundedElastic())
                        .map(locations -> ServerSentEvent.<List<RadioLocationEvent>>builder()
                                .id(String.valueOf(tick))
                                .event("radio-locations")
                                .data(locations)
                                .build()));
    }

    private List<RadioLocationEvent> findCurrentLocations() {
        return currentLocationRepository.findAllForLocationStream()
                .stream()
                .map(RadioLocationEvent::from)
                .toList();
    }
}
