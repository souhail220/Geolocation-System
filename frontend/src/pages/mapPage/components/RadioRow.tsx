import { Radio } from "@/types/Radio.ts";
import { batteryColor, clampPercent, formatBattery, formatSignal, radioStatus } from "@/lib/radioUtils.ts";
import { CSSProperties } from "react";

interface RadioRowProps {
  index: number;
  style: CSSProperties;
  radios: Radio[];
  onSelect: (r: Radio) => void;
  selectedId?: string;
}

export function RadioRow({ index, style, radios, onSelect, selectedId }: RadioRowProps) {
  const r = radios[index];
  if (!r) return null;

  const status = radioStatus(r);
  const dot =
    status === "active" ? "bg-success" : status === "inactive" ? "bg-warning" : "bg-danger";
  const battColor = batteryColor(r.battery);
  const batteryPct = clampPercent(r.battery);
  const isSelected = r.radioId === selectedId;

  return (
    <div style={style} className="px-2">
      <button
        onClick={() => onSelect(r)}
        className={`mt-1 w-full rounded-md border bg-white p-2.5 text-left transition-colors ${
          isSelected
            ? "border-blue-accent ring-2 ring-blue-accent/30"
            : "border-border hover:bg-muted"
        }`}
      >
        <div className="flex items-start gap-2">
          <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${dot}`} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <div className="truncate text-sm font-semibold text-navy">{r.name}</div>
              {r.outsideZone && (
                <span className="rounded-full bg-danger/10 px-1.5 py-0.5 text-[10px] font-medium text-danger">
                  Hors zone
                </span>
              )}
            </div>
            <div className="truncate text-xs text-slate">{r.team}</div>
            <div className="mt-1.5 flex items-center gap-2">
              <div className="h-1.5 flex-1 rounded bg-muted overflow-hidden">
                <div
                  className="h-full rounded"
                  style={{
                    width: `${batteryPct}%`,
                    background: battColor,
                  }}
                />
              </div>
              <span className="text-[11px] tabular-nums text-slate">
                {formatBattery(r.battery)}
              </span>
              <span className="text-[11px] tabular-nums text-slate">
                {formatSignal(r.signalStrength)}
              </span>
            </div>
          </div>
        </div>
      </button>
    </div>
  );
}
