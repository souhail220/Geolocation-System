import { create } from "zustand";
import type { Radio } from "@/types/radio";

export type FilterStatus = "all" | "active" | "inactive" | "stolen";

interface RadioState {
  radios: Radio[];
  selectedRadio: Radio | null;
  filterStatus: FilterStatus;
  searchQuery: string;
  setRadios: (radios: Radio[]) => void;
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

export const useRadioStore = create<RadioState>((set) => ({
  radios: [],
  selectedRadio: null,
  filterStatus: "all",
  searchQuery: "",
  setRadios: (radios) => set({ radios }),
  updateRadioPosition: (radioId, lat, lng, battery, signalStrength, timestamp) =>
    set((state) => {
      const radios = state.radios.map((r) =>
        r.radioId === radioId
          ? { ...r, latitude: lat, longitude: lng, battery, signalStrength, timestamp }
          : r,
      );
      const selectedRadio =
        state.selectedRadio && state.selectedRadio.radioId === radioId
          ? { ...state.selectedRadio, latitude: lat, longitude: lng, battery, signalStrength, timestamp }
          : state.selectedRadio;
      return { radios, selectedRadio };
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