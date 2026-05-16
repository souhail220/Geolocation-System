from dataclasses import dataclass
from typing import Any

from shapely.geometry.base import BaseGeometry


@dataclass(frozen=True)
class GeofenceRecord:
    id: str
    name: str
    team_id: int
    geom_geojson: dict[str, Any]
    geometry: BaseGeometry
    created_at: object | None = None


@dataclass(frozen=True)
class TeamGeofence:
    team_id: int
    geofence_ids: tuple[str, ...]
    names: tuple[str, ...]
    geom_geojson: dict[str, Any]
    geometry: BaseGeometry

