import { useState, useMemo } from "react";
import type { LapData } from "../../types/racing";
import {
  getBrakingSeries,
  getGasSeries,
  getGearSeries,
  getDeltaTimeSeries,
} from "../../telemetry/index";
import { seedTelemetryById, seedTelemetryMetaById } from "../../data/seedLaps";
import { interpolateArray } from "../utils/interpolate";

export function useLapComparison(laps: LapData[]) {
  const [selectedTrack, setSelectedTrack] = useState<string>("");
  const [selectedLap1, setSelectedLap1] = useState<string>("");
  const [selectedLap2, setSelectedLap2] = useState<string>("");
  const [selectedTelemetryType, setSelectedTelemetryType] = useState<string>("throttle-brake");
  const [selectedSector, setSelectedSector] = useState<string>("whole");

  // Get unique tracks from laps
  const uniqueTracks = useMemo(() => {
    const tracks = [...new Set(laps.map(lap => lap.trackName))];
    return tracks.sort();
  }, [laps]);

  // Filter laps by selected track
  const trackLaps = useMemo(() => {
    if (!selectedTrack) return [];
    return laps.filter(lap => lap.trackName === selectedTrack);
  }, [laps, selectedTrack]);

  const lap1 = trackLaps.find(lap => lap.id === selectedLap1);
  const lap2 = trackLaps.find(lap => lap.id === selectedLap2);

  // Load telemetry data for selected laps
  const telemetry1 = useMemo(() => {
    if (!lap1) return [];
    const stored = JSON.parse(localStorage.getItem("telemetryByLapId") || "{}");
    return stored[lap1.id] || seedTelemetryById[lap1.id] || [];
  }, [lap1]);

  const telemetry2 = useMemo(() => {
    if (!lap2) return [];
    const stored = JSON.parse(localStorage.getItem("telemetryByLapId") || "{}");
    return stored[lap2.id] || seedTelemetryById[lap2.id] || [];
  }, [lap2]);

  const meta1 = useMemo(() => {
    if (!lap1) return null;
    const storedMeta = JSON.parse(localStorage.getItem("telemetryMetaByLapId") || "{}");
    return storedMeta[lap1.id] || seedTelemetryMetaById[lap1.id] || null;
  }, [lap1]);

  const meta2 = useMemo(() => {
    if (!lap2) return null;
    const storedMeta = JSON.parse(localStorage.getItem("telemetryMetaByLapId") || "{}");
    return storedMeta[lap2.id] || seedTelemetryMetaById[lap2.id] || null;
  }, [lap2]);

  // Compute telemetry series for comparison
  const braking1 = useMemo(() => getBrakingSeries(telemetry1), [telemetry1]);
  const braking2 = useMemo(() => getBrakingSeries(telemetry2), [telemetry2]);
  const gas1 = useMemo(() => getGasSeries(telemetry1), [telemetry1]);
  const gas2 = useMemo(() => getGasSeries(telemetry2), [telemetry2]);
  const gear1 = useMemo(() => getGearSeries(telemetry1), [telemetry1]);
  const gear2 = useMemo(() => getGearSeries(telemetry2), [telemetry2]);
  const delta1 = useMemo(() => getDeltaTimeSeries(telemetry1, meta1 ?? undefined), [telemetry1, meta1]);
  const delta2 = useMemo(() => getDeltaTimeSeries(telemetry2, meta2 ?? undefined), [telemetry2, meta2]);

  // Determine max length for scaling
  const maxLength = Math.max(
    gas1.length, gas2.length, braking1.length, braking2.length,
    gear1.length, gear2.length, delta1.length, delta2.length
  );

  // Interpolate series to max length
  const gas1_interp = interpolateArray(gas1, maxLength);
  const gas2_interp = interpolateArray(gas2, maxLength);
  const braking1_interp = interpolateArray(braking1, maxLength);
  const braking2_interp = interpolateArray(braking2, maxLength);
  const gear1_interp = interpolateArray(gear1, maxLength);
  const gear2_interp = interpolateArray(gear2, maxLength);
  const delta1_interp = interpolateArray(delta1.map(d => ({ deltaMs: d.deltaMs })), maxLength).map(d => d.deltaMs);
  const delta2_interp = interpolateArray(delta2.map(d => ({ deltaMs: d.deltaMs })), maxLength).map(d => d.deltaMs);

  // Compute sector boundaries (divide lap into 3 equal portions)
  const sectorBoundaries = useMemo(() => {
    let startIdx = 0;
    let endIdx = maxLength - 1;
    if (selectedSector !== "whole") {
      const sectorIndex = parseInt(selectedSector) - 1;
      const portion = maxLength / 3;
      startIdx = Math.floor(sectorIndex * portion);
      endIdx = Math.floor((sectorIndex + 1) * portion) - 1;
      if (sectorIndex === 2) endIdx = maxLength - 1; // Ensure last sector goes to end
    }
    return { startIdx, endIdx };
  }, [selectedSector, maxLength]);

  // Slice interpolated arrays based on sector
  const gas1_sliced = gas1_interp.slice(sectorBoundaries.startIdx, sectorBoundaries.endIdx + 1);
  const gas2_sliced = gas2_interp.slice(sectorBoundaries.startIdx, sectorBoundaries.endIdx + 1);
  const braking1_sliced = braking1_interp.slice(sectorBoundaries.startIdx, sectorBoundaries.endIdx + 1);
  const braking2_sliced = braking2_interp.slice(sectorBoundaries.startIdx, sectorBoundaries.endIdx + 1);
  const gear1_sliced = gear1_interp.slice(sectorBoundaries.startIdx, sectorBoundaries.endIdx + 1);
  const gear2_sliced = gear2_interp.slice(sectorBoundaries.startIdx, sectorBoundaries.endIdx + 1);
  const delta1_sliced = delta1_interp.slice(sectorBoundaries.startIdx, sectorBoundaries.endIdx + 1);
  const delta2_sliced = delta2_interp.slice(sectorBoundaries.startIdx, sectorBoundaries.endIdx + 1);

  // Prepare comparison data for charts with normalized progress
  const throttleBrakeComparison = useMemo(() => {
    return Array.from({ length: gas1_sliced.length }, (_, i) => ({
      progress: i / (gas1_sliced.length - 1 || 1),
      throttle1: gas1_sliced[i]?.throttle ?? 0,
      throttle2: gas2_sliced[i]?.throttle ?? 0,
      brake1: braking1_sliced[i]?.brake ?? 0,
      brake2: braking2_sliced[i]?.brake ?? 0,
    }));
  }, [gas1_sliced, gas2_sliced, braking1_sliced, braking2_sliced]);

  const gearComparison = useMemo(() => {
    return Array.from({ length: gear1_sliced.length }, (_, i) => ({
      progress: i / (gear1_sliced.length - 1 || 1),
      gear1: gear1_sliced[i]?.gear ?? "N",
      gear2: gear2_sliced[i]?.gear ?? "N",
    }));
  }, [gear1_sliced, gear2_sliced]);

  const deltaComparison = useMemo(() => {
    return Array.from({ length: delta1_sliced.length }, (_, i) => ({
      progress: i / (delta1_sliced.length - 1 || 1),
      delta1: delta1_sliced[i] ?? 0,
      delta2: delta2_sliced[i] ?? 0,
    }));
  }, [delta1_sliced, delta2_sliced]);

  // Calculate gear change differences
  const gearChanges1 = gear1.reduce((acc, curr, i, arr) => {
    if (i === 0) return 0;
    return acc + (arr[i - 1].gear !== curr.gear ? 1 : 0);
  }, 0);

  const gearChanges2 = gear2.reduce((acc, curr, i, arr) => {
    if (i === 0) return 0;
    return acc + (arr[i - 1].gear !== curr.gear ? 1 : 0);
  }, 0);

  const sectorComparisonData = lap1 && lap2 ? [
    {
      sector: "Sector 1",
      lap1: lap1.sectorTimes[0] / 1000,
      lap2: lap2.sectorTimes[0] / 1000,
      difference: (lap2.sectorTimes[0] - lap1.sectorTimes[0]) / 1000
    },
    {
      sector: "Sector 2",
      lap1: lap1.sectorTimes[1] / 1000,
      lap2: lap2.sectorTimes[1] / 1000,
      difference: (lap2.sectorTimes[1] - lap1.sectorTimes[1]) / 1000
    },
    {
      sector: "Sector 3",
      lap1: lap1.sectorTimes[2] / 1000,
      lap2: lap2.sectorTimes[2] / 1000,
      difference: (lap2.sectorTimes[2] - lap1.sectorTimes[2]) / 1000
    }
  ] : [];

  // Reset selections when track changes
  const handleTrackChange = (track: string) => {
    setSelectedTrack(track);
    setSelectedLap1("");
    setSelectedLap2("");
  };

  return {
    selectedTrack,
    setSelectedTrack,
    selectedLap1,
    setSelectedLap1,
    selectedLap2,
    setSelectedLap2,
    selectedTelemetryType,
    setSelectedTelemetryType,
    selectedSector,
    setSelectedSector,
    uniqueTracks,
    trackLaps,
    lap1,
    lap2,
    throttleBrakeComparison,
    gearComparison,
    deltaComparison,
    gearChanges1,
    gearChanges2,
    sectorComparisonData,
    handleTrackChange,
  };
}