import logging
import random
import time

from geopy.distance import geodesic
from shapely.geometry import Point

from app.configuration.config import (
    BASE_LAT,
    BASE_LON,
    BATTERY_DRAIN_RANGE,
    BATTERY_INITIAL_RANGE,
    GEOFENCE_VIOLATION_OFFSET_RANGE,
    GEOFENCE_VIOLATION_PROBABILITY,
    ROUTES_PER_TEAM,
    SEND_INTERVAL_RANGE,
    SIGNAL_DROP_PROBABILITY,
)
from app.services.zoneGenerator import generate_route_within_zone, random_point_within_zone

logger = logging.getLogger(__name__)


class Radio:
    def __init__(self, radio_id, serial_number, name, team_id, is_stolen, route, zone):
        self.id = radio_id
        self.serial_number = serial_number
        self.name = name
        self.team = team_id
        self.is_stolen = is_stolen
        self.route = route
        self.zone = zone
        self.route_index = 0

        self.battery = random.uniform(*BATTERY_INITIAL_RANGE)
        self.active = True
        self.signal_strength = 0 # Will be dynamically calculated

        self.next_send_time = time.time() + random.randint(*SEND_INTERVAL_RANGE)

    def _calculate_signal_strength(self, lat, lon):
        dist_km = geodesic((lat, lon), (BASE_LAT, BASE_LON)).kilometers
        
        # Simple simulated attenuation curve
        # Base signal is strong (-50 dBm), attenuates by roughly 2.5 dBm per km
        # Random noise +/- 3 dBm
        base_signal = -50
        attenuation = dist_km * 2.5
        noise = random.uniform(-3, 3)
        
        strength = base_signal - attenuation + noise
        
        # Cap realistically between excellent (-40) and dead zone (-120)
        return int(max(-120, min(-40, strength)))

    def move_and_send(self):
        now = time.time()

        if not self.active:
            return None

        if now < self.next_send_time:
            return None

        self.next_send_time = now + random.randint(*SEND_INTERVAL_RANGE)

        route_len = len(self.route)
        if route_len == 0:
            logger.error("Radio %s has an empty route; skipping send.", self.id)
            return None

        lat, lon = self.route[self.route_index]
        self.route_index = (self.route_index + 1) % route_len

        # Battery drain
        self.battery -= random.uniform(*BATTERY_DRAIN_RANGE)
        if self.battery <= 0:
            self.active = False

        # Random signal drop
        if random.random() < SIGNAL_DROP_PROBABILITY:
            self.active = False

        # Random geofence violation
        if random.random() < GEOFENCE_VIOLATION_PROBABILITY:
            lat += random.uniform(*GEOFENCE_VIOLATION_OFFSET_RANGE)
            lon += random.uniform(*GEOFENCE_VIOLATION_OFFSET_RANGE)

        outside_zone = not self.zone.covers(Point(lon, lat))

        # Dynamic Signal Attenuation based on distance
        self.signal_strength = self._calculate_signal_strength(lat, lon)

        payload = {
            "id": self.id,
            "serialNumber": self.serial_number,
            "name": self.name,
            "team": self.team,
            "isStolen": self.is_stolen,
            "latitude": lat,
            "longitude": lon,
            "battery": round(self.battery, 2),
            "signalStrength": self.signal_strength,
            "active": self.active,
            "outsideZone": outside_zone,
            "timestamp": int(time.time())
        }

        return payload


class Team:
    def __init__(self, team_model, radio_models, geofence):
        self.id = team_model.id
        self.name = team_model.name
        self.description = team_model.description
        self.geofence = geofence
        self.zones = [geofence.geometry]
        self.routes = []
        self.radios = []

        # Create routes from the team's database geofence geometry.
        zone = geofence.geometry
        for _ in range(ROUTES_PER_TEAM):
            route = generate_route_within_zone(zone)
            if not route:
                logger.warning(
                    "Empty route generated for team id=%s; injecting minimal in-zone path.",
                    team_model.id,
                )
                route = [
                    random_point_within_zone(zone),
                    random_point_within_zone(zone),
                ]
            self.routes.append((route, zone))

        # Create radios from the provided database models
        for rm in radio_models:
            route, zone = random.choice(self.routes)
            radio = Radio(
                radio_id=rm.id,
                serial_number=rm.serial_number,
                name=rm.name,
                team_id=self.id,
                is_stolen=rm.is_stolen,
                route=route,
                zone=zone
            )
            self.radios.append(radio)
