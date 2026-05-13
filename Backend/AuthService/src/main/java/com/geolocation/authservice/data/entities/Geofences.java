package com.geolocation.authservice.data.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.geo.Polygon;

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

    private Polygon geom;

    @OneToOne
    private User createdBy;

    @OneToOne
    private Team team;

    private LocalDateTime createdAt;
}