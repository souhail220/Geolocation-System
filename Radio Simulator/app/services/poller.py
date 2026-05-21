import logging
import threading
import time

from app.configuration.poller_config import load_poller_config
from app.repository.poller_repository import cleanup_old_change_logs, persist_changed_radios
from app.services.poller_payload import snapshot_state
from app.services.webhook_dispatcher import dispatch_events

logger = logging.getLogger(__name__)


def poll_once(shared_state, state_lock, database_url=None, config=None):
    config = config or load_poller_config(database_url=database_url)
    radios = snapshot_state(shared_state, state_lock)

    if not radios:
        logger.info("[poller] 0 / 0 changed")
        return 0

    changed_radios = persist_changed_radios(config.database_url, radios)
    dispatch_events(changed_radios)
    deleted_logs = cleanup_old_change_logs(
        config.database_url,
        config.change_log_retention_hours,
    )
    if deleted_logs:
        logger.info("[poller] cleaned %d old radio_change_log rows", deleted_logs)

    logger.info("[poller] %d / %d changed", len(changed_radios), len(radios))
    return len(changed_radios)


def run_poller(shared_state, state_lock, interval_seconds=None, stop_event=None, config=None):
    config = config or load_poller_config(interval_seconds)
    logger.info("[poller] started interval=%ss", config.interval_seconds)

    while stop_event is None or not stop_event.is_set():
        try:
            poll_once(shared_state, state_lock, config=config)
        except Exception:
            logger.exception("[poller] cycle failed")

        if stop_event is not None:
            stop_event.wait(config.interval_seconds)
        else:
            time.sleep(config.interval_seconds)


def start_poller(shared_state, state_lock, interval_seconds=None):
    config = load_poller_config(interval_seconds)
    thread = threading.Thread(
        target=run_poller,
        kwargs={
            "shared_state": shared_state,
            "state_lock": state_lock,
            "config": config,
        },
        daemon=True,
        name="radio-change-poller",
    )
    thread.start()
    return thread
