package com.geolocation.radiomanagement.data.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.locationtech.jts.geom.Point;
import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Data
public class LocationHistory {

    @Id
    @GeneratedValue
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "radio_id")
    private Radio radio;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @Column(nullable = false, columnDefinition = "geography(Point,4326)")
    private Point geom;

    @Column(precision = 5, scale = 2)
    private BigDecimal batteryLevel;

    private Integer signalStrength;
    private OffsetDateTime recordedAt;
}
