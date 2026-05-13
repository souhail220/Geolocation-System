package com.geolocation.authservice.services;

import com.geolocation.authservice.data.entities.Team;
import com.geolocation.authservice.data.models.TeamDTO;
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
    private final ModelMapper modelMapper;

    @Autowired
    public TeamService(WebClient.Builder builder, TeamRepository teamRepository, ModelMapper modelMapper){
        this.webClient = builder.baseUrl("http://localhost:81").build();
        this.teamRepository = teamRepository;
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
