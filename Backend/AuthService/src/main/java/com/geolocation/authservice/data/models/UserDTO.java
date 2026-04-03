package com.geolocation.authservice.data.models;

import lombok.Data;

@Data
public class UserDTO {
    private long id;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private int teamId;
    private RoleName role;
}

