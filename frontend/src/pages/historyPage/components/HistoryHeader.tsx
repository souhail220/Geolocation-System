import { Clock, MapPin } from "lucide-react";
import { formatCoordinates, formatTs } from "@/lib/radioUtils.ts";
import type { Radio } from "@/types/Radio.ts";
import type { RadioTrailPoint } from "@/store/radioStore.ts";

interface HistoryHeaderProps {
  canPlayback: boolean;
  playbackIndex: number;
  playbackPoint: RadioTrailPoint | null;
  pointCount: number;
  selectedRadio: Radio | null;
  latestTrailPoint: RadioTrailPoint | undefined;
}

export function HistoryHeader({
  canPlayback,
  playbackIndex,
  playbackPoint,
  pointCount,
  selectedRadio,
  latestTrailPoint,
}: HistoryHeaderProps) {
  return (
    <div className="flex h-12 items-center justify-between border-b border-border bg-white px-4">
      <div className="min-w-0">
        <div className="truncate text-sm font-semibold text-navy">
          {selectedRadio?.name ?? "Aucune radio"}
        </div>
        <div className="truncate text-xs text-slate">
          {selectedRadio ? formatCoordinates(selectedRadio.latitude, selectedRadio.longitude) : "N/A"}
        </div>
      </div>
      <div className="hidden items-center gap-4 text-xs text-slate sm:flex">
        <span className="flex items-center gap-1">
          <MapPin className="h-4 w-4" />
          {canPlayback ? `${playbackIndex + 1}/${pointCount} points` : `${pointCount} points`}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="h-4 w-4" />
          {playbackPoint
            ? formatTs(playbackPoint.timestamp)
            : latestTrailPoint
              ? formatTs(latestTrailPoint.timestamp)
              : "N/A"}
        </span>
      </div>
    </div>
  );
}
