import { Layers } from "lucide-react";
import { TILE_LAYERS, TileKey } from "@/lib/tileLayers.ts";

interface TileSwitcherProps {
  value: TileKey;
  onChange: (k: TileKey) => void;
}

export function TileSwitcher({ value, onChange }: TileSwitcherProps) {
  return (
    <div className="absolute right-3 top-3 z-1000 flex items-center gap-1 rounded-md border border-border bg-white p-1 shadow">
      <Layers className="ml-1 h-4 w-4 text-slate" />
      {(Object.keys(TILE_LAYERS) as TileKey[]).map((k) => {
        const active = value === k;
        return (
          <button
            key={k}
            onClick={() => onChange(k)}
            className={`rounded px-2.5 py-1 text-xs font-medium transition-colors ${
              active
                ? "border border-blue-accent bg-blue-light text-navy"
                : "border border-transparent text-slate hover:bg-muted"
            }`}
          >
            {TILE_LAYERS[k].label}
          </button>
        );
      })}
    </div>
  );
}
