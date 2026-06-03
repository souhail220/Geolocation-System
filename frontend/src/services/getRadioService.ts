import api from "@/services/api";
import type { RadioTrailPoint } from "@/store/radioStore";
import type { Radio } from "@/types/Radio";

export interface RadioViewportParams {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
  zoom: number;
}

interface RadioLocationStreamResponse {
  radio_id?: string;
  radioId?: string;
  latitude: number;
  longitude: number;
  battery_level?: number;
  batteryLevel?: number;
  signal_strength?: number;
  signalStrength?: number;
  timestamp: string;
  name: string;
  serial_number?: string;
  serialNumber?: string;
  team_id?: number;
  teamId?: number;
  stolen: boolean;
  active: boolean;
  outside_zone?: boolean;
  outsideZone?: boolean;
}

interface RadioLocationStreamOptions {
  onRadios: (radios: Radio[]) => void;
  onError?: (error: Event) => void;
}

interface RadioHistoryLocationResponse {
  battery_level?: number;
  batteryLevel?: number;
  latitude: number;
  longitude: number;
  radio_id?: string;
  radioId?: string;
  recorded_at?: string;
  recordedAt?: string;
  signal_strength?: number;
  signalStrength?: number;
}

const STREAM_INTERVAL_SECONDS = Number(import.meta.env.VITE_STREAM_INTERVAL_SECONDS ?? 20);

const BASE_STREAM_URL =
  import.meta.env.VITE_RADIO_LOCATIONS_STREAM_URL ?? "/api/radios/locations/stream";

const RADIO_LOCATIONS_STREAM_URL = BASE_STREAM_URL.includes("?")
  ? `${BASE_STREAM_URL}&intervalSeconds=${STREAM_INTERVAL_SECONDS}`
  : `${BASE_STREAM_URL}?intervalSeconds=${STREAM_INTERVAL_SECONDS}`;

function parseTimestamp(timestamp: string): number {
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? Math.floor(Date.now() / 1000) : Math.floor(parsed / 1000);
}

function streamLocationToRadio(radio: RadioLocationStreamResponse): Radio {
  const radioId = radio.radio_id ?? radio.radioId ?? "";
  const teamId = radio.team_id ?? radio.teamId;

  return {
    radioId,
    serialNumber: radio.serial_number ?? radio.serialNumber ?? radioId,
    name: radio.name,
    team: teamId ? `Team ${teamId}` : "Team",
    teamId,
    isStolen: radio.stolen,
    latitude: radio.latitude,
    longitude: radio.longitude,
    battery: radio.battery_level ?? radio.batteryLevel ?? 0,
    signalStrength: radio.signal_strength ?? radio.signalStrength ?? 0,
    active: radio.active,
    outsideZone: radio.outside_zone ?? radio.outsideZone ?? false,
    timestamp: parseTimestamp(radio.timestamp),
  };
}

function historyLocationToTrailPoint(location: RadioHistoryLocationResponse): RadioTrailPoint {
  return {
    latitude: location.latitude,
    longitude: location.longitude,
    battery: location.battery_level ?? location.batteryLevel ?? 0,
    signalStrength: location.signal_strength ?? location.signalStrength ?? 0,
    timestamp: parseTimestamp(location.recorded_at ?? location.recordedAt ?? ""),
  };
}

export async function readRadioHistory(radioId: string): Promise<RadioTrailPoint[]> {
  const { data } = await api.get<RadioHistoryLocationResponse[]>(
    `/radios/${encodeURIComponent(radioId)}/history-location`,
  );

  return data.map(historyLocationToTrailPoint).sort((a, b) => a.timestamp - b.timestamp);
}

export function subscribeToRadioLocations({
  onRadios,
  onError,
}: RadioLocationStreamOptions): EventSource | null {
  if (typeof window === "undefined" || typeof EventSource === "undefined") {
    console.warn("[radio-stream] EventSource is not available");
    return null;
  }

  const source = new EventSource(RADIO_LOCATIONS_STREAM_URL);

  source.addEventListener("radio-locations", (event) => {
    try {
      const payload = JSON.parse(
        (event as MessageEvent<string>).data,
      ) as RadioLocationStreamResponse[];
      const radios = payload.map(streamLocationToRadio);
      console.log(`[radio-stream] Update received — ${radios.length} radios`, radios);
      onRadios(radios);
    } catch (error) {
      console.error("[radio-stream] Failed to parse radio-locations event", error);
    }
  });

  source.addEventListener("error", (event) => {
    console.warn("[radio-stream] Connection interrupted; EventSource will retry", event);
    onError?.(event);
  });

  return source;
}
