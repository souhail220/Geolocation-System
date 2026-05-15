package com.geolocation.authservice.data.entities;

import com.geolocation.authservice.data.models.AlertStatus;
import jakarta.persistence.*;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Data
public class Alerts {
    @Id
    @GeneratedValue
    private UUID id;
    private String type;

    @Column(columnDefinition = "TEXT")
    private String description;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by")
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private AlertStatus status = AlertStatus.OPEN;
    private OffsetDateTime createdAt;
    private OffsetDateTime resolvedAt;
}
