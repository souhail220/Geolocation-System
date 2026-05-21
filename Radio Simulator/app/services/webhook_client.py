import logging
import time

import requests

logger = logging.getLogger(__name__)


def post_until_delivered(url, payload, config):
    delay = config.retry_initial_delay_seconds
    attempt = 0

    while True:
        attempt += 1
        try:
            response = requests.post(url, json=payload, timeout=config.timeout_seconds)
            if 200 <= response.status_code < 300:
                return response

            if response.status_code < 500:
                logger.warning(
                    "[webhook] %s → %s → %s %s; not retrying client error",
                    payload["event_type"],
                    url,
                    response.status_code,
                    response.reason,
                )
                return response

            logger.warning(
                "[webhook] %s → %s attempt=%d returned %s %s; retrying in %.1fs",
                payload["event_type"],
                url,
                attempt,
                response.status_code,
                response.reason,
                delay,
            )
        except requests.RequestException as exc:
            logger.warning(
                "[webhook] %s → %s attempt=%d unavailable: %s; retrying in %.1fs",
                payload["event_type"],
                url,
                attempt,
                exc,
                delay,
            )

        time.sleep(delay)
        delay = min(delay * 2, config.retry_max_delay_seconds)


def dispatch_webhook(webhook, event_payload, config):
    response = post_until_delivered(webhook["url"], event_payload, config)
    logger.info(
        "[webhook] %s → %s (team: %s) → %s → %s %s",
        event_payload["event_type"],
        event_payload["radio_id"],
        event_payload["team_id"],
        webhook["url"],
        response.status_code,
        response.reason,
    )
    return response
