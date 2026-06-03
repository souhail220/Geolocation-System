import L from "leaflet";
import { MapContainer, Marker, Polyline, Popup, TileLayer } from "react-leaflet";
import { formatBattery, formatCoordinates, formatSignal, formatTs } from "@/lib/radioUtils.ts";
import { TILE_LAYERS, type TileKey } from "@/lib/tileLayers.ts";
import { ClusteredMarkers } from "@/pages/mapPage/components/ClusteredMarkers.tsx";
import { PanTo } from "@/pages/mapPage/components/PanTo.tsx";
import { TileSwitcher } from "@/pages/mapPage/components/TileSwitcher.tsx";
import type { Radio } from "@/types/Radio.ts";
import type { RadioTrailPoint } from "@/store/radioStore.ts";
import { PlaybackControls } from "./PlaybackControls.tsx";

const TRAIL_COLOR = "#2563EB";
const PLAYBACK_COLOR = "#0F766E";
const DEFAULT_CENTER: [number, number] = [36.82, 10.2];

const playbackIcon = L.divIcon({
  className: "",
  html: `<div class="history-playback-marker"></div>`,
  iconSize: [22, 22],
  iconAnchor: [11, 11],
});

interface HistoryMapProps {
  canPlayback: boolean;
  elapsedTrailPositions: [number, number][];
  historyError: string | null;
  historyLoading: boolean;
  maxPlaybackIndex: number;
  onPlayToggle: () => void;
  onRadioSelect: (radio: Radio) => void;
  onResetPlayback: () => void;
  onStepPlayback: (direction: -1 | 1) => void;
  onTileChange: (tileKey: TileKey) => void;
  onTimelineChange: (index: number) => void;
  playbackIndex: number;
  playbackPoint: RadioTrailPoint | null;
  playbackRadio: Radio | null;
  playing: boolean;
  pointCount: number;
  radios: Radio[];
  selectedRadio: Radio | null;
  tileKey: TileKey;
  trailPositions: [number, number][];
}

export function HistoryMap({
  canPlayback,
  elapsedTrailPositions,
  historyError,
  historyLoading,
  maxPlaybackIndex,
  onPlayToggle,
  onRadioSelect,
  onResetPlayback,
  onStepPlayback,
  onTileChange,
  onTimelineChange,
  playbackIndex,
  playbackPoint,
  playbackRadio,
  playing,
  pointCount,
  radios,
  selectedRadio,
  tileKey,
  trailPositions,
}: HistoryMapProps) {
  return (
    <div className="relative flex-1">
      <MapContainer
        center={selectedRadio ? [selectedRadio.latitude, selectedRadio.longitude] : DEFAULT_CENTER}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
        preferCanvas
      >
        <TileLayer
          key={tileKey}
          url={TILE_LAYERS[tileKey].url}
          attribution={TILE_LAYERS[tileKey].attribution}
        />

        {trailPositions.length > 1 && (
          <Polyline
            positions={trailPositions}
            pathOptions={{ color: TRAIL_COLOR, weight: 4, opacity: 0.25 }}
          />
        )}

        {elapsedTrailPositions.length > 1 && (
          <Polyline
            positions={elapsedTrailPositions}
            pathOptions={{ color: PLAYBACK_COLOR, weight: 5, opacity: 0.9 }}
          />
        )}

        <ClusteredMarkers radios={radios} onSelect={onRadioSelect} />

        {playbackRadio && (
          <Marker position={[playbackRadio.latitude, playbackRadio.longitude]} icon={playbackIcon}>
            <Popup>
              <div className="min-w-[200px] text-xs text-navy">
                <div className="text-sm font-semibold">{playbackRadio.name}</div>
                <div className="mt-1 text-slate">{formatTs(playbackRadio.timestamp)}</div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <div>
                    <div className="text-slate">Batterie</div>
                    <div className="font-medium">{formatBattery(playbackRadio.battery)}</div>
                  </div>
                  <div>
                    <div className="text-slate">Signal</div>
                    <div className="font-medium">{formatSignal(playbackRadio.signalStrength)}</div>
                  </div>
                </div>
                <div className="mt-2 text-slate">
                  {formatCoordinates(playbackRadio.latitude, playbackRadio.longitude)}
                </div>
              </div>
            </Popup>
          </Marker>
        )}

        <PanTo target={playbackRadio ?? selectedRadio} />
      </MapContainer>

      <TileSwitcher value={tileKey} onChange={onTileChange} />

      <PlaybackControls
        canPlayback={canPlayback}
        maxPlaybackIndex={maxPlaybackIndex}
        playbackIndex={playbackIndex}
        playbackPoint={playbackPoint}
        playing={playing}
        pointCount={pointCount}
        onPlayToggle={onPlayToggle}
        onReset={onResetPlayback}
        onStep={onStepPlayback}
        onTimelineChange={onTimelineChange}
      />

      {radios.length === 0 && (
        <div className="absolute left-4 top-4 z-[1000] rounded-md border border-border bg-white px-3 py-2 text-sm text-slate shadow">
          En attente des positions radio...
        </div>
      )}

      {(historyLoading || historyError) && selectedRadio && (
        <div className="absolute left-4 top-4 z-[1000] rounded-md border border-border bg-white px-3 py-2 text-sm shadow">
          {historyLoading ? (
            <span className="text-slate">Chargement de l'historique...</span>
          ) : (
            <span className="text-danger">{historyError}</span>
          )}
        </div>
      )}
    </div>
  );
}
