import os
from dataclasses import dataclass
from app.configuration.database_config import get_database_url


@dataclass(frozen=True)
class PollerConfig:
    database_url: str
    interval_seconds: int = 30
    change_log_retention_hours: int = 24


def load_poller_config(interval_seconds=None, database_url=None):
    return PollerConfig(
        database_url=database_url or get_database_url(),
        interval_seconds=interval_seconds
        if interval_seconds is not None
        else int(os.getenv("POLLER_INTERVAL_SECONDS", "60")),
        change_log_retention_hours=int(
            os.getenv("RADIO_CHANGE_LOG_RETENTION_HOURS", "24")
        ),
    )
