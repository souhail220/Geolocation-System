import logging
import threading
from concurrent.futures import ThreadPoolExecutor
from collections import defaultdict

from app.configuration.database_config import get_database_url
from app.configuration.webhook_config import load_webhook_config
from app.repository.webhook_repository import load_webhooks
from app.services.webhook_client import dispatch_webhook
from app.services.webhook_events import build_radio_events

logger = logging.getLogger(__name__)

_executor = None
_executor_lock = threading.Lock()


def _get_executor(config):
    global _executor

    with _executor_lock:
        if _executor is None:
            _executor = ThreadPoolExecutor(
                max_workers=config.max_workers,
                thread_name_prefix="webhook-dispatch",
            )
        return _executor


def _group_webhooks_by_event_type(webhooks):
    grouped = defaultdict(list)
    for webhook in webhooks:
        grouped[webhook["event_type"]].append(webhook)
    return grouped


def _dispatch_job(webhook, event_payload, config):
    dispatch_webhook(webhook, event_payload, config)


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
    executor = _get_executor(config)
    for webhook, event_payload in jobs:
        executor.submit(_dispatch_job, webhook, event_payload, config)

    logger.info("[webhook] queued %d dispatch job(s)", len(jobs))
    return len(jobs)
