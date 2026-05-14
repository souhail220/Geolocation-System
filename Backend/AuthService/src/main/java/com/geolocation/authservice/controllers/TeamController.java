package com.geolocation.authservice.controllers;

import com.geolocation.authservice.data.entities.Geofences;
import com.geolocation.authservice.data.entities.Team;
import com.geolocation.authservice.services.TeamService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.List;

@RestController
@RequestMapping("/api/simulators")
public class TeamController {

    private final TeamService teamService;

    @Autowired
    public TeamController(TeamService teamService){
        this.teamService = teamService;
    }


    @GetMapping("/teams")
    public List<Team> getTeams(){
        return teamService.saveTeams();
    }

    @GetMapping("/geofences")
    private ResponseEntity<?> getFences(){
        try {
            List<Geofences> geofencesList = teamService.saveGeofences();
            return ResponseEntity.ok(geofencesList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
