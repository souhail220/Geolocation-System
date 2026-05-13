import logging

logger = logging.getLogger(__name__)

if __name__ == "__main__":
    from .config import LOG_LEVEL
    from .logging_config import configure_logging

    configure_logging(LOG_LEVEL)

    from .simulator import Simulator

    try:
        simulator = Simulator()
        simulator.run()
    except KeyboardInterrupt:
        logger.info("Simulator stopped by user (KeyboardInterrupt).")
    except Exception:
        logger.exception("Simulator exited with an unhandled error.")
        raise
