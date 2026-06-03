package com.geolocation.authservice.services;

import com.geolocation.authservice.data.entities.Geofences;
import com.geolocation.authservice.data.entities.Team;
import com.geolocation.authservice.data.entities.User;
import com.geolocation.authservice.data.models.dto.GeofenceDTO;
import com.geolocation.authservice.data.models.dto.TeamDTO;
import com.geolocation.authservice.repositories.GeofenceRepository;
import com.geolocation.authservice.repositories.TeamRepository;
import com.geolocation.authservice.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.interceptor.TransactionAspectSupport;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;
import java.util.Optional;

@Service
public class TeamService {

    private final WebClient webClient;
    private final TeamRepository teamRepository;
    private final GeofenceRepository geofenceRepository;
    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public TeamService(WebClient.Builder builder, TeamRepository teamRepository, ModelMapper modelMapper,
                       GeofenceRepository geofenceRepository, UserRepository userRepository
    ){
        this.webClient = builder.baseUrl("http://localhost:81").build();
        this.teamRepository = teamRepository;
        this.geofenceRepository = geofenceRepository;
        this.userRepository = userRepository;
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

    @Transactional
    public List<Geofences> saveGeofences(){
        try {
            List<Geofences> geofencesList = getFences()
                    .stream().map(geofenceDTO -> {
                        Geofences geofence = modelMapper.map(geofenceDTO, Geofences.class);
                        Optional<Team> team = teamRepository.findById(geofenceDTO.getTeamId());
                        Optional<User> user = userRepository.findById(1L);
                        if(team.isEmpty() || user.isEmpty()){
                            return null;
                        }

                        geofence.setCreatedBy(user.get());
                        geofence.setTeam(team.get());
                        return geofence;
                    })
                    .toList();

            geofenceRepository.saveAll(geofencesList);
            return geofencesList;
        } catch (Exception e) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            throw new RuntimeException(e);
        }
    }

    @Transactional
    public List<Team> saveTeams(){
        try {
            List<Team> teamDTOList = getTeams()
                    .stream().map(teamDTO -> modelMapper.map(teamDTO, Team.class)).toList();

            teamRepository.saveAll(teamDTOList);
            return teamDTOList;
        } catch (Exception e) {
            TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
            throw new RuntimeException(e);
        }
    }

    public List<Geofences> getGeofencesByTeamId(long teamId) {
        if (!teamRepository.existsById(teamId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Team not found: " + teamId);
        }

        return geofenceRepository.findByTeam_Id(teamId);
    }
}
