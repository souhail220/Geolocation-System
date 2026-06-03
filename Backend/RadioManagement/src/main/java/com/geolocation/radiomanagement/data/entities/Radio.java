package com.geolocation.radiomanagement.data.entities;

import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

@Data
@Entity
@Table(name = "radios")
public class Radio {

    @Id
    private String id;

    private String serialNumber;
    private String name;
    private boolean active;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
    private int teamId;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = OffsetDateTime.now(ZoneOffset.UTC);
    }
}
