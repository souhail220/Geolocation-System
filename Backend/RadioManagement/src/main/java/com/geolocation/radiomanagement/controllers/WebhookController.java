package com.geolocation.radiomanagement.controllers;

import com.geolocation.radiomanagement.data.model.webhook.WebhookEvent;
import com.geolocation.radiomanagement.services.WebhookService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/webhooks")
@Slf4j
public class WebhookController {
    private final WebhookService webhookService;

    @Autowired
    public WebhookController(WebhookService webhookService) {
        this.webhookService = webhookService;
    }

    @PostMapping("/radio-events")
    public ResponseEntity<Void> receive(@RequestBody WebhookEvent event) {
        log.info("Webhook received — type: {}, radio: {}, team: {}",
                event.getEventType(),
                event.getRadioId(),
                event.getTeamId()
        );
        webhookService.handle(event);
        return ResponseEntity.ok().build();
    }
}
