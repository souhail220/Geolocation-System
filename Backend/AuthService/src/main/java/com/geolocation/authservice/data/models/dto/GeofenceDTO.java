package com.geolocation.authservice.data.models.dto;

import com.geolocation.authservice.configuration.PolygonDeserializer;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.locationtech.jts.geom.Polygon;
import tools.jackson.databind.annotation.JsonDeserialize;
import java.time.OffsetDateTime;

@Data
public class GeofenceDTO {
    private String id;
    private String name;

    @NotNull
    @JsonDeserialize(using = PolygonDeserializer.class)
    private Polygon geom;
    private long teamId;
    @JsonDeserialize(using = FlexibleOffsetDateTimeDeserializer.class)
    private OffsetDateTime createdAt;
}
