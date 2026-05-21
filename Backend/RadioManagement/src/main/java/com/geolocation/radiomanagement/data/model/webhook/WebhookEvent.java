package com.geolocation.radiomanagement.data.model.webhook;

import com.geolocation.radiomanagement.data.model.enums.EventType;
import lombok.Data;
import java.time.OffsetDateTime;

@Data
public class WebhookEvent {
    private EventType eventType;
    private String radioId;
    private int teamId;
    private String serialNumber;
    private WebhookPayload payload;
    private OffsetDateTime triggeredAt;
}
