# Radio Fleet Simulator

A Python-based simulator for tracking a fleet of radios with dynamic movement, battery drain, and signal strength simulation.

## Prerequisites

- Python 3.14+
- PostgreSQL database (e.g., Neon.tech)

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

## Features

- **Dynamic Movement**: Radios move within team geofences loaded from PostGIS.
- **Battery Simulation**: Realistic battery drain over time.
- **Signal Strength**: Dynamically calculated based on distance from base station.
- **Geofencing**: Detection of radios moving outside their assigned zones.
