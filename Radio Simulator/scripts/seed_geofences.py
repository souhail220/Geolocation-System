import logging
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from sqlalchemy import create_engine, text
from app.configuration.logging_config import configure_logging

load_dotenv()
configure_logging(os.getenv("LOG_LEVEL", "INFO"))

logger = logging.getLogger(__name__)

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    logger.error("DATABASE_URL is not set; configure it in the environment or .env file.")
    raise ValueError("DATABASE_URL is not set in the .env file")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)


def created_days_ago(days):
    return datetime.now(timezone.utc) - timedelta(days=days)


GEOFENCES = [
    # Tunis metro area: small city-level polygon covering central Tunis, Ariana, and Ben Arous.
    {
        "name": "Tunis Metro Operations",
        "wkt": "POLYGON((10.1100 36.7600, 10.3000 36.7600, 10.3000 36.9000, 10.1100 36.9000, 10.1100 36.7600))",
        "team_index": 0,
        "created_at": created_days_ago(168),
    },
    # Greater Tunis / Cap Bon western approach: intentionally overlaps Tunis Metro Operations.
    {
        "name": "Greater Tunis Cap Bon Approach",
        "wkt": "POLYGON((9.9500 36.6500, 10.5200 36.6500, 10.5200 37.0300, 9.9500 37.0300, 9.9500 36.6500))",
        "team_index": 0,
        "created_at": created_days_ago(152),
    },
    # Sfax urban area: small city-level polygon around central Sfax and nearby industrial/coastal districts.
    {
        "name": "Sfax Urban Sector",
        "wkt": "POLYGON((10.6600 34.6900, 10.8400 34.6900, 10.8400 34.8300, 10.6600 34.8300, 10.6600 34.6900))",
        "team_index": 1,
        "created_at": created_days_ago(141),
    },
    # Sousse / Monastir coastal zone: medium coastal region around Sousse, Monastir, and nearby towns.
    {
        "name": "Sousse Monastir Coastal Sector",
        "wkt": "POLYGON((10.4000 35.6500, 10.9200 35.6500, 10.9200 36.0000, 10.4000 36.0000, 10.4000 35.6500))",
        "team_index": 1,
        "created_at": created_days_ago(128),
    },
    # Djerba island: medium polygon approximating the island and immediate coastal perimeter.
    {
        "name": "Djerba Island Patrol Zone",
        "wkt": "POLYGON((10.7200 33.6500, 11.1800 33.6500, 11.1800 34.0200, 10.7200 34.0200, 10.7200 33.6500))",
        "team_index": 2,
        "created_at": created_days_ago(119),
    },
    # Algerian border corridor: large western security corridor from Kasserine toward Jendouba/El Kef.
    {
        "name": "Algerian Border North Corridor",
        "wkt": "POLYGON((7.5200 35.0000, 8.6500 35.0000, 8.6500 36.9500, 7.5200 36.9500, 7.5200 35.0000))",
        "team_index": 0,
        "created_at": created_days_ago(101),
    },
    # Algerian border / Gafsa-Tozeur corridor: large western-southwestern desert and mountain approach.
    {
        "name": "Algerian Border South Corridor",
        "wkt": "POLYGON((7.5500 33.6000, 8.7500 33.6000, 8.7500 35.0500, 7.5500 35.0500, 7.5500 33.6000))",
        "team_index": 2,
        "created_at": created_days_ago(88),
    },
    # Libyan border corridor: large southeastern corridor around Ben Gardane and the Ras Ajdir crossing.
    {
        "name": "Libyan Border Ben Gardane Corridor",
        "wkt": "POLYGON((10.7500 32.9500, 11.5900 32.9500, 11.5900 33.7200, 10.7500 33.7200, 10.7500 32.9500))",
        "team_index": 1,
        "created_at": created_days_ago(74),
    },
    # Gulf of Gabes coastal zone: medium coastal polygon around Gabes, Skhira, and nearby gulf shoreline.
    {
        "name": "Gulf of Gabes Coastal Zone",
        "wkt": "POLYGON((9.9000 33.6500, 10.9200 33.6500, 10.9200 34.4500, 9.9000 34.4500, 9.9000 33.6500))",
        "team_index": 2,
        "created_at": created_days_ago(59),
    },
    # Chott el Djerid salt lake region: large polygon around Tozeur, Nefta, Kebili, and the salt flat.
    {
        "name": "Chott el Djerid Salt Lake Region",
        "wkt": "POLYGON((7.8500 33.5500, 9.3000 33.5500, 9.3000 34.2500, 7.8500 34.2500, 7.8500 33.5500))",
        "team_index": 0,
        "created_at": created_days_ago(47),
    },
    # Kairouan inland operations zone: medium inland central Tunisia polygon.
    {
        "name": "Kairouan Inland Operations",
        "wkt": "POLYGON((9.6500 35.3000, 10.3500 35.3000, 10.3500 35.9500, 9.6500 35.9500, 9.6500 35.3000))",
        "team_index": 0,
        "created_at": created_days_ago(33),
    },
    # Bizerte northern coastal corridor: intentionally overlaps Greater Tunis Cap Bon Approach.
    {
        "name": "Bizerte Northern Coastal Corridor",
        "wkt": "POLYGON((9.4500 36.9500, 10.2500 36.9500, 10.2500 37.3800, 9.4500 37.3800, 9.4500 36.9500))",
        "team_index": 1,
        "created_at": created_days_ago(22),
    },
    # Nabeul / Hammamet tourism and coastal area: intentionally touches/overlaps Greater Tunis Cap Bon Approach.
    {
        "name": "Nabeul Hammamet Coastal Sector",
        "wkt": "POLYGON((10.4500 36.2500, 11.0500 36.2500, 11.0500 36.7500, 10.4500 36.7500, 10.4500 36.2500))",
        "team_index": 1,
        "created_at": created_days_ago(11),
    },
    # Tataouine southern desert region: large southern desert polygon near Tataouine and Remada.
    {
        "name": "Tataouine Southern Desert Sector",
        "wkt": "POLYGON((9.3500 30.3000, 10.6500 30.3000, 10.6500 32.2500, 9.3500 32.2500, 9.3500 30.3000))",
        "team_index": 2,
        "created_at": created_days_ago(3),
    },
]


def verify_reference_tables(connection):
    errors = []

    tables = connection.execute(
        text(
            """
            SELECT table_name
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = 'teams'
            """
        )
    ).scalars().all()

    missing = sorted({"teams"} - set(tables))
    if missing:
        errors.append(
            "missing required referenced table(s): " + ", ".join(missing)
        )

    team_id_type = connection.execute(
        text(
            """
            SELECT data_type
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'teams'
              AND column_name = 'id'
            """
        )
    ).scalar_one_or_none()

    if team_id_type is None:
        errors.append("teams.id is missing")
    elif team_id_type not in ("integer", "bigint"):
        errors.append(
            "teams.id must be integer-compatible for this simulator seed: "
            f"teams.id is {team_id_type}"
        )

    if errors:
        raise RuntimeError(
            "Cannot create geofences with the requested schema in this database. "
            + " ".join(errors)
            + ". This simulator seed uses team_id INTEGER REFERENCES teams(id), "
            "so public.teams(id) must be integer-compatible."
        )


def setup_schema(connection):
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS pgcrypto"))
    connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
    verify_reference_tables(connection)

    connection.execute(
        text(
            """
            CREATE TABLE IF NOT EXISTS geofences (
              id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
              name       VARCHAR(100) NOT NULL,
              geom       geography(Polygon, 4326) NOT NULL,
              team_id    INTEGER REFERENCES teams(id) ON DELETE CASCADE,
              created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
            """
        )
    )

    connection.execute(
        text("CREATE INDEX IF NOT EXISTS idx_geofences_geom ON geofences USING GIST(geom)")
    )

    constraints = [
        (
            "name_not_empty",
            """
            ALTER TABLE geofences
            ADD CONSTRAINT name_not_empty CHECK (char_length(trim(name)) > 0)
            """,
        ),
        (
            "geom_within_tunisia_bbox",
            """
            ALTER TABLE geofences
            ADD CONSTRAINT geom_within_tunisia_bbox CHECK (
              ST_Within(
                geom::geometry,
                ST_MakeEnvelope(7.0, 29.5, 12.0, 38.0, 4326)
              )
            )
            """,
        ),
        (
            "name_unique_per_team",
            """
            ALTER TABLE geofences
            ADD CONSTRAINT name_unique_per_team UNIQUE (team_id, name)
            """,
        ),
    ]

    for constraint_name, ddl in constraints:
        exists = connection.execute(
            text(
                """
                SELECT EXISTS (
                  SELECT 1
                  FROM pg_constraint
                  WHERE conname = :constraint_name
                    AND conrelid = 'geofences'::regclass
                )
                """
            ),
            {"constraint_name": constraint_name},
        ).scalar_one()

        if not exists:
            connection.execute(text(ddl))


def fetch_seed_team_ids(connection):
    teams = connection.execute(text("SELECT id FROM teams ORDER BY id LIMIT 3")).scalars().all()

    if len(teams) < 3:
        raise RuntimeError("Seeding geofences requires at least 3 existing teams.")

    return teams


def seed_geofences(connection, teams):
    insert_statement = text(
        """
        INSERT INTO geofences (name, geom, team_id, created_at)
        VALUES (
          :name,
          ST_GeomFromText(:wkt, 4326)::geography,
          :team_id,
          :created_at
        )
        ON CONFLICT (team_id, name) DO UPDATE SET
          geom = EXCLUDED.geom,
          created_at = EXCLUDED.created_at
        """
    )

    rows = [
        {
            "name": geofence["name"],
            "wkt": geofence["wkt"],
            "team_id": teams[geofence["team_index"]],
            "created_at": geofence["created_at"],
        }
        for geofence in GEOFENCES
    ]

    connection.execute(insert_statement, rows)
    logger.info("Seeded %d geofence(s).", len(rows))


def main():
    logger.info("Preparing geofences schema and seed data...")
    with engine.begin() as connection:
        setup_schema(connection)
        teams = fetch_seed_team_ids(connection)
        seed_geofences(connection, teams)
    logger.info("Geofence seeding completed.")


if __name__ == "__main__":
    main()
