import hashlib


def payload_field(payload, primary_name, *fallback_names):
    for name in (primary_name, *fallback_names):
        if name in payload:
            return payload[name]
    raise KeyError(primary_name)


def radio_id(payload):
    return str(payload_field(payload, "id", "radio_id"))


def radio_hash(payload):
    battery = payload_field(payload, "battery")
    signal_strength = payload_field(payload, "signal_strength", "signalStrength")
    latitude = payload_field(payload, "latitude")
    longitude = payload_field(payload, "longitude")

    hash_input = f"{battery}|{signal_strength}|{latitude}|{longitude}"
    return hashlib.md5(hash_input.encode("utf-8")).hexdigest()


def snapshot_state(shared_state, state_lock):
    with state_lock:
        return [dict(payload) for payload in shared_state.values()]


def snapshot_row(payload, next_hash, changed_at):
    return radio_id(payload), next_hash, changed_at


def change_log_row(payload, changed_at):
    return (
        radio_id(payload),
        payload_field(payload, "serial_number", "serialNumber"),
        payload_field(payload, "name"),
        payload_field(payload, "team_id", "team"),
        payload_field(payload, "battery"),
        payload_field(payload, "signal_strength", "signalStrength"),
        payload_field(payload, "latitude"),
        payload_field(payload, "longitude"),
        payload_field(payload, "active"),
        payload_field(payload, "stolen", "isStolen"),
        payload_field(payload, "outsideZone"),
        changed_at,
    )


def change_log_payload(payload, changed_at):
    return {
        "radio_id": radio_id(payload),
        "serial_number": payload_field(payload, "serial_number", "serialNumber"),
        "name": payload_field(payload, "name"),
        "team_id": payload_field(payload, "team_id", "team"),
        "battery": payload_field(payload, "battery"),
        "signal_strength": payload_field(payload, "signal_strength", "signalStrength"),
        "lat": payload_field(payload, "latitude"),
        "lng": payload_field(payload, "longitude"),
        "active": payload_field(payload, "active"),
        "stolen": payload_field(payload, "stolen", "isStolen"),
        "outsideZone": payload_field(payload, "outsideZone"),
        "changed_at": changed_at,
    }
