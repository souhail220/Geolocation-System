import logging
from app.configuration.config import LOG_LEVEL
from app.configuration.logging_config import configure_logging
from app.services.simulator import Simulator

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    configure_logging(LOG_LEVEL)
    try:
        simulator = Simulator()
        simulator.run()
    except KeyboardInterrupt:
        logger.info("Simulator stopped by user (KeyboardInterrupt).")
    except Exception:
        logger.exception("Simulator exited with an unhandled error.")
        raise
