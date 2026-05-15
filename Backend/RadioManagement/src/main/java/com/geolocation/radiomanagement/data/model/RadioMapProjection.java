package com.geolocation.radiomanagement.data.model;

import lombok.Data;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Data
public class RadioMapProjection {

    private UUID radioId;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal batteryLevel;
    private Integer signalStrength;
    private OffsetDateTime timestamp;
    private String name;
    private String status;
    private Boolean isStolen;
    private String serialNumber;
    private Integer teamId;
}
