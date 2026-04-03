package com.geolocation.authservice.services;

import com.geolocation.authservice.data.entities.User;
import com.geolocation.authservice.data.models.APIResponse;
import com.geolocation.authservice.data.models.UserDTO;
import com.geolocation.authservice.exceptions.ResourceNotFoundException;
import com.geolocation.authservice.exceptions.ServiceException;
import com.geolocation.authservice.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataAccessException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public UserManagementService(
            UserRepository userRepository,
            ModelMapper modelMapper) {
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    public APIResponse<Page<UserDTO>> getUsers(int page, int size) {
        try {
            Page<User> users = userRepository.findAll(PageRequest.of(page, size));
            Page<UserDTO> dtos = users.map(u -> modelMapper.map(u, UserDTO.class));
            return APIResponse.success(dtos);
        } catch (DataAccessException e) {
            throw new ServiceException("Failed to retrieve users", e);
        }
    }

    public APIResponse<List<UserDTO>> getUsersByTeam(int teamId) {
        try {
            List<User> users = userRepository.findAllByTeamId(teamId);
            if(users.isEmpty()){
                throw new ResourceNotFoundException("Team not found with id: " + teamId);
            }

            List<UserDTO> dtos = users.stream()
                    .map(u -> modelMapper.map(u, UserDTO.class))
                    .toList();
            return APIResponse.success(dtos);
        } catch (DataAccessException e) {
            throw new ServiceException("Failed to retrieve users for team: " + teamId, e);
        }
    }
}