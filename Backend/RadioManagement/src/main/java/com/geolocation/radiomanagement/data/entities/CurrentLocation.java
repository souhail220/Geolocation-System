package com.geolocation.radiomanagement.data.entities;

import jakarta.persistence.*;
import lombok.Data;
import java.math.BigDecimal;
import org.locationtech.jts.geom.Point;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Data
public class CurrentLocation {
    @Id
    private UUID id;

    @MapsId
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "radio_id")
    private Radio radio;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal latitude;

    @Column(nullable = false, precision = 10, scale = 7)
    private BigDecimal longitude;

    @Column(nullable = false, columnDefinition = "geography(Point,4326)")
    private Point geom;

    @Column(nullable = false)
    private OffsetDateTime timestamp;

    @Column(name = "battery_level", precision = 5, scale = 2)
    private BigDecimal batteryLevel;

    @Column(name = "signal_strength")
    private Integer signalStrength;
}
