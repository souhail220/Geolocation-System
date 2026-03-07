package com.geolocation.authservice.services;

import com.geolocation.authservice.data.entities.User;
import com.geolocation.authservice.data.models.*;
import com.geolocation.authservice.repositories.UserRepository;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final ModelMapper modelMapper;
    private final BCryptPasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(UserRepository userRepository, ModelMapper modelMapper, BCryptPasswordEncoder passwordEncoder){
        this.userRepository = userRepository;
        this.modelMapper = modelMapper;
        this.passwordEncoder = passwordEncoder;
    }

    private APIResponse<?> validateUser(RegisterUserDTO userDTO){
        if(userRepository.existsByEmail(userDTO.getEmail())){
            return APIResponse.error("User with this email already exists");
        } else if(userRepository.existsByPhoneNumber(userDTO.getPhoneNumber())){
            return APIResponse.error("User with this phone number already exists");
        }
        else if(userDTO.getRole() == RoleName.ADMINISTRATOR){
            return APIResponse.error("You role is invalid");
        }
        return APIResponse.success(userDTO, "User is valid");
    }

    public APIResponse<?> registerUser(RegisterUserDTO userDTO){
        // Validate User
        APIResponse<?> validateMessage = validateUser(userDTO);
        if(!validateMessage.isSuccess()){
            return validateMessage;
        }

        // Save User
        User user = modelMapper.map(userDTO, User.class);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        userRepository.save(user);
        return APIResponse.success(modelMapper.map(user, LoggedUserDTO.class));
    }

    public APIResponse<?> loginUser(@Valid LoginCredentials loginCredentials, HttpServletResponse response) {
        User user = userRepository.findByEmail(loginCredentials.getEmail());
        if(user == null){
            return APIResponse.error("User doesn't exist");
        }

        return authenticate(user, loginCredentials, response);
    }

    private APIResponse<?> authenticate(User user, @Valid LoginCredentials loginCredentials, HttpServletResponse response) {
        return APIResponse.success(user, "Hhhh");
    }
}
