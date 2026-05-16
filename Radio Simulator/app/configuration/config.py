import os

# Logging (read by app entrypoints; logging_config also reads LOG_LEVEL from env)
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").strip()

# Simulation scale
ROUTES_PER_TEAM = 5

# Location base (example: Sfax area)
BASE_LAT = 34.740
BASE_LON = 10.760

# Spatial data
GEOFENCE_SRID = int(os.getenv("GEOFENCE_SRID", "4326"))
USE_TUNISIA_GEOFENCE_FALLBACK = (
    os.getenv("USE_TUNISIA_GEOFENCE_FALLBACK", "true").lower() == "true"
)
TUNISIA_FALLBACK_GEOFENCE_NAME = "Tunisia National Fallback Geofence"
TUNISIA_FALLBACK_GEOFENCE_COORDINATES = [
    (8.58, 37.35),
    (10.15, 37.35),
    (11.15, 36.95),
    (11.08, 36.25),
    (10.92, 35.55),
    (10.95, 34.55),
    (11.35, 33.55),
    (11.60, 33.15),
    (10.35, 30.25),
    (8.40, 30.25),
    (7.50, 32.20),
    (7.55, 34.10),
    (8.20, 36.00),
    (8.58, 37.35),
]

# Route generation
ROUTE_WAYPOINTS = int(os.getenv("ROUTE_WAYPOINTS", "3"))
ROUTE_FALLBACK_POINT_MULTIPLIER = int(os.getenv("ROUTE_FALLBACK_POINT_MULTIPLIER", "5"))
ROUTE_RANDOM_POINT_MAX_ATTEMPTS = int(os.getenv("ROUTE_RANDOM_POINT_MAX_ATTEMPTS", "1000"))
OSRM_BASE_URL = os.getenv("OSRM_BASE_URL", "http://router.project-osrm.org").rstrip("/")
OSRM_PROFILE = os.getenv("OSRM_PROFILE", "driving").strip()
OSRM_TIMEOUT_SECONDS = float(os.getenv("OSRM_TIMEOUT_SECONDS", "5"))

# Occasional simulated geofence violations
GEOFENCE_VIOLATION_PROBABILITY = float(os.getenv("GEOFENCE_VIOLATION_PROBABILITY", "0.02"))
GEOFENCE_VIOLATION_OFFSET_RANGE = (0.02, 0.05)

# Server Configuration
SERVER_HOST = "localhost"
SERVER_PORT = 80
TEAMS_SERVER_PORT = 81

# Timing
LOOP_SLEEP = 1
SEND_INTERVAL_RANGE = (5, 15)
SIMULATION_STATUS_LOG_INTERVAL_SECONDS = int(
    os.getenv("SIMULATION_STATUS_LOG_INTERVAL_SECONDS", "10")
)
