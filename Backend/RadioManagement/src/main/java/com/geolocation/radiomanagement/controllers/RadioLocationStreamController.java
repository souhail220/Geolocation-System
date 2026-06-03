package com.geolocation.radiomanagement.controllers;

import com.geolocation.radiomanagement.data.model.RadioLocationEvent;
import com.geolocation.radiomanagement.services.RadioLocationStreamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;

import java.time.Duration;
import java.util.List;

@RestController
@RequestMapping("/api/radios/locations")
public class RadioLocationStreamController {

    private static final long MIN_INTERVAL_SECONDS = 1;
    private static final long MAX_INTERVAL_SECONDS = 60;

    private final RadioLocationStreamService radioLocationStreamService;

    @Autowired
    public RadioLocationStreamController(RadioLocationStreamService radioLocationStreamService) {
        this.radioLocationStreamService = radioLocationStreamService;
    }

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<List<RadioLocationEvent>>> streamCurrentLocations(
            @RequestParam(defaultValue = "2") long intervalSeconds
    ) {
        long boundedInterval = Math.max(MIN_INTERVAL_SECONDS, Math.min(intervalSeconds, MAX_INTERVAL_SECONDS));
        return radioLocationStreamService.streamCurrentLocations(Duration.ofSeconds(boundedInterval));
    }
}
