import { Pause, Play, RotateCcw, SkipBack, SkipForward } from "lucide-react";
import { formatTs } from "@/lib/radioUtils.ts";
import type { RadioTrailPoint } from "@/store/radioStore.ts";

interface PlaybackControlsProps {
  canPlayback: boolean;
  maxPlaybackIndex: number;
  playbackIndex: number;
  playbackPoint: RadioTrailPoint | null;
  playing: boolean;
  pointCount: number;
  onPlayToggle: () => void;
  onReset: () => void;
  onStep: (direction: -1 | 1) => void;
  onTimelineChange: (index: number) => void;
}

export function PlaybackControls({
  canPlayback,
  maxPlaybackIndex,
  playbackIndex,
  playbackPoint,
  playing,
  pointCount,
  onPlayToggle,
  onReset,
  onStep,
  onTimelineChange,
}: PlaybackControlsProps) {
  return (
    <div className="absolute bottom-4 left-4 right-4 z-[1000] rounded-md border border-border bg-white p-3 shadow md:right-auto md:w-[520px]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="truncate text-sm font-semibold text-navy">Lecture de l'historique</div>
          <div className="truncate text-xs text-slate">
            {playbackPoint ? formatTs(playbackPoint.timestamp) : "Aucun point disponible"}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onReset}
            disabled={!canPlayback}
            className="rounded p-2 text-slate hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Revenir au début"
            title="Revenir au début"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onStep(-1)}
            disabled={!canPlayback || playbackIndex === 0}
            className="rounded p-2 text-slate hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Point précédent"
            title="Point précédent"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onPlayToggle}
            disabled={!canPlayback}
            className="rounded bg-blue-accent p-2 text-white hover:bg-navy disabled:cursor-not-allowed disabled:opacity-40"
            aria-label={playing ? "Pause" : "Lecture"}
            title={playing ? "Pause" : "Lecture"}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => onStep(1)}
            disabled={!canPlayback || playbackIndex === maxPlaybackIndex}
            className="rounded p-2 text-slate hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Point suivant"
            title="Point suivant"
          >
            <SkipForward className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <input
          type="range"
          min={0}
          max={maxPlaybackIndex}
          value={playbackIndex}
          disabled={!canPlayback}
          onChange={(event) => onTimelineChange(Number(event.target.value))}
          className="h-2 min-w-0 flex-1 accent-blue-accent"
          aria-label="Chronologie de l'historique"
        />
        <span className="w-20 text-right text-xs tabular-nums text-slate">
          {canPlayback ? `${playbackIndex + 1}/${pointCount}` : "0/0"}
        </span>
      </div>
    </div>
  );
}
