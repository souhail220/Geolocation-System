package com.geolocation.radiomanagement.data.model;

import lombok.Data;

@Data
public class RadioSimDTO {
    private String id;
    private String serialNumber;
    private String name;
    private boolean active;
    private int team;
}
