import { create } from "zustand";
import { Radio } from "@/types/Radio.ts";

export type FilterStatus = "all" | "active" | "inactive" | "stolen";
export interface RadioTrailPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
  battery: number;
  signalStrength: number;
}

interface RadioState {
  radios: Radio[];
  radioTrails: Record<string, RadioTrailPoint[]>;
  selectedRadio: Radio | null;
  filterStatus: FilterStatus;
  searchQuery: string;
  setRadios: (radios: Radio[]) => void;
  upsertRadios: (radios: Radio[]) => void;
  setRadioTrail: (radioId: string, trail: RadioTrailPoint[]) => void;
  updateRadioPosition: (
    radioId: string,
    lat: number,
    lng: number,
    battery: number,
    signalStrength: number,
    timestamp: number,
  ) => void;
  setSelectedRadio: (radio: Radio | null) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setSearchQuery: (query: string) => void;
}

const MAX_TRAIL_POINTS = 120;

function mergeTrailPoints(
  currentTrail: RadioTrailPoint[] | undefined,
  incomingTrail: RadioTrailPoint[],
): RadioTrailPoint[] {
  const byPointKey = new Map<string, RadioTrailPoint>();

  for (const point of [...(currentTrail ?? []), ...incomingTrail]) {
    const key = `${point.timestamp}:${point.latitude}:${point.longitude}`;
    byPointKey.set(key, point);
  }

  return Array.from(byPointKey.values())
    .sort((a, b) => a.timestamp - b.timestamp)
    .slice(-MAX_TRAIL_POINTS);
}

function appendTrailPoint(
  trail: RadioTrailPoint[] | undefined,
  radio: Radio,
): RadioTrailPoint[] {
  const nextPoint: RadioTrailPoint = {
    latitude: radio.latitude,
    longitude: radio.longitude,
    timestamp: radio.timestamp,
    battery: radio.battery,
    signalStrength: radio.signalStrength,
  };
  return mergeTrailPoints(trail, [nextPoint]);
}

export const useRadioStore = create<RadioState>((set) => ({
  radios: [],
  radioTrails: {},
  selectedRadio: null,
  filterStatus: "all",
  searchQuery: "",
  setRadios: (radios) =>
    set((state) => {
      const radioTrails = { ...state.radioTrails };
      for (const radio of radios) {
        radioTrails[radio.radioId] = appendTrailPoint(radioTrails[radio.radioId], radio);
      }

      return { radios, radioTrails };
    }),
  upsertRadios: (incoming) =>
    set((state) => {
      const byId = new Map(state.radios.map((radio) => [radio.radioId, radio]));
      const radioTrails = { ...state.radioTrails };

      for (const radio of incoming) {
        const existing = byId.get(radio.radioId);
        const nextRadio = existing ? { ...existing, ...radio } : radio;
        byId.set(radio.radioId, nextRadio);
        radioTrails[radio.radioId] = appendTrailPoint(radioTrails[radio.radioId], nextRadio);
      }

      const selectedRadio =
        state.selectedRadio && byId.has(state.selectedRadio.radioId)
          ? byId.get(state.selectedRadio.radioId) ?? state.selectedRadio
          : state.selectedRadio;

      return { radios: Array.from(byId.values()), radioTrails, selectedRadio };
    }),
  setRadioTrail: (radioId, trail) =>
    set((state) => ({
      radioTrails: {
        ...state.radioTrails,
        [radioId]: mergeTrailPoints(state.radioTrails[radioId], trail),
      },
    })),
  updateRadioPosition: (radioId, lat, lng, battery, signalStrength, timestamp) =>
    set((state) => {
      const radioTrails = { ...state.radioTrails };
      let updatedRadio: Radio | null = null;
      const radios = state.radios.map((r) => {
        if (r.radioId !== radioId) return r;

        updatedRadio = { ...r, latitude: lat, longitude: lng, battery, signalStrength, timestamp };
        return updatedRadio;
      });

      if (updatedRadio) {
        radioTrails[radioId] = appendTrailPoint(radioTrails[radioId], updatedRadio);
      }

      const selectedRadio =
        state.selectedRadio && state.selectedRadio.radioId === radioId
          ? updatedRadio ?? {
              ...state.selectedRadio,
              latitude: lat,
              longitude: lng,
              battery,
              signalStrength,
              timestamp,
            }
          : state.selectedRadio;

      return { radios, radioTrails, selectedRadio };
    }),
  setSelectedRadio: (radio) => set({ selectedRadio: radio }),
  setFilterStatus: (filterStatus) => set({ filterStatus }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));

export function selectFilteredRadios(state: RadioState): Radio[] {
  const q = state.searchQuery.trim().toLowerCase();
  return state.radios.filter((r) => {
    if (state.filterStatus === "active" && !r.active) return false;
    if (state.filterStatus === "inactive" && r.active) return false;
    if (state.filterStatus === "stolen" && !r.isStolen) return false;
    if (q) {
      const hay = `${r.name} ${r.serialNumber} ${r.team}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}
