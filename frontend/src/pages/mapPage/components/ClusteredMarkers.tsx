import { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet.markercluster";
import { Radio } from "@/types/Radio.ts";
import { useRadioStore } from "@/store/radioStore.ts";
import { onRadioFlash } from "@/services/socket.ts";
import { buildPopupHtml, radioStatus } from "@/lib/radioUtils.ts";

interface ClusteredMarkersProps {
  radios: Radio[];
  onSelect: (r: Radio) => void;
}

export function ClusteredMarkers({ radios, onSelect }: ClusteredMarkersProps) {
  const map = useMap();
  const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());

  // Build cluster group once
  useEffect(() => {
    const cluster = L.markerClusterGroup({
      chunkedLoading: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
    });
    clusterRef.current = cluster;
    map.addLayer(cluster);

    return () => {
      map.removeLayer(cluster);
      clusterRef.current = null;
      markersRef.current.clear();
    };
  }, [map]);

  // Sync markers when radios array changes
  useEffect(() => {
    const cluster = clusterRef.current;
    if (!cluster) return;

    cluster.clearLayers();
    markersRef.current.clear();

    const layers: L.Marker[] = [];
    for (const r of radios) {
      const status = radioStatus(r);
      const icon = L.divIcon({
        className: "",
        html: `<div class="radio-marker ${status}" data-rid="${r.radioId}"></div>`,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([r.latitude, r.longitude], { icon }) as L.Marker & {
        _radio?: Radio;
      };
      marker._radio = r;
      marker.bindPopup(buildPopupHtml(r));
      marker.on("click", () => onSelect(r));

      markersRef.current.set(r.radioId, marker);
      layers.push(marker);
    }

    cluster.addLayers(layers);
  }, [radios, onSelect]);

  // Flash handler — briefly scales the marker icon on real-time update
  useEffect(() => {
    return onRadioFlash((radioId) => {
      const m = markersRef.current.get(radioId);
      if (!m) return;

      const el = m.getElement()?.querySelector(".radio-marker") as HTMLElement | null;
      if (el) {
        el.classList.add("flash");
        globalThis.setTimeout(() => el.classList.remove("flash"), 280);
      }

      const fresh = useRadioStore.getState().radios.find((x) => x.radioId === radioId);
      if (fresh) {
        m.setLatLng([fresh.latitude, fresh.longitude]);
        m.setPopupContent(buildPopupHtml(fresh));
      }
    });
  }, []);

  return null;
}
