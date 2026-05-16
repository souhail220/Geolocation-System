import os

from dotenv import load_dotenv


def get_database_url():
    load_dotenv()
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise ValueError("DATABASE_URL is not set in the environment or .env file")
    return database_url
