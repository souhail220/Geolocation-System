import json
import logging
import threading
from http.server import BaseHTTPRequestHandler, HTTPServer

logger = logging.getLogger(__name__)

# Shared state between the simulator and the server
global_state = {}


class RequestHandler(BaseHTTPRequestHandler):
    def do_GET(self):
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
