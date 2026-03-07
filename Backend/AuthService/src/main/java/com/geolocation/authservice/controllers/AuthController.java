package com.geolocation.authservice.controllers;

import com.geolocation.authservice.data.models.APIResponse;
import com.geolocation.authservice.data.models.LoginCredentials;
import com.geolocation.authservice.data.models.RegisterUserDTO;
import com.geolocation.authservice.services.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import java.net.URI;

@Controller
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    @Autowired
    public AuthController(AuthService authService){
        this.authService = authService;
    }

    @PostMapping("register")
    public ResponseEntity<APIResponse<?>> registerUser(@Valid @RequestBody RegisterUserDTO userDTO){
        APIResponse<?> apiResponse = authService.registerUser(userDTO);
        if(apiResponse.isSuccess()){
            return ResponseEntity.created(URI.create("/api/auth/user")).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @GetMapping("login")
    public ResponseEntity<APIResponse<?>> loginUser(@Valid @RequestBody LoginCredentials loginCredentials, HttpServletResponse response){
        APIResponse<?> apiResponse = authService.loginUser(loginCredentials, response);
        if(apiResponse.isSuccess()){
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(apiResponse);
    }
}
