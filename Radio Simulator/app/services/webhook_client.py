import logging
import time

import requests

logger = logging.getLogger(__name__)


def post_with_retry(url, payload, timeout_seconds, backoff_seconds):
    last_exception = None
    response = None

    for attempt in range(len(backoff_seconds) + 1):
        try:
            response = requests.post(url, json=payload, timeout=timeout_seconds)
            if 200 <= response.status_code < 300:
                return response
        except requests.RequestException as exc:
            last_exception = exc

        if attempt < len(backoff_seconds):
            time.sleep(backoff_seconds[attempt])

    if last_exception:
        raise last_exception
    return response


def dispatch_webhook(webhook, event_payload, config):
    response = post_with_retry(
        webhook["url"],
        event_payload,
        timeout_seconds=config.timeout_seconds,
        backoff_seconds=config.backoff_seconds,
    )
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
