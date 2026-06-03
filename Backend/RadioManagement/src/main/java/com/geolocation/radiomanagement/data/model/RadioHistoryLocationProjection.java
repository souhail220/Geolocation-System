package com.geolocation.radiomanagement.data.model;

import java.math.BigDecimal;
import java.time.Instant;

public interface RadioHistoryLocationProjection {

    String getRadioId();

    BigDecimal getLatitude();

    BigDecimal getLongitude();

    BigDecimal getBatteryLevel();

    Integer getSignalStrength();

    Instant getRecordedAt();
}
