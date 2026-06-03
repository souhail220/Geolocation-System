package com.geolocation.radiomanagement.data.model;

import java.math.BigDecimal;
import java.time.Instant;

public record RadioLocationEvent(
        String radioId,
        BigDecimal latitude,
        BigDecimal longitude,
        BigDecimal batteryLevel,
        Integer signalStrength,
        Instant timestamp,
        String name,
        String serialNumber,
        Integer teamId,
        Boolean active,
        Boolean stolen,
        Boolean outsideZone
) {

    public static RadioLocationEvent from(RadioLocationProjection projection) {
        return new RadioLocationEvent(
                projection.getRadioId(),
                projection.getLatitude(),
                projection.getLongitude(),
                projection.getBatteryLevel(),
                projection.getSignalStrength(),
                projection.getTimestamp(),
                projection.getName(),
                projection.getSerialNumber(),
                projection.getTeamId(),
                projection.getActive(),
                projection.getStolen(),
                projection.getOutsideZone()
        );
    }
}
