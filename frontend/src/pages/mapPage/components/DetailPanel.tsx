import { useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { Radio } from "@/types/Radio.ts";
import {
  batteryColor,
  clampPercent,
  formatBattery,
  formatCoordinates,
  formatSignal,
  formatTs,
  radioStatus,
  signalStrengthPercent,
} from "@/lib/radioUtils.ts";

interface DetailPanelProps {
  radio: Radio;
  onClose: () => void;
}

interface RowProps {
  label: string;
  value: string;
}

function Row({ label, value }: RowProps) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-xs text-slate">{label}</span>
      <span className="text-right text-sm text-navy break-all">{value}</span>
    </div>
  );
}

export function DetailPanel({ radio, onClose }: DetailPanelProps) {
  const navigate = useNavigate();
  const status = radioStatus(radio);
  const statusLabel = status === "active" ? "Actif" : status === "inactive" ? "Inactif" : "Volé";
  const statusCls =
    status === "active"
      ? "bg-success/10 text-success"
      : status === "inactive"
        ? "bg-warning/10 text-warning"
        : "bg-danger/10 text-danger";

  const battColor = batteryColor(radio.battery);
  const batteryPct = clampPercent(radio.battery);
  const signalPct = signalStrengthPercent(radio.signalStrength);

  return (
    <div
      className="fixed right-0 top-14 z-[1500] flex h-[calc(100vh-3.5rem)] w-[360px] max-w-[100vw] flex-col bg-white"
      style={{ boxShadow: "-4px 0 16px rgba(0,0,0,0.08)" }}
    >
      {/* Header */}
      <div className="flex items-start justify-between border-b border-border p-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-navy">{radio.name}</h3>
          <p className="truncate text-xs text-slate">{radio.serialNumber}</p>
          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${statusCls}`}
          >
            {statusLabel}
          </span>
        </div>
        <button
          onClick={onClose}
          className="rounded p-1 text-slate hover:bg-muted"
          aria-label="Fermer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 text-sm">
        <Row label="Équipe" value={radio.team} />

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate">
            <span>Batterie</span>
            <span className="tabular-nums">{formatBattery(radio.battery)}</span>
          </div>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div
              className="h-full rounded"
              style={{ width: `${batteryPct}%`, background: battColor }}
            />
          </div>
        </div>

        <div>
          <div className="mb-1 flex items-center justify-between text-xs text-slate">
            <span>Signal</span>
            <span className="tabular-nums">{formatSignal(radio.signalStrength)}</span>
          </div>
          <div className="h-2 rounded bg-muted overflow-hidden">
            <div className="h-full rounded bg-blue-accent" style={{ width: `${signalPct}%` }} />
          </div>
        </div>

        <Row label="Coordonnées" value={formatCoordinates(radio.latitude, radio.longitude)} />
        <Row label="Dernière mise à jour" value={formatTs(radio.timestamp)} />

        {radio.outsideZone && (
          <div className="rounded-md border-l-4 border-danger bg-danger/5 p-3 text-xs text-danger">
            ⚠ Cette radio est en dehors de la zone autorisée.
          </div>
        )}
        {radio.isStolen && (
          <div className="rounded-md border-l-4 border-danger bg-danger/5 p-3 text-xs text-danger">
            🚨 Cette radio est signalée comme volée.
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="grid grid-cols-2 gap-2 border-t border-border p-3">
        <button
          onClick={() => navigate("/history", { state: { radioId: radio.radioId } })}
          className="rounded-md border border-border bg-white px-3 py-2 text-xs font-medium text-navy hover:bg-muted"
        >
          Voir l'historique
        </button>
        <button className="rounded-md bg-blue-accent px-3 py-2 text-xs font-medium text-white hover:bg-blue-accent/90">
          Configurer une alerte
        </button>
      </div>
    </div>
  );
}
