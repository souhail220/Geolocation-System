package com.geolocation.radiomanagement.data.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import java.time.Instant;
import java.util.List;

@Data
public class RadioChangesResponse {
    @JsonProperty("next_since")
    private Instant nextSince;
    private int count;
    private List<ChangedRadio> changedRadios;
}
