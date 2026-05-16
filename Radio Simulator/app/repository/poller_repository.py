from datetime import datetime, timezone

import psycopg2
from psycopg2.extras import execute_values

from app.services.poller_payload import (
    change_log_payload,
    change_log_row,
    radio_hash,
    radio_id,
    snapshot_row,
)


def load_snapshot_hashes(cursor, radio_ids):
    if not radio_ids:
        return {}

    cursor.execute(
        """
        SELECT radio_id, last_hash
        FROM radio_snapshots
        WHERE radio_id = ANY(%s)
        """,
        (radio_ids,),
    )
    return dict(cursor.fetchall())


def changed_radios(cursor, radios):
    if not radios:
        return []

    hashes_by_radio_id = {
        radio_id(payload): radio_hash(payload)
        for payload in radios
    }
    stored_hashes = load_snapshot_hashes(cursor, list(hashes_by_radio_id.keys()))

    changed = []
    for payload in radios:
        current_radio_id = radio_id(payload)
        next_hash = hashes_by_radio_id[current_radio_id]
        if stored_hashes.get(current_radio_id) != next_hash:
            changed.append((payload, next_hash))

    return changed


def upsert_changes(cursor, changed):
    changed_at = datetime.now(timezone.utc)
    snapshot_rows = [
        snapshot_row(payload, next_hash, changed_at)
        for payload, next_hash in changed
    ]
    log_rows = [
        change_log_row(payload, changed_at)
        for payload, _ in changed
    ]

    execute_values(
        cursor,
        """
        INSERT INTO radio_snapshots (radio_id, last_hash, changed_at)
        VALUES %s
        ON CONFLICT (radio_id)
        DO UPDATE SET
          last_hash = EXCLUDED.last_hash,
          changed_at = EXCLUDED.changed_at
        """,
        snapshot_rows,
    )

    execute_values(
        cursor,
        """
        INSERT INTO radio_change_log (
          radio_id,
          serial_number,
          name,
          team_id,
          battery,
          signal_strength,
          lat,
          lng,
          active,
          stolen,
          outsideZone,
          changed_at
        )
        VALUES %s
        """,
        log_rows,
    )

    return [
        change_log_payload(payload, changed_at)
        for payload, _ in changed
    ]


def persist_changed_radios(database_url, radios):
    with psycopg2.connect(database_url) as connection:
        with connection.cursor() as cursor:
            changed = changed_radios(cursor, radios)
            if changed:
                return upsert_changes(cursor, changed)
            return []
