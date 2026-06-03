package com.geolocation.radiomanagement.data.model;

import java.math.BigDecimal;
import java.time.Instant;

public interface RadioLocationProjection {

    String getRadioId();
    BigDecimal getLatitude();
    BigDecimal getLongitude();
    BigDecimal getBatteryLevel();
    Integer getSignalStrength();
    Instant getTimestamp();
    String getName();
    String getSerialNumber();
    Integer getTeamId();
    Boolean getActive();
    Boolean getStolen();
    Boolean getOutsideZone();
}
