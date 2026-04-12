import { useEffect, useState, useMemo } from "react";
import type { LapData } from "../../types/racing";
import type { TelemetrySample, TelemetryMeta } from "../../telemetry/index";
import {
  getBrakingSeries,
  getGasSeries,
  getGearSeries,
  getDeltaTimeSeries,
} from "../../telemetry/index";
import { seedTelemetryById, seedTelemetryMetaById } from "../../data/seedLaps";

export interface TelemetryAnalysisData {
  telemetry: TelemetrySample[];
  selectedMeta: TelemetryMeta | null;
  brakingSeries: any[];
  gasSeries: any[];
  gearSeries: any[];
  deltaSeries: any[];
  maxSpeed: number;
  avgSpeed: number;
  avgThrottle: number;
  avgBrake: number;
  maxBrake: number;
  gearChanges: number;
  lapDurationMs: number;
}

export function useTelemetryAnalysis(laps: LapData[], lastUploadedTelemetry?: any[]) {
  const [telemetry, setTelemetry] = useState<TelemetrySample[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedCar, setSelectedCar] = useState<string>("");
  const [selectedLapId, setSelectedLapId] = useState<string>("");
  const [selectedMeta, setSelectedMeta] = useState<TelemetryMeta | null>(null);

  const uniqueTracks = useMemo(() => {
    return [...new Set(laps.map((l) => l.trackName))].sort();
  }, [laps]);

  const uniqueCars = useMemo(() => {
    if (!selectedTrack) return [];
    const cars = laps
      .filter((l) => l.trackName === selectedTrack)
      .map((l) => l.carModel);
    return [...new Set(cars)].sort();
  }, [laps, selectedTrack]);

  const filteredLaps = useMemo(() => {
    if (!selectedTrack || !selectedCar) return [];
    return laps.filter(
      (l) => l.trackName === selectedTrack && l.carModel === selectedCar
    );
  }, [laps, selectedTrack, selectedCar]);

  const handleTrackChange = (track: string) => {
    setSelectedTrack(track);
    setSelectedCar("");
    setSelectedLapId("");
  };

  const handleCarChange = (car: string) => {
    setSelectedCar(car);
    setSelectedLapId("");
  };

  // Auto-select when only one option exists
  useEffect(() => {
    if (selectedTrack && uniqueCars.length === 1 && !selectedCar) {
      setSelectedCar(uniqueCars[0]);
    }
  }, [selectedTrack, uniqueCars, selectedCar]);

  useEffect(() => {
    if (!selectedLapId && filteredLaps.length > 0) {
      setSelectedLapId(filteredLaps[0].id);
    }
  }, [filteredLaps, selectedLapId]);

  useEffect(() => {
    if (!selectedLapId) return;

    try {
      const stored = JSON.parse(localStorage.getItem("telemetryByLapId") || "{}");
      const storedMeta = JSON.parse(localStorage.getItem("telemetryMetaByLapId") || "{}");

      const lapTelemetry =
        stored[selectedLapId] ??
        seedTelemetryById[selectedLapId] ??
        lastUploadedTelemetry ??
        [];

      const lapMeta =
        storedMeta[selectedLapId] ??
        seedTelemetryMetaById[selectedLapId] ??
        null;

      setTelemetry(lapTelemetry);
      setSelectedMeta(lapMeta);
    } catch (error) {
      console.error("Error loading telemetry:", error);
      setTelemetry([]);
      setSelectedMeta(null);
    }
  }, [selectedLapId, lastUploadedTelemetry]);

  const brakingSeries = useMemo(() => getBrakingSeries(telemetry), [telemetry]);
  const gasSeries = useMemo(() => getGasSeries(telemetry), [telemetry]);
  const gearSeries = useMemo(() => getGearSeries(telemetry), [telemetry]);
  const deltaSeries = useMemo(
    () => getDeltaTimeSeries(telemetry, selectedMeta ?? undefined),
    [telemetry, selectedMeta]
  );

  const maxSpeed = telemetry.length ? Math.max(...telemetry.map((t) => t.speed ?? 0)) : 0;
  const avgSpeed = telemetry.length
    ? telemetry.reduce((a, b) => a + (b.speed ?? 0), 0) / telemetry.length
    : 0;

  const avgThrottle = gasSeries.length
    ? gasSeries.reduce((a, b) => a + b.throttle, 0) / gasSeries.length
    : 0;

  const avgBrake = brakingSeries.length
    ? brakingSeries.reduce((a, b) => a + b.brake, 0) / brakingSeries.length
    : 0;

  const maxBrake = brakingSeries.length
    ? Math.max(...brakingSeries.map((b) => b.brake))
    : 0;

  const gearChanges = gearSeries.reduce((acc, curr, i, arr) => {
    if (i === 0) return 0;
    return acc + (arr[i - 1].gear !== curr.gear ? 1 : 0);
  }, 0);

  const lapDurationMs =
    selectedMeta?.lap_duration_ms ??
    selectedMeta?.best_lap_time_ms ??
    laps.find((l) => l.id === selectedLapId)?.lapTime ??
    (deltaSeries.length ? deltaSeries[deltaSeries.length - 1].deltaMs : 0);

  return {
    telemetry,
    selectedTrack,
    selectedCar,
    selectedLapId,
    setSelectedLapId,
    uniqueTracks,
    uniqueCars,
    filteredLaps,
    handleTrackChange,
    handleCarChange,
    selectedMeta,
    brakingSeries,
    gasSeries,
    gearSeries,
    deltaSeries,
    maxSpeed,
    avgSpeed,
    avgThrottle,
    avgBrake,
    maxBrake,
    gearChanges,
    lapDurationMs,
  };
}