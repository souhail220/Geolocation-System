package com.geolocation.authservice.services;

import com.geolocation.authservice.data.entities.User;
import com.geolocation.authservice.data.models.UserDTO;
import com.geolocation.authservice.repositories.UserRepository;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class UserManagementService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;

    @Autowired
    public UserManagementService(UserRepository userRepository, ModelMapper modelMapper){
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
    }

    public Page<UserDTO> getUsers(int page, int size) {
        Page<User> users = userRepository.findAll(PageRequest.of(page, size));
        return users.map(user -> modelMapper.map(user, UserDTO.class));
    }
}
