from datetime import datetime, timezone

from app.configuration.config import SIGNAL_LOST_THRESHOLD_DBM


def matching_event_types(radio):
    events = []

    if radio["battery"] <= 0 or radio["active"] is False:
        events.append("radio_inactive")

    if radio["battery"] < 10 and radio["active"] is True:
        events.append("battery_critical")

    if radio["signal_strength"] < SIGNAL_LOST_THRESHOLD_DBM:
        events.append("signal_lost")

    if radio["outsideZone"] is True:
        events.append("geo_breach")

    if radio["stolen"] is True:
        events.append("radio_stolen")

    return events


def build_event_payload(event_type, radio, triggered_at=None):
    triggered_at = triggered_at or datetime.now(timezone.utc)
    return {
        "event_type": event_type,
        "radio_id": radio["radio_id"],
        "team_id": radio["team_id"],
        "serial_number": radio["serial_number"],
        "payload": {
            "battery": radio["battery"],
            "signal_strength": radio["signal_strength"],
            "lat": radio["lat"],
            "lng": radio["lng"],
            "active": radio["active"],
            "stolen": radio["stolen"],
            "outsideZone": radio["outsideZone"],
        },
        "triggered_at": triggered_at.isoformat(),
    }


def build_radio_events(changed_radios):
    radio_events = []
    triggered_at = datetime.now(timezone.utc)

    for radio in changed_radios:
        for event_type in matching_event_types(radio):
            radio_events.append((event_type, radio, build_event_payload(event_type, radio, triggered_at)))

    return radio_events
