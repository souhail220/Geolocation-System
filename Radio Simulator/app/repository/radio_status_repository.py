import psycopg2
from psycopg2.extras import RealDictCursor


def fetch_radio_changes_since(database_url, since):
    with psycopg2.connect(database_url) as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT
                  radio_id,
                  serial_number,
                  name,
                  team_id,
                  battery,
                  signal_strength,
                  lat,
                  lng,
                  active,
                  stolen,
                  outsidezone AS "outsideZone",
                  changed_at
                FROM radio_change_log
                WHERE changed_at > %s
                ORDER BY changed_at ASC
                """,
                (since,),
            )
            return [dict(row) for row in cursor.fetchall()]
