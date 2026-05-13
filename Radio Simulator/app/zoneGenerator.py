import logging
import random

import requests
from shapely.geometry import Polygon

logger = logging.getLogger(__name__)


def generate_zone(center_lat, center_lon, size=0.02):
    return Polygon([
        (center_lat - size, center_lon - size),
        (center_lat - size, center_lon + size),
        (center_lat + size, center_lon + size),
        (center_lat + size, center_lon - size),
    ])


def generate_route_within_zone(zone, num_waypoints=3):
    """
    Generate a realistic driving route inside the bounding zone by picking random waypoints
    and querying the OSRM public API to snap them to real streets.
    """
    minx, miny, maxx, maxy = zone.bounds
    
    # 1. Generate random waypoints within the zone
    waypoints = []
    for _ in range(num_waypoints):
        lat = random.uniform(minx, maxx)
        lon = random.uniform(miny, maxy)
        waypoints.append((lon, lat))  # OSRM requires (lon, lat)

    # Convert coordinates to OSRM string format: lon1,lat1;lon2,lat2;...
    coordinates_str = ";".join([f"{lon},{lat}" for lon, lat in waypoints])
    osrm_url = f"http://router.project-osrm.org/route/v1/driving/{coordinates_str}?overview=full&geometries=geojson"

    try:
        response = requests.get(osrm_url, timeout=5)
        response.raise_for_status()
        data = response.json()
    except requests.RequestException as e:
        logger.warning("OSRM request failed: %s; using waypoint fallback.", e)
        data = None
    except ValueError as e:
        logger.warning("OSRM response was not valid JSON: %s; using waypoint fallback.", e)
        data = None

    if data and data.get("code") == "Ok" and data.get("routes"):
        try:
            route_coords = data["routes"][0]["geometry"]["coordinates"]
        except (KeyError, IndexError, TypeError) as e:
            logger.warning("Unexpected OSRM response shape: %s; using waypoint fallback.", e)
        else:
            if route_coords:
                return [(lat, lon) for lon, lat in route_coords]
            logger.warning("OSRM returned empty geometry; using waypoint fallback.")
    elif data is not None:
        logger.warning(
            "OSRM did not return a usable route (code=%r); using waypoint fallback.",
            data.get("code"),
        )
    
    # Fallback to straight line logic if OSRM is unreachable
    return [
        (
            random.uniform(minx, maxx),
            random.uniform(miny, maxy)
        )
        for _ in range(num_waypoints * 5)
    ]