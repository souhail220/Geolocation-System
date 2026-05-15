package com.geolocation.radiomanagement.controllers;

import com.geolocation.radiomanagement.services.RadioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
@RequestMapping("/api/radios")
public class RadioMapController {

    private final RadioService radioService;

    @Autowired
    public RadioMapController(RadioService radioService){
        this.radioService = radioService;
    }

    @GetMapping(produces = MediaType.TEXT_PLAIN_VALUE)
    public Mono<ResponseEntity<String>> getRadios() {
        return radioService.saveRadioSim()
                .map(ResponseEntity::ok)
                .onErrorResume(ex ->
                        Mono.just(ResponseEntity
                                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                                .body("Failed: " + ex.getMessage()))
                );
    }
}
