package com.geolocation.radiomanagement.data.model;

import java.math.BigDecimal;

public interface ClusterProjection {

    Double getLongitude();

    Double getLatitude();

    Long getCount();

    Long getInactiveCount();

    BigDecimal getAvgBattery();
}
