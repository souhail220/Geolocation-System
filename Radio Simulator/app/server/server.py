import json
import logging
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer
from urllib.parse import parse_qs, urlparse

from app.services.radio_status_service import radio_status_since

logger = logging.getLogger(__name__)

# Shared state between the simulator and the server
global_state = {}
global_state_lock = threading.Lock()


class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        parsed_url = urlparse(self.path)
        if parsed_url.path == "/radios/status":
            self._send_radio_status(parsed_url.query)
            return

        with global_state_lock:
            data = list(global_state.values())
        try:
            body = json.dumps(data).encode("utf-8")
        except (TypeError, ValueError):
            logger.exception("Failed to serialize radio state to JSON.")
            self.send_error(500, "Internal Server Error")
            return

        try:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError) as e:
            logger.debug("Client disconnected while sending response: %s", e)
        except OSError as e:
            logger.warning("Could not complete HTTP response: %s", e)

    def _send_radio_status(self, query_string):
        query = parse_qs(query_string)
        since_values = query.get("since", [])
        if not since_values:
            self.send_error(400, "Missing required query parameter: since")
            return

        try:
            body = json.dumps(radio_status_since(since_values[0])).encode("utf-8")
        except ValueError as exc:
            self.send_error(400, str(exc))
            return
        except Exception:
            logger.exception("Failed to load radio status changes.")
            self.send_error(500, "Internal Server Error")
            return

        try:
            self.send_response(200)
            self.send_header("Content-type", "application/json")
            self.send_header("Access-Control-Allow-Origin", "*")
            self.end_headers()
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError) as e:
            logger.debug("Client disconnected while sending radio status response: %s", e)
        except OSError as e:
            logger.warning("Could not complete radio status HTTP response: %s", e)

    def log_message(self, format, *args):
        logger.debug("%s - %s", self.address_string(), format % args)

    def log_error(self, format, *args):
        logger.error("%s - %s", self.address_string(), format % args)


def start_server(host, port):
    try:
        server = HTTPServer((host, port), RequestHandler)
    except OSError as e:
        logger.exception("Could not bind HTTP server on %s:%s: %s", host, port, e)
        raise

    logger.info("HTTP server listening on http://%s:%s", host, port)
    server_thread = threading.Thread(target=server.serve_forever, daemon=True)
    server_thread.start()
    return server
