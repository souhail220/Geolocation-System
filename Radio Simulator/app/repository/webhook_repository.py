import psycopg2
from psycopg2.extras import RealDictCursor


def load_webhooks(database_url, event_types):
    if not event_types:
        return []

    with psycopg2.connect(database_url) as connection:
        with connection.cursor(cursor_factory=RealDictCursor) as cursor:
            cursor.execute(
                """
                SELECT id, url, event_type, created_at
                FROM webhooks
                WHERE event_type = ANY(%s)
                ORDER BY id ASC
                """,
                (list(event_types),),
            )
            return [dict(row) for row in cursor.fetchall()]
