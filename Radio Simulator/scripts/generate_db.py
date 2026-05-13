import logging
import os
import random
import sys
from datetime import datetime, timezone

import shortuuid
from dotenv import load_dotenv
from faker import Faker
from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text, create_engine
from sqlalchemy.orm import declarative_base, relationship, sessionmaker

from app.logging_config import configure_logging

load_dotenv()
configure_logging(os.getenv("LOG_LEVEL", "INFO"))

logger = logging.getLogger(__name__)

# Get Neon PostgreSQL connection string
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    logger.error("DATABASE_URL is not set; configure it in the environment or .env file.")
    raise ValueError("DATABASE_URL is not set in the .env file")

# SQLAlchemy setup
Base = declarative_base()
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))

    # Relationship to Radios
    radios = relationship("Radio", back_populates="team", cascade="all, delete")


class Radio(Base):
    __tablename__ = "radios"

    id = Column(String(22), primary_key=True, default=lambda: shortuuid.uuid())
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    is_stolen = Column(Boolean, default=False)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    team_id = Column(Integer, ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)

    # Relationship back to Team
    team = relationship("Team", back_populates="radios")


def generate_database(num_teams=5, radios_per_team=50):
    logger.info("Initializing database schema (create_all if needed)...")
    Base.metadata.create_all(bind=engine)
    logger.info("Tables created or verified.")

    db = SessionLocal()
    fake = Faker()

    logger.info("Generating %d teams with %d radios each...", num_teams, radios_per_team)

    try:
        for _ in range(num_teams):
            # 1. Create Team
            new_team = Team(
                name=f"Team {fake.company()}",
                description=fake.catch_phrase()
            )
            db.add(new_team)
            db.commit()      # Commit to get the new_team.id assigned by PostgreSQL
            db.refresh(new_team)

            # 2. Assign Radios to that Team
            radios = []
            for _ in range(radios_per_team):
                radio = Radio(
                    id=shortuuid.uuid(),
                    serial_number=fake.unique.bothify(text='RAD-####-????-####', letters='ABCDEFGHIJKLMNOPQRSTUVWXYZ'),
                    name=fake.word().capitalize() + " Tracker",
                    is_stolen=random.random() < 0.05,  # 5% chance of being stolen
                    team_id=new_team.id
                )
                radios.append(radio)
            
            # Bulk save the radios for this team
            db.add_all(radios)
            db.commit()

        logger.info("Successfully generated and committed fake data.")
    except Exception:
        db.rollback()
        logger.exception("Database generation failed; rolled back the current transaction.")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    try:
        generate_database(num_teams=20, radios_per_team=250)
    except Exception:
        sys.exit(1)
