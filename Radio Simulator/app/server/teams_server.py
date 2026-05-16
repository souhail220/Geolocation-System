import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload

from app.data.database import SessionLocal, TeamModel
from app.server.geofences_server import get_geofences_data

logger = logging.getLogger(__name__)


def _serialize_datetime(value):
    if value is None:
        return None
    if isinstance(value, str):
        return value.split(".", 1)[0]
    return value.isoformat(timespec="seconds")


def get_teams_data():
    db = SessionLocal()
    try:
        teams = (
            db.query(TeamModel)
            .options(selectinload(TeamModel.radios))
            .order_by(TeamModel.id)
            .all()
        )
        return [
            {
                "id": team.id,
                "name": team.name,
                "description": team.description,
                "createdAt": _serialize_datetime(team.created_at),
                "radioCount": len(team.radios),
            }
            for team in teams
        ]
    except SQLAlchemyError:
        logger.exception("Database query failed while loading teams.")
        raise
    finally:
        db.close()


class TeamsRequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path in ("/", "/teams"):
            self._send_json(get_teams_data, "teams")
            return

        if self.path == "/geofences":
            self._send_json(get_geofences_data, "geofences")
            return

        self.send_error(404, "Not Found")

    def _send_json(self, loader, label):
        try:
            body = json.dumps(loader()).encode("utf-8")
        except Exception:
            logger.exception("Failed to load or serialize %s data.", label)
            self.send_error(500, "Internal Server Error")
            return

        try:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError) as e:
            logger.debug("Client disconnected while sending %s response: %s", label, e)
        except OSError as e:
            logger.warning("Could not complete %s HTTP response: %s", label, e)

    def log_message(self, format, *args):
        logger.debug("%s - %s", self.address_string(), format % args)

    def log_error(self, format, *args):
        logger.error("%s - %s", self.address_string(), format % args)


def run_teams_server(host, port):
    try:
        server = HTTPServer((host, port), TeamsRequestHandler)
    except OSError as e:
        logger.exception("Could not bind teams HTTP server on %s:%s: %s", host, port, e)
        raise

    logger.info(
        "Teams/geofences HTTP server listening on http://%s:%s/teams and /geofences",
        host,
        port,
    )
    server.serve_forever()
