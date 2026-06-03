export interface GeofenceGeometry {
  type: "Polygon" | "MultiPolygon";
  coordinates: number[][][] | number[][][][];
}

export interface Geofence {
  id: string;
  name: string;
  geom: GeofenceGeometry;
  team?: {
    id: number;
    name: string;
  };
}

const SIMULATOR_API_BASE_URL =
  import.meta.env.VITE_SIMULATOR_API_BASE_URL ?? "/simulator-api";

export async function readTeamGeofences(teamId: number): Promise<Geofence[]> {
  const response = await fetch(
    `${SIMULATOR_API_BASE_URL}/simulators/teams/${encodeURIComponent(teamId)}/geofences`,
  );

  if (!response.ok) {
    throw new Error(`Failed to load geofences for team ${teamId}`);
  }

  return response.json();
}
