import random
import requests
from shapely.geometry import Polygon


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
        data = response.json()
        
        if data.get("code") == "Ok":
            # Extract the coordinates from the GeoJSON Geometry
            route_coords = data["routes"][0]["geometry"]["coordinates"]
            # Convert back from (lon, lat) to (lat, lon) for our simulator
            return [(lat, lon) for lon, lat in route_coords]
    except Exception as e:
        print(f"⚠️ OSRM API failed: {e}. Falling back to straight lines.")
    
    # Fallback to straight line logic if OSRM is unreachable
    return [
        (
            random.uniform(minx, maxx),
            random.uniform(miny, maxy)
        )
        for _ in range(num_waypoints * 5)
    ]