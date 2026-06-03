package com.geolocation.radiomanagement.services;

import com.geolocation.radiomanagement.data.model.webhook.WebhookEvent;
import com.geolocation.radiomanagement.repositories.CurrentLocationRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class WebhookService {

    private final CurrentLocationRepository currentLocationRepository;

    @Autowired
    public WebhookService(CurrentLocationRepository currentLocationRepository) {
        this.currentLocationRepository = currentLocationRepository;
    }

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
        updateOutsideZoneStatus(event, true);
    }

    private void handleStolen(WebhookEvent event) {
        log.warn("STOLEN — radio {} reported stolen at {}, {}",
                event.getSerialNumber(),
                event.getPayload().getLat(),
                event.getPayload().getLng()
        );
        updateStolenStatus(event, true);
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
        updateActiveStatus(event, false);
    }

    private void updateOutsideZoneStatus(WebhookEvent event, boolean outsideZone) {
        int updatedRows = currentLocationRepository.updateOutsideZoneStatus(event.getRadioId(), outsideZone);
        logStatusUpdateResult(event, "outsideZone", updatedRows);
    }

    private void updateStolenStatus(WebhookEvent event, boolean stolen) {
        int updatedRows = currentLocationRepository.updateStolenStatus(event.getRadioId(), stolen);
        logStatusUpdateResult(event, "stolen", updatedRows);
    }

    private void updateActiveStatus(WebhookEvent event, boolean active) {
        int updatedRows = currentLocationRepository.updateActiveStatus(event.getRadioId(), active);
        logStatusUpdateResult(event, "active", updatedRows);
    }

    private void logStatusUpdateResult(WebhookEvent event, String statusName, int updatedRows) {
        if (updatedRows == 0) {
            log.warn("No current_location row found for radio {} while updating {}", event.getRadioId(), statusName);
        } else {
            log.debug("Updated current_location {} for radio {}", statusName, event.getRadioId());
        }
    }
}
