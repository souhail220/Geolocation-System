package com.geolocation.authservice.services;

import com.geolocation.authservice.data.entities.Geofences;
import com.geolocation.authservice.data.entities.Team;
import com.geolocation.authservice.data.models.dto.GeofenceDTO;
import com.geolocation.authservice.data.models.dto.TeamDTO;
import com.geolocation.authservice.repositories.GeofenceRepository;
import com.geolocation.authservice.repositories.TeamRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class TeamService {

    private final WebClient webClient;
    private final TeamRepository teamRepository;
    private final GeofenceRepository geofenceRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public TeamService(WebClient.Builder builder, TeamRepository teamRepository,
                       GeofenceRepository geofenceRepository, ModelMapper modelMapper
    ){
        this.webClient = builder.baseUrl("http://localhost:81").build();
        this.teamRepository = teamRepository;
        this.geofenceRepository = geofenceRepository;
        this.modelMapper = modelMapper;
    }

    private List<TeamDTO> getTeams() {

        return webClient
                .get()
                .uri("/teams")
                .retrieve()
                .bodyToFlux(TeamDTO.class)
                .collectList()
                .block();
    }

    private List<GeofenceDTO> getFences(){

        return webClient
                .get()
                .uri("/geofences")
                .retrieve()
                .bodyToFlux(GeofenceDTO.class)
                .collectList()
                .block();
    }

    public List<Geofences> saveGeofences(){
        try {
            List<Geofences> geofencesList = getFences()
                    .stream().map(geofenceDTO -> modelMapper.map(geofenceDTO, Geofences.class)).toList();

            geofenceRepository.saveAll(geofencesList);
            return geofencesList;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public List<Team> saveTeams(){
        try {
            List<Team> teamDTOList = getTeams()
                    .stream().map(teamDTO -> modelMapper.map(teamDTO, Team.class)).toList();

            teamRepository.saveAll(teamDTOList);
            return teamDTOList;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
}
