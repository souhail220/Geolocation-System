import os

# Logging (read by app entrypoints; logging_config also reads LOG_LEVEL from env)
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").strip()

# Simulation scale
ROUTES_PER_TEAM = 5
ZONES_PER_TEAM_RANGE = (1, 3)

# Location base (example: Sfax area)
BASE_LAT = 34.740
BASE_LON = 10.760

# Server Configuration
SERVER_HOST = "localhost"
SERVER_PORT = 80
TEAMS_SERVER_PORT = 81

# Timing
LOOP_SLEEP = 1
SEND_INTERVAL_RANGE = (5, 15)
