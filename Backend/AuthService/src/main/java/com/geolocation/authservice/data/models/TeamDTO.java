package com.geolocation.authservice.data.models;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class TeamDTO {
    private long id;
    private String name;
    private String description;
    private LocalDateTime createdAt;
}
