package com.geolocation.radiomanagement.data.model;

public record BBox(
        double minLng,
        double minLat,
        double maxLng,
        double maxLat
) {}