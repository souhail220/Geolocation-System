# Radio Fleet Simulator

A Python-based simulator for tracking a fleet of radios with dynamic movement, battery drain, and signal strength simulation.

## Prerequisites

- Python 3.14+
- PostgreSQL database with PostGIS enabled (e.g., Neon.tech)

## Setup Instructions

### 1. Clone the Repository

```bash
git clone <repository-url>
cd "Radio Simulator"
```

### 2. Create and Activate Virtual Environment

```bash
python -m venv venv
# Windows
.\venv\Scripts\activate
# Linux/macOS
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Environment Variables

Create a `.env` file from the provided template:

```bash
cp .env.example .env
```

Edit the `.env` file and provide your `DATABASE_URL`.

### 5. Initialize Database

Run the database generation script to create tables and populate them with initial data:

```bash
python -m scripts.generate_db
```

To seed Tunisian geofence polygons after teams exist:

```bash
python -m scripts.seed_geofences
```

The geofence seed keeps exactly one geofence per existing team. If duplicate
geofences already exist for a team, the script removes the older duplicates
before inserting or updating the current seed data.

### 6. Run the Simulator

Start the radio simulation:

```bash
python -m app.main
```

The simulator now uses `geofences.geom` as the movement area for each team.
Run `python -m scripts.seed_geofences` after creating teams to give every team
its own operational area. If a team has no geofence row, the simulator uses a
Tunisia-wide fallback geofence by default. To make missing geofences a startup
error instead, set `USE_TUNISIA_GEOFENCE_FALLBACK=false`.

While running, the simulator logs startup, database loading, route preparation,
and periodic simulation status. Set `SIMULATION_STATUS_LOG_INTERVAL_SECONDS` to
change how often the simulation heartbeat is printed.

### 7. Run the Teams and Geofences Endpoint

Start the secondary teams/geofences endpoint on port 81:

```bash
python -m app.teams_main
```

Read teams data from:

```text
http://localhost:81/teams
```

Read geofence data from:

```text
http://localhost:81/geofences
```

The main simulator HTTP server on port 80 returns the latest in-memory radio
state:

```text
http://localhost:80
```

It also exposes persisted radio changes from `radio_change_log`:

```text
http://localhost:80/radios/status?since=2026-05-16T15:00:00Z
```

The `since` query parameter is required and must be an ISO 8601 timestamp.

The teams endpoint returns JSON in this shape:

```json
{
  "id": 1,
  "name": "Team Example",
  "description": "Example description",
  "createdAt": "2026-05-13T15:32:01",
  "radioCount": 250
}
```

The geofences endpoint returns JSON in this shape:

```json
{
  "id": "2fcfca46-f29f-4eb2-a21a-59067c89935e",
  "name": "Tataouine Southern Desert Sector",
  "geom": {
    "type": "Polygon",
    "coordinates": [
      [
        [9.35, 30.3],
        [10.65, 30.3],
        [10.65, 32.25],
        [9.35, 32.25],
        [9.35, 30.3]
      ]
    ]
  },
  "teamId": 3,
  "createdAt": "2026-05-10T14:43:49+00:00"
}
```

The radio status endpoint returns JSON in this shape:

```json
{
  "next_since": "2026-05-16T15:40:30+00:00",
  "count": 1,
  "changed": [
    {
      "radio_id": "R-042",
      "serial_number": "RAD-1234-ABCD-5678",
      "name": "Alpha Tracker",
      "team_id": 3,
      "battery": 82.5,
      "signal_strength": -74.0,
      "lat": 34.7401,
      "lng": 10.7601,
      "active": true,
      "stolen": false,
      "outsideZone": false,
      "changed_at": "2026-05-16T15:40:30+00:00"
    }
  ]
}
```

## Poller and Webhooks

The poller service reads the shared in-memory radio state every
`POLLER_INTERVAL_SECONDS` seconds, hashes `battery`, `signal_strength`,
`latitude`, and `longitude`, and writes only changed radios to:

- `radio_snapshots`
- `radio_change_log`

It logs each cycle like:

```text
[poller] 47 / 5000 changed
```

The poller is exposed as a reusable service:

```python
from app.services.poller import start_poller

start_poller(global_state, global_state_lock)
```

Webhook registrations are stored in the `webhooks` table:

```sql
INSERT INTO webhooks (url, event_type)
VALUES ('https://example.com/webhook', 'geo_breach');
```

Supported webhook event types:

- `radio_inactive`
- `battery_critical`
- `signal_lost`
- `geo_breach`
- `radio_stolen`

Webhook calls are dispatched concurrently and retried with exponential backoff.

## Features

- **Dynamic Movement**: Radios move within team geofences loaded from PostGIS.
- **Battery Simulation**: Realistic battery drain over time.
- **Signal Strength**: Dynamically calculated based on distance from base station.
- **Geofencing**: Detection of radios moving outside their assigned zones.
- **Change Polling**: Stores only changed radio snapshots and exposes status deltas.
- **Webhook Dispatching**: Sends event notifications for inactive radios, critical batteries, signal loss, geofence breaches, and stolen radios.
