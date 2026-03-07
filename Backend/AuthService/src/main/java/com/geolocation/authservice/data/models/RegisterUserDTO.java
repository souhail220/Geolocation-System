package com.geolocation.authservice.data.models;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterUserDTO {
    @NotBlank(message = "First name is required")
    @Size(min = 3, max = 20)
    private String firstName;

    @NotBlank(message = "Last name is required")
    @Size(min = 3, max = 20)
    private String lastName;

    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;

    @NotBlank
    @Size(min = 8, message = "Password must be at least 8 chars")
    private String password;

    @NotBlank
    @Size(min = 8, message = "Phone number must be at least 8 chars")
    private String phoneNumber;

    @NotNull(message = "Team Id is required")
    private int teamId;

    @NotNull(message = "Role must not be null")
    private RoleName role;
}
