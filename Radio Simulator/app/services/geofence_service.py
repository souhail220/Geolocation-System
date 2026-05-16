import json
import logging
from collections import defaultdict
from typing import Iterable

from shapely.geometry import MultiPolygon, Polygon, mapping, shape
from shapely.ops import unary_union
from sqlalchemy import text
from sqlalchemy.exc import SQLAlchemyError

from app.configuration.config import (
    GEOFENCE_SRID,
    TUNISIA_FALLBACK_GEOFENCE_COORDINATES,
    TUNISIA_FALLBACK_GEOFENCE_NAME,
)
from app.data.geofence_models import GeofenceRecord, TeamGeofence

logger = logging.getLogger(__name__)


class MissingGeofenceError(RuntimeError):
    pass


class InvalidGeofenceError(RuntimeError):
    pass


def _parse_geojson(value):
    if isinstance(value, str):
        return json.loads(value)
    return value


def _normalize_polygon_geometry(geometry):
    if geometry.is_empty:
        raise InvalidGeofenceError("geofence geometry is empty")

    if not geometry.is_valid:
        geometry = geometry.buffer(0)

    if geometry.is_empty or not isinstance(geometry, (Polygon, MultiPolygon)):
        raise InvalidGeofenceError(
            f"geofence geometry must be Polygon or MultiPolygon, got {geometry.geom_type}"
        )

    return geometry


def load_geofence_records(db, team_ids: Iterable[int] | None = None):
    team_id_filter = set(team_ids) if team_ids is not None else None

    try:
        rows = db.execute(
            text(
                """
                SELECT
                  id::text AS id,
                  name,
                  team_id,
                  ST_SRID(geom::geometry) AS srid,
                  ST_AsGeoJSON(geom::geometry) AS geom_geojson,
                  created_at
                FROM geofences
                WHERE team_id IS NOT NULL
                  AND geom IS NOT NULL
                ORDER BY team_id ASC, created_at DESC, name ASC
                """
            )
        ).mappings().all()
    except SQLAlchemyError:
        logger.exception("Database query failed while loading geofence geometry.")
        raise

    records = []
    for row in rows:
        team_id = int(row["team_id"])
        if team_id_filter is not None and team_id not in team_id_filter:
            continue

        srid = row["srid"]
        if srid != GEOFENCE_SRID:
            logger.warning(
                "Geofence id=%s uses SRID %s, expected %s.",
                row["id"],
                srid,
                GEOFENCE_SRID,
            )

        geom_geojson = _parse_geojson(row["geom_geojson"])
        geometry = _normalize_polygon_geometry(shape(geom_geojson))
        records.append(
            GeofenceRecord(
                id=row["id"],
                name=row["name"],
                team_id=team_id,
                geom_geojson=geom_geojson,
                geometry=geometry,
                created_at=row["created_at"],
            )
        )

    return records


def load_team_geofence_map(db, team_ids: Iterable[int] | None = None):
    grouped_records = defaultdict(list)
    for record in load_geofence_records(db, team_ids):
        grouped_records[record.team_id].append(record)

    team_geofences = {}
    for team_id, records in grouped_records.items():
        if len(records) == 1:
            geometry = records[0].geometry
        else:
            geometry = _normalize_polygon_geometry(
                unary_union([record.geometry for record in records])
            )

        team_geofences[team_id] = TeamGeofence(
            team_id=team_id,
            geofence_ids=tuple(record.id for record in records),
            names=tuple(record.name for record in records),
            geom_geojson=mapping(geometry),
            geometry=geometry,
        )

    return team_geofences


def build_tunisia_fallback_geofence(team_id):
    geometry = _normalize_polygon_geometry(Polygon(TUNISIA_FALLBACK_GEOFENCE_COORDINATES))

    return TeamGeofence(
        team_id=team_id,
        geofence_ids=(f"fallback:tunisia:{team_id}",),
        names=(TUNISIA_FALLBACK_GEOFENCE_NAME,),
        geom_geojson=mapping(geometry),
        geometry=geometry,
    )


def add_tunisia_fallback_geofences(team_geofences, team_ids):
    team_geofences = dict(team_geofences)
    missing_team_ids = [
        team_id for team_id in team_ids if team_id not in team_geofences
    ]

    for team_id in missing_team_ids:
        team_geofences[team_id] = build_tunisia_fallback_geofence(team_id)

    return team_geofences, missing_team_ids


def require_team_geofence(team_geofences, team_id):
    geofence = team_geofences.get(team_id)
    if geofence is None:
        raise MissingGeofenceError(
            f"Team id={team_id} has no geofence. Run `python -m scripts.seed_geofences` "
            "or create a geofences row with this team_id before starting the simulator."
        )
    return geofence
