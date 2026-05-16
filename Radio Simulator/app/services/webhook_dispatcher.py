import logging
from concurrent.futures import ThreadPoolExecutor, as_completed
from collections import defaultdict

from app.configuration.database_config import get_database_url
from app.configuration.webhook_config import load_webhook_config
from app.repository.webhook_repository import load_webhooks
from app.services.webhook_client import dispatch_webhook
from app.services.webhook_events import build_radio_events

logger = logging.getLogger(__name__)


def _group_webhooks_by_event_type(webhooks):
    grouped = defaultdict(list)
    for webhook in webhooks:
        grouped[webhook["event_type"]].append(webhook)
    return grouped


def _dispatch_job(webhook, event_payload, config):
    try:
        dispatch_webhook(webhook, event_payload, config)
    except Exception:
        logger.exception(
            "[webhook] %s → %s (team: %s) → %s → failed",
            event_payload["event_type"],
            event_payload["radio_id"],
            event_payload["team_id"],
            webhook["url"],
        )


def dispatch_events(changed_radios):
    radio_events = build_radio_events(changed_radios)
    if not radio_events:
        return 0

    event_types = {event_type for event_type, _, _ in radio_events}
    webhooks = load_webhooks(get_database_url(), event_types)
    webhooks_by_event_type = _group_webhooks_by_event_type(webhooks)

    jobs = [
        (webhook, event_payload)
        for event_type, _, event_payload in radio_events
        for webhook in webhooks_by_event_type.get(event_type, [])
    ]
    if not jobs:
        return 0

    config = load_webhook_config()
    with ThreadPoolExecutor(max_workers=config.max_workers) as executor:
        futures = [
            executor.submit(_dispatch_job, webhook, event_payload, config)
            for webhook, event_payload in jobs
        ]
        for future in as_completed(futures):
            future.result()

    return len(jobs)
