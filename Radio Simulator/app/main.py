import logging
from app.configuration.config import LOG_LEVEL
from app.configuration.logging_config import configure_logging
from app.services.simulator import Simulator

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    configure_logging(LOG_LEVEL)
    try:
        logger.info("Starting Radio Fleet Simulator application (log_level=%s).", LOG_LEVEL)
        logger.info("Creating simulator state from database and geofences.")
        simulator = Simulator()
        logger.info("Simulator state is ready; starting HTTP server and simulation loop.")
        simulator.run()
    except KeyboardInterrupt:
        logger.info("Simulator stopped by user (KeyboardInterrupt).")
    except Exception:
        logger.exception("Simulator exited with an unhandled error.")
        raise
