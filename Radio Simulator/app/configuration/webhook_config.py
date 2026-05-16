import os
from dataclasses import dataclass


@dataclass(frozen=True)
class WebhookConfig:
    timeout_seconds: float = 5
    max_workers: int = 10
    backoff_seconds: tuple[int, ...] = (1, 2, 4)


def load_webhook_config():
    return WebhookConfig(
        timeout_seconds=float(os.getenv("WEBHOOK_TIMEOUT_SECONDS", "5")),
        max_workers=int(os.getenv("WEBHOOK_MAX_WORKERS", "10")),
    )
