import { useEffect, useMemo, useState } from "react";
import { GeoJSON } from "react-leaflet";
import type { Layer } from "leaflet";
import { readTeamGeofences, type Geofence } from "@/services/geofenceService.ts";

interface GeofenceLayerProps {
  enabled: boolean;
  onStatusChange?: (status: GeofenceStatus) => void;
  teamIds: number[];
}

export interface GeofenceStatus {
  count: number;
  error: string | null;
  loading: boolean;
}

function geofenceToFeature(geofence: Geofence) {
  return {
    type: "Feature" as const,
    geometry: geofence.geom,
    properties: {
      id: geofence.id,
      name: geofence.name,
      teamName: geofence.team?.name,
    },
  };
}

export function GeofenceLayer({ enabled, onStatusChange, teamIds }: GeofenceLayerProps) {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const teamKey = teamIds.join(",");

  useEffect(() => {
    if (!enabled || teamIds.length === 0) {
      setGeofences([]);
      onStatusChange?.({ count: 0, error: null, loading: false });
      return;
    }

    let cancelled = false;
    onStatusChange?.({ count: 0, error: null, loading: true });

    Promise.all(teamIds.map((teamId) => readTeamGeofences(teamId)))
      .then((results) => {
        if (cancelled) return;

        const byId = new Map<string, Geofence>();
        for (const geofence of results.flat()) {
          byId.set(geofence.id, geofence);
        }
        const nextGeofences = Array.from(byId.values());
        setGeofences(nextGeofences);
        onStatusChange?.({ count: nextGeofences.length, error: null, loading: false });
      })
      .catch((loadError) => {
        if (cancelled) return;
        console.error("[geofences] Failed to load geofences", loadError);
        setGeofences([]);
        onStatusChange?.({
          count: 0,
          error: "Impossible de charger les geofences.",
          loading: false,
        });
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, onStatusChange, teamKey]);

  const featureCollection = useMemo(
    () => ({
      type: "FeatureCollection" as const,
      features: geofences.map(geofenceToFeature),
    }),
    [geofences],
  );

  if (!enabled) return null;

  return geofences.length > 0 ? (
    <GeoJSON
      key={geofences.map((geofence) => geofence.id).join(",")}
      data={featureCollection}
      style={{
        color: "#0F766E",
        fillColor: "#14B8A6",
        fillOpacity: 0.14,
        opacity: 0.9,
        weight: 2,
      }}
      onEachFeature={(feature, layer: Layer) => {
        const props = feature.properties as { name?: string; teamName?: string };
        layer.bindPopup(
          `<div style="min-width:180px;font-size:12px;color:#0F172A">
            <div style="font-weight:600;font-size:13px">${props.name ?? "Geofence"}</div>
            ${props.teamName ? `<div style="color:#64748B;margin-top:2px">${props.teamName}</div>` : ""}
          </div>`,
        );
      }}
    />
  ) : null;
}
