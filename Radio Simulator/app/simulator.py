import random
import time
from .models import Team
from .config import BASE_LAT, BASE_LON, LOOP_SLEEP, SERVER_HOST, SERVER_PORT
from .server import start_server, global_state
from .database import SessionLocal, TeamModel

class Simulator:
    def __init__(self):
        self.teams = []

        db = SessionLocal()
        try:
            # Query all teams, and eagerly load the associated radios to prevent N+1 queries
            db_teams = db.query(TeamModel).all()
            for db_team in db_teams:
                team = Team(
                    team_model=db_team,
                    radio_models=db_team.radios,
                    center_lat=BASE_LAT + random.uniform(-0.5, 0.5),
                    center_lon=BASE_LON + random.uniform(-0.5, 0.5)
                )
                self.teams.append(team)
        finally:
            db.close()

    def run(self):
        print("🚀 Radio Fleet Simulator Started")
        print(f"Teams: {len(self.teams)}")
        
        # Start the local HTTP server in a background thread
        start_server(SERVER_HOST, SERVER_PORT)

        print("Running...")

        while True:
            for team in self.teams:
                for radio in team.radios:
                    payload = radio.move_and_send()
                    if payload:
                        # Update the centralized state for the server to serve
                        global_state[payload["radioId"]] = payload

            time.sleep(LOOP_SLEEP)