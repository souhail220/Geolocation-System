package com.geolocation.radiomanagement.controllers;

import com.geolocation.radiomanagement.data.entities.Radio;
import com.geolocation.radiomanagement.data.model.BBox;
import com.geolocation.radiomanagement.repositories.CurrentLocationRepository;
import com.geolocation.radiomanagement.repositories.RadioRepository;
import com.geolocation.radiomanagement.services.RadioService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.util.List;

@RestController
@RequestMapping("/api/radios")
public class RadioMapController {

    private final RadioService radioService;
    private final CurrentLocationRepository repo;
    private final RadioRepository radioRepo;

    @Autowired
    public RadioMapController(
            RadioService radioService, CurrentLocationRepository repo, RadioRepository radioRepo
    ){
        this.radioService = radioService;
        this.repo = repo;
        this.radioRepo = radioRepo;
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

    @GetMapping("/viewport")
    public ResponseEntity<?> viewport(
            @RequestParam double minLat, @RequestParam double minLng,
            @RequestParam double maxLat, @RequestParam double maxLng,
            @RequestParam int zoom
    ) {
        var box = new BBox(minLng, minLat, maxLng, maxLat);

        if (zoom >= 13) {
            List<?> individuals = repo.findInBounds(
                    box.minLng(), box.minLat(), box.maxLng(), box.maxLat()
            );
            return ResponseEntity.ok(individuals);
        } else {
            List<?> clusters = repo.clusterInBounds(
                    box.minLng(), box.minLat(), box.maxLng(), box.maxLat(),
                    zoom
            );
            return ResponseEntity.ok(clusters);
        }
    }

    // Radio detail for click popup — lazy, never on map load
    @GetMapping("/{id}")
    public ResponseEntity<Radio> detail(
            @PathVariable String id
    ) {
        return radioRepo.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
