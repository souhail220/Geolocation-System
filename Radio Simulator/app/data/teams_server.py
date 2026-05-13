import json
import logging
from http.server import BaseHTTPRequestHandler, HTTPServer

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import selectinload

from app.data.database import SessionLocal, TeamModel

logger = logging.getLogger(__name__)


def _serialize_datetime(value):
    if value is None:
        return None
    return value.isoformat()


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
        if self.path not in ("/", "/teams"):
            self.send_error(404, "Not Found")
            return

        try:
            body = json.dumps(get_teams_data()).encode("utf-8")
        except Exception:
            logger.exception("Failed to load or serialize teams data.")
            self.send_error(500, "Internal Server Error")
            return

        try:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError) as e:
            logger.debug("Client disconnected while sending teams response: %s", e)
        except OSError as e:
            logger.warning("Could not complete teams HTTP response: %s", e)

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

    logger.info("Teams HTTP server listening on http://%s:%s/teams", host, port)
    server.serve_forever()
