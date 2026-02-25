import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingDown, TrendingUp, Clock, AlertCircle, Target, GitCompare, MapPin, Activity } from "lucide-react";
import type { LapData } from "../types/racing";
import { seedTelemetryById, seedTelemetryMetaById } from "../data/seedLaps";
import {
  getBrakingSeries,
  getGasSeries,
  getGearSeries,
  getDeltaTimeSeries,
  type TelemetrySample,
  type TelemetryMeta,
} from "../telemetry";

interface LapComparisonProps {
  laps: LapData[];
}

export function LapComparison({ laps }: LapComparisonProps) {
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

  // Helper function to interpolate array to new length
  const interpolateArray = (arr: any[], newLength: number) => {
    if (arr.length === newLength || arr.length === 0) return arr;
    const result = [];
    for (let i = 0; i < newLength; i++) {
      const pos = (i / (newLength - 1)) * (arr.length - 1);
      const idx = Math.floor(pos);
      const frac = pos - idx;
      if (idx + 1 < arr.length) {
        const a = arr[idx];
        const b = arr[idx + 1];
        const interpolated: any = {};
        for (const key in a) {
          if (typeof a[key] === 'number' && typeof b[key] === 'number') {
            interpolated[key] = a[key] * (1 - frac) + b[key] * frac;
          } else {
            interpolated[key] = a[key]; // Copy non-numeric fields
          }
        }
        result.push(interpolated);
      } else {
        result.push(arr[idx]);
      }
    }
    return result;
  };

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

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(3);
    return `${minutes}:${seconds.padStart(6, '0')}`;
  };

  const formatTimeDifference = (ms: number) => {
    const sign = ms >= 0 ? '+' : '';
    return `${sign}${(ms / 1000).toFixed(3)}s`;
  };

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

  const renderTelemetryChart = () => {
    switch (selectedTelemetryType) {
      case "throttle":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Throttle Input</h4>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={throttleBrakeComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="progress" domain={[0, 1]} />
                <YAxis domain={[0, 1]} />
                <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                <Line type="monotone" dataKey="throttle1" stroke="#8884d8" name="Throttle Lap1" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="throttle2" stroke="#82ca9d" name="Throttle Lap2" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "brake":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Brake Input</h4>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={throttleBrakeComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="progress" domain={[0, 1]} />
                <YAxis domain={[0, 1]} />
                <Tooltip formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`} />
                <Line type="monotone" dataKey="brake1" stroke="#ff7300" name="Brake Lap1" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="brake2" stroke="#ff0000" name="Brake Lap2" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "gear":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Gear Changes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{gearChanges1}</div>
                  <p className="text-xs text-muted-foreground">Gear Changes - {lap1?.trackName}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{gearChanges2}</div>
                  <p className="text-xs text-muted-foreground">Gear Changes - {lap2?.trackName}</p>
                </CardContent>
              </Card>
            </div>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={gearComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="progress" domain={[0, 1]} />
                <YAxis />
                <Tooltip />
                <Line type="stepAfter" dataKey="gear1" stroke="#8884d8" name="Gear Lap1" strokeWidth={1} dot={false} />
                <Line type="stepAfter" dataKey="gear2" stroke="#82ca9d" name="Gear Lap2" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "delta":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Delta Time Progression</h4>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={deltaComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="progress" domain={[0, 1]} />
                <YAxis />
                <Tooltip formatter={(value) => `${(Number(value) / 1000).toFixed(3)}s`} />
                <Line type="monotone" dataKey="delta1" stroke="#8884d8" name="Delta Lap1" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="delta2" stroke="#82ca9d" name="Delta Lap2" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "sector":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Sector-by-Sector Analysis</h4>
            <ResponsiveContainer width="100%" height={500}>
              <BarChart data={sectorComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="sector" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    `${Number(value).toFixed(3)}s`, 
                    name === 'lap1' ? 'Reference' : 'Comparison'
                  ]}
                />
                <Bar dataKey="lap1" fill="#8884d8" name="lap1" />
                <Bar dataKey="lap2" fill="#82ca9d" name="lap2" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lap Comparison
          </CardTitle>
          <CardDescription>
            Compare two laps from the same track to analyze telemetry differences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Track Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Select Track
              </label>
              <Select value={selectedTrack} onValueChange={handleTrackChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a track to compare laps" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueTracks.map((track) => (
                    <SelectItem key={track} value={track}>
                      {track}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTrack && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Lap (Lap 1)</label>
                  <Select value={selectedLap1} onValueChange={setSelectedLap1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reference lap" />
                    </SelectTrigger>
                    <SelectContent>
                      {trackLaps.map((lap) => (
                        <SelectItem key={lap.id} value={lap.id}>
                          {formatTime(lap.lapTime)} - {lap.carModel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Comparison Lap (Lap 2)</label>
                  <Select value={selectedLap2} onValueChange={setSelectedLap2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select comparison lap" />
                    </SelectTrigger>
                    <SelectContent>
                      {trackLaps.map((lap) => (
                        <SelectItem key={lap.id} value={lap.id}>
                          {formatTime(lap.lapTime)} - {lap.carModel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTrack && trackLaps.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No laps found for {selectedTrack}. Upload some laps for this track first!
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTrack && trackLaps.length > 0 && trackLaps.length < 2 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Need at least 2 laps on {selectedTrack} to compare. Upload another lap for this track!
            </div>
          </CardContent>
        </Card>
      )}

      {lap1 && lap2 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Reference Lap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{formatTime(lap1.lapTime)}</div>
                  <div className="text-sm text-muted-foreground">{lap1.trackName}</div>
                  <div className="text-sm text-muted-foreground">{lap1.carModel}</div>
                  <Badge variant="secondary">{lap1.weather}</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Comparison Lap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{formatTime(lap2.lapTime)}</div>
                  <div className="text-sm text-muted-foreground">{lap2.trackName}</div>
                  <div className="text-sm text-muted-foreground">{lap2.carModel}</div>
                  <Badge variant="secondary">{lap2.weather}</Badge>
                  <div className="flex items-center gap-2 mt-2">
                    {lap2.lapTime < lap1.lapTime ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    )}
                    <span className={lap2.lapTime < lap1.lapTime ? "text-green-500" : "text-red-500"}>
                      {formatTimeDifference(lap2.lapTime - lap1.lapTime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Telemetry Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Telemetry Comparison
              </CardTitle>
              <CardDescription>
                Select a telemetry type to compare between laps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Telemetry Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Telemetry Type</label>
                <Select value={selectedTelemetryType} onValueChange={setSelectedTelemetryType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose telemetry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="throttle">Throttle Input</SelectItem>
                    <SelectItem value="brake">Brake Input</SelectItem>
                    <SelectItem value="gear">Gear Changes</SelectItem>
                    <SelectItem value="delta">Delta Time Progression</SelectItem>
                    <SelectItem value="sector">Sector-by-Sector Analysis</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sector Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Sector</label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose sector to display" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whole">Whole Lap</SelectItem>
                    <SelectItem value="1">Sector 1</SelectItem>
                    <SelectItem value="2">Sector 2</SelectItem>
                    <SelectItem value="3">Sector 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Render Selected Chart */}
              {renderTelemetryChart()}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedTrack && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Select a track above to start comparing laps.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}