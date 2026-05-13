"""Central logging setup: one handler, ISO-style timestamps, lazy % formatting."""

import logging
import os
import sys

_DEFAULT_FORMAT = (
    "%(asctime)s | %(levelname)-8s | %(name)s | %(message)s"
)
_DEFAULT_DATEFMT = "%Y-%m-%d %H:%M:%S"


def configure_logging(level: str | None = None) -> None:
    """
    Configure the root logger once. Call at process entry (main, scripts).

    Level: explicit arg, else env LOG_LEVEL, else INFO.
    Uses %%-style messages in log calls so arguments are not built when the level is disabled.
    """
    raw = (level or os.getenv("LOG_LEVEL", "INFO")).strip().upper()
    numeric = getattr(logging, raw, None)
    if not isinstance(numeric, int):
        numeric = logging.INFO

    root = logging.getLogger()
    root.setLevel(numeric)

    if root.handlers:
        for handler in root.handlers:
            handler.setLevel(numeric)
        return

    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(numeric)
    handler.setFormatter(logging.Formatter(_DEFAULT_FORMAT, datefmt=_DEFAULT_DATEFMT))
    root.addHandler(handler)

    # Reduce noise from third-party libraries unless DEBUG
    if numeric > logging.DEBUG:
        logging.getLogger("urllib3").setLevel(logging.WARNING)
