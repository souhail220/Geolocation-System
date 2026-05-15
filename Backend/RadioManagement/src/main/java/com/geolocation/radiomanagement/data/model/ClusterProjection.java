package com.geolocation.radiomanagement.data.model;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class ClusterProjection {

    private Double longitude;
    private Double latitude;
    private Long count;
    private Long stolenCount;
    private Long inactiveCount;
    private BigDecimal avgBattery;
}
