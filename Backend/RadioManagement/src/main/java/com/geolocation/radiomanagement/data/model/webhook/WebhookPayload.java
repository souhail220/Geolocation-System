package com.geolocation.radiomanagement.data.model.webhook;

import lombok.Data;

@Data
public class WebhookPayload  {
    private double battery;
    private double signalStrength;
    private double lat;
    private double lng;
    private boolean active;
    private boolean stolen;
    private boolean outsideZone;
}

