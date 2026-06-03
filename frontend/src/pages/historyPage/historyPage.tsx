import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { readRadioHistory, subscribeToRadioLocations } from "@/services/getRadioService.ts";
import { useRadioStore } from "@/store/radioStore.ts";
import type { TileKey } from "@/lib/tileLayers.ts";
import type { Radio } from "@/types/Radio.ts";
import { HistoryHeader } from "./components/HistoryHeader.tsx";
import { HistoryMap } from "./components/HistoryMap.tsx";
import { HistorySidebar } from "./components/HistorySidebar.tsx";
import "@/pages/mapPage/map.css";

const PLAYBACK_STEP_MS = 900;

export default function HistoryPage() {
  const { state } = useLocation();
  const initialRadioId = (state as { radioId?: string } | null)?.radioId ?? null;
  const radios = useRadioStore((s) => s.radios);
  const radioTrails = useRadioStore((s) => s.radioTrails);
  const upsertRadios = useRadioStore((s) => s.upsertRadios);
  const setRadioTrail = useRadioStore((s) => s.setRadioTrail);
  const [selectedId, setSelectedId] = useState<string | null>(initialRadioId);
  const [tileKey, setTileKey] = useState<TileKey>("plan");
  const [loadingHistoryId, setLoadingHistoryId] = useState<string | null>(null);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [playbackIndex, setPlaybackIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const source = subscribeToRadioLocations({
      onRadios: upsertRadios,
    });

    return () => source?.close();
  }, [upsertRadios]);

  useEffect(() => {
    if (!selectedId && radios.length > 0) {
      setSelectedId(initialRadioId ?? radios[0].radioId);
    }
  }, [initialRadioId, radios, selectedId]);

  const selectedRadio = useMemo(
    () => radios.find((radio) => radio.radioId === selectedId) ?? radios[0] ?? null,
    [radios, selectedId],
  );

  const handleSelect = useCallback((radio: Radio) => {
    setSelectedId(radio.radioId);
  }, []);

  useEffect(() => {
    setPlaybackIndex(0);
    setPlaying(false);
  }, [selectedRadio?.radioId]);

  useEffect(() => {
    const radioId = selectedRadio?.radioId;
    if (!radioId) return;

    let cancelled = false;
    setLoadingHistoryId(radioId);
    setHistoryError(null);

    readRadioHistory(radioId)
      .then((trail) => {
        if (cancelled) return;
        setRadioTrail(radioId, trail);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("[radio-history] Failed to load radio history", error);
        setHistoryError("Impossible de charger l'historique de cette radio.");
      })
      .finally(() => {
        if (!cancelled) setLoadingHistoryId(null);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedRadio?.radioId, setRadioTrail]);

  const selectedTrail = selectedRadio ? (radioTrails[selectedRadio.radioId] ?? []) : [];
  const maxPlaybackIndex = Math.max(0, selectedTrail.length - 1);

  useEffect(() => {
    setPlaybackIndex((index) => Math.min(index, maxPlaybackIndex));
    if (selectedTrail.length < 2) {
      setPlaying(false);
    }
  }, [maxPlaybackIndex, selectedTrail.length]);

  useEffect(() => {
    if (!playing || selectedTrail.length < 2) return;

    const intervalId = window.setInterval(() => {
      setPlaybackIndex((index) => {
        if (index >= maxPlaybackIndex) {
          setPlaying(false);
          return index;
        }

        return index + 1;
      });
    }, PLAYBACK_STEP_MS);

    return () => window.clearInterval(intervalId);
  }, [maxPlaybackIndex, playing, selectedTrail.length]);

  const trailPositions = useMemo(
    () => selectedTrail.map((point) => [point.latitude, point.longitude] as [number, number]),
    [selectedTrail],
  );
  const elapsedTrailPositions = useMemo(
    () =>
      selectedTrail
        .slice(0, playbackIndex + 1)
        .map((point) => [point.latitude, point.longitude] as [number, number]),
    [playbackIndex, selectedTrail],
  );
  const latestTrailPoint = selectedTrail[selectedTrail.length - 1];
  const playbackPoint = selectedTrail[playbackIndex] ?? null;
  const playbackRadio = useMemo<Radio | null>(() => {
    if (!selectedRadio || !playbackPoint) return null;

    return {
      ...selectedRadio,
      latitude: playbackPoint.latitude,
      longitude: playbackPoint.longitude,
      battery: playbackPoint.battery,
      signalStrength: playbackPoint.signalStrength,
      timestamp: playbackPoint.timestamp,
    };
  }, [playbackPoint, selectedRadio]);
  const historyLoading = selectedRadio?.radioId === loadingHistoryId;
  const canPlayback = selectedTrail.length > 1;

  const resetPlayback = () => {
    setPlaying(false);
    setPlaybackIndex(0);
  };

  const stepPlayback = (direction: -1 | 1) => {
    setPlaying(false);
    setPlaybackIndex((index) => Math.max(0, Math.min(maxPlaybackIndex, index + direction)));
  };

  const changeTimeline = (index: number) => {
    setPlaying(false);
    setPlaybackIndex(index);
  };

  return (
    <div className="-m-6 flex h-[calc(100vh-3.5rem)] w-[calc(100%+3rem)] bg-surface">
      <HistorySidebar
        radios={radios}
        pointCount={selectedTrail.length}
        selectedRadioId={selectedRadio?.radioId}
        onSelect={handleSelect}
      />

      <div className="relative flex min-w-0 flex-1 flex-col">
        <HistoryHeader
          canPlayback={canPlayback}
          playbackIndex={playbackIndex}
          playbackPoint={playbackPoint}
          pointCount={selectedTrail.length}
          selectedRadio={selectedRadio}
          latestTrailPoint={latestTrailPoint}
        />

        <HistoryMap
          canPlayback={canPlayback}
          elapsedTrailPositions={elapsedTrailPositions}
          historyError={historyError}
          historyLoading={historyLoading}
          maxPlaybackIndex={maxPlaybackIndex}
          onPlayToggle={() => setPlaying((value) => !value)}
          onRadioSelect={handleSelect}
          onResetPlayback={resetPlayback}
          onStepPlayback={stepPlayback}
          onTileChange={setTileKey}
          onTimelineChange={changeTimeline}
          playbackIndex={playbackIndex}
          playbackPoint={playbackPoint}
          playbackRadio={playbackRadio}
          playing={playing}
          pointCount={selectedTrail.length}
          radios={radios}
          selectedRadio={selectedRadio}
          tileKey={tileKey}
          trailPositions={trailPositions}
        />
      </div>
    </div>
  );
}
