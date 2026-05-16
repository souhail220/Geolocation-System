import logging
import random

import requests
from shapely.geometry import Point, Polygon

from app.configuration.config import (
    OSRM_BASE_URL,
    OSRM_PROFILE,
    OSRM_TIMEOUT_SECONDS,
    ROUTE_FALLBACK_POINT_MULTIPLIER,
    ROUTE_RANDOM_POINT_MAX_ATTEMPTS,
    ROUTE_WAYPOINTS,
)

logger = logging.getLogger(__name__)


def generate_zone(center_lat, center_lon, size=0.02):
    """Build a square lon/lat polygon around a lat/lon center."""
    return Polygon([
        (center_lon - size, center_lat - size),
        (center_lon + size, center_lat - size),
        (center_lon + size, center_lat + size),
        (center_lon - size, center_lat + size),
    ])


def _point_is_inside_zone(zone, lat, lon):
    return zone.covers(Point(lon, lat))


def random_point_within_zone(zone):
    min_lon, min_lat, max_lon, max_lat = zone.bounds

    for _ in range(ROUTE_RANDOM_POINT_MAX_ATTEMPTS):
        lon = random.uniform(min_lon, max_lon)
        lat = random.uniform(min_lat, max_lat)
        if _point_is_inside_zone(zone, lat, lon):
            return lat, lon

    point = zone.representative_point()
    logger.warning(
        "Could not sample random point inside geofence bounds; using representative point."
    )
    return point.y, point.x


def _fallback_route_within_zone(zone, num_points):
    return [random_point_within_zone(zone) for _ in range(num_points)]


def generate_route_within_zone(zone, num_waypoints=None):
    """
    Generate a route inside a PostGIS/GeoJSON-style geometry.

    Shapely geometries store points as (lon, lat). Returned route points use
    (lat, lon), matching the radio payload shape.
    """
    if num_waypoints is None:
        num_waypoints = ROUTE_WAYPOINTS

    fallback_point_count = max(num_waypoints * ROUTE_FALLBACK_POINT_MULTIPLIER, 2)

    # 1. Generate random waypoints within the geofence geometry
    waypoints = [random_point_within_zone(zone) for _ in range(num_waypoints)]

    # Convert coordinates to OSRM string format: lon1,lat1;lon2,lat2;...
    coordinates_str = ";".join([f"{lon},{lat}" for lat, lon in waypoints])
    osrm_url = (
        f"{OSRM_BASE_URL}/route/v1/{OSRM_PROFILE}/{coordinates_str}"
        "?overview=full&geometries=geojson"
    )

    try:
        response = requests.get(osrm_url, timeout=OSRM_TIMEOUT_SECONDS)
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
                route = [
                    (lat, lon)
                    for lon, lat in route_coords
                    if _point_is_inside_zone(zone, lat, lon)
                ]
                if len(route) >= 2:
                    return route
                logger.warning(
                    "OSRM route did not keep enough points inside the geofence; "
                    "using waypoint fallback."
                )
            else:
                logger.warning("OSRM returned empty geometry; using waypoint fallback.")
    elif data is not None:
        logger.warning(
            "OSRM did not return a usable route (code=%r); using waypoint fallback.",
            data.get("code"),
        )

    return _fallback_route_within_zone(zone, fallback_point_count)
