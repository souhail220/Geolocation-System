import os
from dataclasses import dataclass


@dataclass(frozen=True)
class WebhookConfig:
    timeout_seconds: float = 5
    max_workers: int = 10
    retry_initial_delay_seconds: float = 1
    retry_max_delay_seconds: float = 60


def load_webhook_config():
    return WebhookConfig(
        timeout_seconds=float(os.getenv("WEBHOOK_TIMEOUT_SECONDS", "5")),
        max_workers=int(os.getenv("WEBHOOK_MAX_WORKERS", "10")),
        retry_initial_delay_seconds=float(
            os.getenv("WEBHOOK_RETRY_INITIAL_DELAY_SECONDS", "1")
        ),
        retry_max_delay_seconds=float(os.getenv("WEBHOOK_RETRY_MAX_DELAY_SECONDS", "60")),
    )
