import logging
import time

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy import text
from sqlalchemy.orm import selectinload

from app.configuration.config import (LOOP_SLEEP, SERVER_HOST, SERVER_PORT, SIMULATION_STATUS_LOG_INTERVAL_SECONDS, USE_TUNISIA_GEOFENCE_FALLBACK,)
from app.data.database import RadioModel, SessionLocal, TeamModel
from app.data.models import Team
from app.server.server import global_state, global_state_lock, start_server
from app.services.geofence_service import (MissingGeofenceError, add_tunisia_fallback_geofences, load_team_geofence_map, require_team_geofence)
from app.services.poller import start_poller

logger = logging.getLogger(__name__)


class Simulator:
    def __init__(self):
        self.teams = []

        logger.info("Opening database session for simulator initialization.")
        db = SessionLocal()
        try:
            try:
                logger.info("Checking database connection.")
                db.execute(text("SELECT 1"))
                logger.info("Database connection is ready.")

                logger.info("Counting teams and radios before loading simulator state.")
                team_count = db.query(TeamModel).count()
                radio_count = db.query(RadioModel).count()
                logger.info(
                    "Database contains %d team row(s) and %d radio row(s).",
                    team_count,
                    radio_count,
                )

                logger.info("Loading teams and radios from database.")
                db_teams = (
                    db.query(TeamModel)
                    .options(selectinload(TeamModel.radios))
                    .order_by(TeamModel.id)
                    .all()
                )
            except SQLAlchemyError:
                logger.exception("Database query failed while loading teams.")
                raise

            if not db_teams:
                logger.warning("No teams found in the database; simulator will run with zero teams.")
            else:
                logger.info("Loaded %d database team row(s).", len(db_teams))

            team_ids = [team.id for team in db_teams]
            logger.info("Loading PostGIS geofence geometry for %d team(s).", len(team_ids))
            team_geofences = load_team_geofence_map(db, team_ids)
            if USE_TUNISIA_GEOFENCE_FALLBACK:
                team_geofences, missing_geofence_team_ids = add_tunisia_fallback_geofences(
                    team_geofences,
                    team_ids,
                )
            else:
                missing_geofence_team_ids = [
                    team_id for team_id in team_ids if team_id not in team_geofences
                ]

            if missing_geofence_team_ids:
                if USE_TUNISIA_GEOFENCE_FALLBACK:
                    logger.warning(
                        "Using Tunisia fallback geofence for team id(s): %s",
                        ", ".join(str(team_id) for team_id in missing_geofence_team_ids),
                    )
                else:
                    raise MissingGeofenceError(
                        "Missing geofence geometry for team id(s): "
                        + ", ".join(str(team_id) for team_id in missing_geofence_team_ids)
                        + ". Run `python -m scripts.seed_geofences`, insert geofences rows, "
                        "or set USE_TUNISIA_GEOFENCE_FALLBACK=true."
                    )

            logger.info("Building simulation routes and radio state for %d team(s).", len(db_teams))
            for index, db_team in enumerate(db_teams, start=1):
                geofence = require_team_geofence(team_geofences, db_team.id)

                try:
                    logger.info(
                        "Preparing team %d/%d id=%s name=%r radios=%d.",
                        index,
                        len(db_teams),
                        db_team.id,
                        db_team.name,
                        len(db_team.radios)
                    )
                    team = Team(
                        team_model=db_team,
                        radio_models=db_team.radios,
                        geofence=geofence,
                    )
                    self.teams.append(team)
                    logger.info(
                        "Prepared team id=%s with %d radio(s) and %d route(s).",
                        team.id,
                        len(team.radios),
                        len(team.routes),
                    )
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
        start_poller(global_state, global_state_lock)
        logger.info("Radio change poller started.")
        logger.info("Main simulation loop running (sleep=%ss between ticks).", LOOP_SLEEP)
        logger.info(
            "Simulation status will be logged every %s second(s).",
            SIMULATION_STATUS_LOG_INTERVAL_SECONDS,
        )

        tick_count = 0
        next_status_log_time = time.time()
        total_radios = sum(len(team.radios) for team in self.teams)
        while True:
            tick_count += 1
            sent_payloads = 0
            for team in self.teams:
                for radio in team.radios:
                    try:
                        payload = radio.move_and_send()
                    except (ValueError, ConnectionError, TimeoutError) as ex:
                        logger.exception("Simulation step failed for radio_id=%s serial=%r error=%s",
                            getattr(radio, "id", None),
                            getattr(radio, "serial_number", None),
                            ex,
                        )
                        continue
                    if payload:
                        with global_state_lock:
                            global_state[payload["id"]] = payload
                        sent_payloads += 1

            now = time.time()
            if now >= next_status_log_time:
                active_radios = sum(
                    1 for team in self.teams for radio in team.radios if radio.active
                )
                logger.info(
                    "Simulating tick=%d teams=%d radios=%d active=%d payloads_sent=%d state_size=%d.",
                    tick_count,
                    len(self.teams),
                    total_radios,
                    active_radios,
                    sent_payloads,
                    self._state_size(),
                )
                next_status_log_time = now + SIMULATION_STATUS_LOG_INTERVAL_SECONDS

            time.sleep(LOOP_SLEEP)

    def _state_size(self):
        with global_state_lock:
            return len(global_state)
