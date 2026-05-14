import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer

from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.data.database import SessionLocal

logger = logging.getLogger(__name__)


def _serialize_datetime(value):
    if value is None:
        return None
    return value.isoformat()


def get_geofences_data():
    db = SessionLocal()
    try:
        rows = db.execute(
            text(
                """
                SELECT
                  id::text AS id,
                  name,
                  ST_AsGeoJSON(geom::geometry) AS geom_geojson,
                  team_id,
                  created_at
                FROM geofences
                ORDER BY created_at DESC, name ASC
                """
            )
        ).mappings().all()

        return [
            {
                "id": row["id"],
                "name": row["name"],
                "geom": json.loads(row["geom_geojson"]),
                "teamId": row["team_id"],
                "createdAt": _serialize_datetime(row["created_at"]),
            }
            for row in rows
        ]
    except SQLAlchemyError:
        logger.exception("Database query failed while loading geofences.")
        raise
    finally:
        db.close()


class GeofencesRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path not in ("/", "/geofences"):
            self.send_error(404, "Not Found")
            return

        try:
            body = json.dumps(get_geofences_data()).encode("utf-8")
        except Exception:
            logger.exception("Failed to load or serialize geofences data.")
            self.send_error(500, "Internal Server Error")
            return

        try:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError) as e:
            logger.debug("Client disconnected while sending geofences response: %s", e)
        except OSError as e:
            logger.warning("Could not complete geofences HTTP response: %s", e)

    def log_message(self, format, *args):
        logger.debug("%s - %s", self.address_string(), format % args)

    def log_error(self, format, *args):
        logger.error("%s - %s", self.address_string(), format % args)


def run_geofences_server(host, port):
    try:
        server = HTTPServer((host, port), GeofencesRequestHandler)
    except OSError as e:
        logger.exception("Could not bind geofences HTTP server on %s:%s: %s", host, port, e)
        raise

    logger.info("Geofences HTTP server listening on http://%s:%s/geofences", host, port)
    server.serve_forever()
