package com.geolocation.authservice.data.models.dto;

import lombok.Data;
import org.springframework.data.geo.Polygon;
import tools.jackson.databind.annotation.JsonDeserialize;

import java.time.OffsetDateTime;

@Data
public class GeofenceDTO {
    private String id;
    private String name;
    @JsonDeserialize(using = PolygonDeserializer.class)
    private Polygon geom;
    private long teamId;
    @JsonDeserialize(using = FlexibleOffsetDateTimeDeserializer.class)
    private OffsetDateTime createdAt;
}
