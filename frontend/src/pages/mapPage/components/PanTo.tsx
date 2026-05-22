import { useEffect } from "react";
import { useMap } from "react-leaflet";
import { Radio } from "@/types/Radio.ts";

interface PanToProps {
  target: Radio | null;
}

export function PanTo({ target }: PanToProps) {
  const map = useMap();

  useEffect(() => {
    if (target) {
      map.flyTo([target.latitude, target.longitude], Math.max(map.getZoom(), 12), {
        duration: 0.6,
      });
    }
  }, [target, map]);

  return null;
}
