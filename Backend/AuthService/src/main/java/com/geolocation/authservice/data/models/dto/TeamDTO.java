package com.geolocation.authservice.data.models.dto;

import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class TeamDTO {
    private long id;
    private String name;
    private String description;
    private OffsetDateTime createdAt;
}
