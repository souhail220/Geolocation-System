from datetime import datetime, timezone

from app.configuration.database_config import get_database_url
from app.repository.radio_status_repository import fetch_radio_changes_since


def parse_since(value):
    if not value:
        raise ValueError("Missing required query parameter: since")

    normalized = value.replace(" ", "+").replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(normalized)
    except ValueError as exc:
        raise ValueError("since must be an ISO 8601 timestamp") from exc

    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


def _isoformat(value):
    if isinstance(value, datetime):
        return (
            value
            .astimezone(timezone.utc)
            .replace(microsecond=0)
            .isoformat()
            .replace("+00:00", "Z")
        )
    return value


def _serialize_change(row):
    row = dict(row)
    row["changed_at"] = _isoformat(row["changed_at"])
    return row


def radio_status_since(since_value, database_url=None):
    since = parse_since(since_value)
    rows = fetch_radio_changes_since(database_url or get_database_url(), since)
    changed = [_serialize_change(row) for row in rows]

    if changed:
        next_since = changed[-1]["changed_at"]
    else:
        next_since = _isoformat(datetime.now(timezone.utc))

    return {
        "next_since": next_since,
        "count": len(changed),
        "changed": changed,
    }
