package com.geolocation.authservice.data.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Entity
public class Team {

    @Id
    private long id;

    private String name;
    private String description;

    @Column(nullable = false)
    private LocalDateTime createdAt;
}
