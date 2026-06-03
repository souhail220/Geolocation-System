import { MapPinned } from "lucide-react";

interface GeofenceToggleProps {
  count: number;
  enabled: boolean;
  error: string | null;
  disabled: boolean;
  loading: boolean;
  onToggle: () => void;
}

export function GeofenceToggle({
  count,
  enabled,
  error,
  disabled,
  loading,
  onToggle,
}: GeofenceToggleProps) {
  return (
    <div className="absolute right-3 top-16 z-[1000] flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-medium shadow disabled:cursor-not-allowed disabled:opacity-50 ${
          enabled
            ? "border-blue-accent bg-blue-accent text-white"
            : "border-border bg-white text-navy hover:bg-muted"
        }`}
        aria-pressed={enabled}
        title="Afficher les geofences"
      >
        <MapPinned className="h-4 w-4" />
        Geofences
      </button>
      {enabled && (
        <div
          className={`rounded-md border bg-white px-2 py-1 text-[11px] shadow ${
            error ? "border-danger/30 text-danger" : "border-border text-slate"
          }`}
        >
          {loading ? "Chargement..." : error ?? `${count} geofence${count > 1 ? "s" : ""}`}
        </div>
      )}
    </div>
  );
}
