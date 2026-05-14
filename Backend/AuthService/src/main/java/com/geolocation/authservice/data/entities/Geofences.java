package com.geolocation.authservice.data.entities;

import com.geolocation.authservice.configuration.PolygonSerializer;
import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;
import org.locationtech.jts.geom.Polygon;
import tools.jackson.databind.annotation.JsonSerialize;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Data
public class Geofences {

    @Id
    @GeneratedValue
    @UuidGenerator
    private UUID id;

    private String name;

    @Column(columnDefinition = "geography(Polygon, 4326)")
    @JsonSerialize(using = PolygonSerializer.class)
    private Polygon geom;

    @ManyToOne
    private User createdBy;

    @OneToOne
    private Team team;

    private LocalDateTime createdAt;
}
