package com.geolocation.radiomanagement.data.model;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.OffsetDateTime;

public interface RadioMapProjection {

     String getRadioId();
     BigDecimal getLatitude();
     BigDecimal getLongitude();
     BigDecimal geBatteryLevel();
     Integer getSignalStrength();
     Instant getTimestamp();
     String getName();
     String getSerialNumber();
     Integer getTeamId();
}
