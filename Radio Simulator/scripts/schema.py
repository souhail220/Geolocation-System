import logging
import os
from dotenv import load_dotenv
from sqlalchemy import (Boolean, Column, DateTime, Float, Index, Integer, MetaData, String, Table, create_engine, func,)

logger = logging.getLogger(__name__)

metadata = MetaData()

radio_snapshots = Table(
    "radio_snapshots",
    metadata,
    Column("radio_id", String, primary_key=True),
    Column("last_hash", String, nullable=False),
    Column("changed_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)

radio_change_log = Table(
    "radio_change_log",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("radio_id", String, nullable=False),
    Column("serial_number", String, nullable=False),
    Column("name", String, nullable=False),
    Column("team_id", Integer, nullable=False),
    Column("battery", Float, nullable=False),
    Column("signal_strength", Float, nullable=False),
    Column("lat", Float, nullable=False),
    Column("lng", Float, nullable=False),
    Column("active", Boolean, nullable=False),
    Column("stolen", Boolean, nullable=False),
    # PostgreSQL folds unquoted outsideZone references to outsidezone.
    Column("outsidezone", Boolean, nullable=False),
    Column("changed_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)

Index("idx_change_log_changed_at", radio_change_log.c.changed_at)

webhooks = Table(
    "webhooks",
    metadata,
    Column("id", Integer, primary_key=True, autoincrement=True),
    Column("url", String, nullable=False),
    Column("event_type", String, nullable=False),
    Column("created_at", DateTime(timezone=True), nullable=False, server_default=func.now()),
)


def apply_schema(engine):
    logger.info("Creating or verifying simulator extension tables.")
    metadata.create_all(bind=engine)
    logger.info("Simulator extension tables created or verified.")


def main():
    load_dotenv()
    logging.basicConfig(
        level=os.getenv("LOG_LEVEL", "INFO"),
        format="%(asctime)s | %(levelname)-8s | %(name)s | %(message)s",
    )

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL is not set in the environment or .env file")

    engine = create_engine(database_url, pool_pre_ping=True)
    apply_schema(engine)


if __name__ == "__main__":
    main()
