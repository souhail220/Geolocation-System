package com.geolocation.radiomanagement.services;

import com.geolocation.radiomanagement.data.model.webhook.WebhookEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WebhookService {

    public void handle(WebhookEvent event) {
        switch (event.getEventType()) {
            case geo_breach      -> handleGeoBreach(event);
            case radio_stolen    -> handleStolen(event);
            case battery_critical-> handleBatteryCritical(event);
            case signal_lost     -> handleSignalLost(event);
            case radio_inactive  -> handleInactive(event);
            default -> log.warn("Unhandled event type: {}", event.getEventType());
        }
    }

    private void handleGeoBreach(WebhookEvent event) {
        log.warn("GEO BREACH — radio {} (team {}) is outside zone. Position: {}, {}",
                event.getSerialNumber(),
                event.getTeamId(),
                event.getPayload().getLat(),
                event.getPayload().getLng()
        );
        // TODO: push alert to frontend via WebSocket
    }

    private void handleStolen(WebhookEvent event) {
        log.warn("STOLEN — radio {} reported stolen at {}, {}",
                event.getSerialNumber(),
                event.getPayload().getLat(),
                event.getPayload().getLng()
        );
        // TODO: flag radio in DB, notify team
    }

    private void handleBatteryCritical(WebhookEvent event) {
        log.warn("BATTERY CRITICAL — radio {} at {}%",
                event.getSerialNumber(),
                event.getPayload().getBattery()
        );
        // TODO: notify team
    }

    private void handleSignalLost(WebhookEvent event) {
        log.warn("SIGNAL LOST — radio {} (strength: {})",
                event.getSerialNumber(),
                event.getPayload().getSignalStrength()
        );
        // TODO: mark radio as unreachable
    }

    private void handleInactive(WebhookEvent event) {
        log.info("INACTIVE — radio {} is no longer active",
                event.getSerialNumber()
        );
        // TODO: update radio status in DB
    }
}
