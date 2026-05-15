import logging
import random
import time

from sqlalchemy.exc import SQLAlchemyError

from app.configuration.config import BASE_LAT, BASE_LON, LOOP_SLEEP, SERVER_HOST, SERVER_PORT
from app.data.database import SessionLocal, TeamModel
from app.data.models import Team
from app.data.server import global_state, start_server

logger = logging.getLogger(__name__)


class Simulator:
    def __init__(self):
        self.teams = []

        db = SessionLocal()
        try:
            try:
                db_teams = db.query(TeamModel).all()
            except SQLAlchemyError:
                logger.exception("Database query failed while loading teams.")
                raise

            if not db_teams:
                logger.warning("No teams found in the database; simulator will run with zero teams.")

            for db_team in db_teams:
                try:
                    team = Team(
                        team_model=db_team,
                        radio_models=db_team.radios,
                        center_lat=BASE_LAT + random.uniform(-0.5, 0.5),
                        center_lon=BASE_LON + random.uniform(-0.5, 0.5),
                    )
                    self.teams.append(team)
                except Exception:
                    logger.exception(
                        "Failed to build simulator state for team id=%s name=%r",
                        getattr(db_team, "id", None),
                        getattr(db_team, "name", None),
                    )
                    raise

            total_radios = sum(len(t.radios) for t in self.teams)
            logger.info(
                "Loaded %d team(s) with %d radio(s) from the database.",
                len(self.teams),
                total_radios,
            )
        finally:
            db.close()

    def run(self):
        logger.info("Radio fleet simulator started.")
        start_server(SERVER_HOST, SERVER_PORT)
        logger.info("Main simulation loop running (sleep=%ss between ticks).", LOOP_SLEEP)

        while True:
            for team in self.teams:
                for radio in team.radios:
                    try:
                        payload = radio.move_and_send()
                    except Exception:
                        logger.exception(
                            "Simulation step failed for radio_id=%s serial=%r",
                            getattr(radio, "id", None),
                            getattr(radio, "serial_number", None),
                        )
                        continue
                    if payload:
                        global_state[payload["id"]] = payload

            time.sleep(LOOP_SLEEP)