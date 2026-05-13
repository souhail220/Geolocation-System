import logging

from app.configuration.config import LOG_LEVEL, SERVER_HOST, TEAMS_SERVER_PORT
from app.configuration.logging_config import configure_logging
from app.data.teams_server import run_teams_server

logger = logging.getLogger(__name__)


if __name__ == "__main__":
    configure_logging(LOG_LEVEL)
    try:
        run_teams_server(SERVER_HOST, TEAMS_SERVER_PORT)
    except KeyboardInterrupt:
        logger.info("Teams server stopped by user (KeyboardInterrupt).")
    except Exception:
        logger.exception("Teams server exited with an unhandled error.")
        raise
