import logging
import os

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

load_dotenv()

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.error("DATABASE_URL is not set; configure it in the environment or .env file.")
    raise ValueError("DATABASE_URL is not set in the .env file")

# pool_pre_ping avoids using stale connections after DB idle timeouts
engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Models must perfectly match the ones used in `scripts/generate_db.py`
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship

class TeamModel(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime)

    radios = relationship("RadioModel", back_populates="team")


class RadioModel(Base):
    __tablename__ = "radios"

    id = Column(String(22), primary_key=True)
    serial_number = Column(String(100), unique=True, nullable=False, index=True)
    name = Column(String(255), nullable=False)
    is_stolen = Column(Boolean, default=False)
    created_at = Column(DateTime)
    team_id = Column(Integer, ForeignKey("teams.id"), nullable=False)

    team = relationship("TeamModel", back_populates="radios")

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
