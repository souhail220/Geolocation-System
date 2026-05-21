package com.geolocation.radiomanagement.controllers;

import com.geolocation.radiomanagement.services.RadioPollService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@RestController
@RequestMapping("/api/simulator/radios")
public class RadioPollController {

    private final RadioPollService radioPollService;

    @Autowired
    public RadioPollController(RadioPollService radioPollService) {
        this.radioPollService = radioPollService;
    }

    @PostMapping("/save")
    public Mono<ResponseEntity<String>> saveRadio(){
        Instant since = Instant.now().minus(120, ChronoUnit.SECONDS);
        return radioPollService.saveRadioSim(since)
                .map(ResponseEntity::ok)
                .onErrorResume(ex ->
                        Mono.just(ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body(ex.getMessage())
                        )
                );
    }
}
