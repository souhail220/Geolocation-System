package com.geolocation.radiomanagement.data.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.Instant;

@Data
public class ChangedRadio {
    @JsonProperty("radio_id")
    private String radioId;

    @JsonProperty("serial_number")
    private String serialNumber;

    private String name;

    @JsonProperty("team_id")
    private int teamId;

    private double battery;

    @JsonProperty("signal_strength")
    private int signalStrength;
    private double lat;
    private double lng;
    private boolean active;
    private boolean stolen;
    @JsonProperty("outsideZone")
    private boolean outsideZone;
    @JsonProperty("changed_at")
    private Instant changedAt;
}
