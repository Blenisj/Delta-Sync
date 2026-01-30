import React, { useEffect, useState, useMemo } from "react";
import { TelemetryMetadata } from "./TelemetryMetadata";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { LapData } from "../types/racing";
import {
  getBrakingSeries,
  getGasSeries,
  getGearSeries,
  getDeltaTimeSeries,
  type TelemetrySample,
  type TelemetryMeta,
} from "../telemetry";
import { seedTelemetryById, seedTelemetryMetaById } from "../data/seedLaps";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend as RechartLegend,
} from "recharts";

interface TelemetryAnalysisProps {
  laps: LapData[];
  lastUploadedTelemetry?: any[];
}

export function TelemetryAnalysis({ laps, lastUploadedTelemetry }: TelemetryAnalysisProps) {
  const [telemetry, setTelemetry] = useState<TelemetrySample[]>([]);
  const [selectedLapId, setSelectedLapId] = useState<string>("");
  const [selectedMeta, setSelectedMeta] = useState<TelemetryMeta | null>(null);
  const [visibleLines, setVisibleLines] = useState({
    speed: true,
    throttle: true,
    brake: true,
  });

  useEffect(() => {
    if (!selectedLapId && laps.length > 0) {
      setSelectedLapId(laps[0].id); // Default to first lap
    }
  }, [laps, selectedLapId]);

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
        seedTelemetryMetaById[selectedLapId] ?? // Fixed: was seedTelemetryMetaByLapId
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

  const lapDurationMs = deltaSeries.length
    ? deltaSeries[deltaSeries.length - 1].deltaMs
    : 0;

  const handleLegendClick = (o: any) => {
    const { dataKey } = o;
    setVisibleLines((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Lap Telemetry</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedLapId} onValueChange={setSelectedLapId}>
            <SelectTrigger>
              <SelectValue placeholder="Select lap" />
            </SelectTrigger>
            <SelectContent>
              {laps.map((lap) => (
                <SelectItem key={lap.id} value={lap.id}>
                  {lap.trackName} — {lap.carModel} — {(lap.lapTime / 1000).toFixed(3)}s
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <TelemetryMetadata meta={selectedMeta ?? undefined} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Braking</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Avg Brake</p>
            <p className="text-2xl font-semibold">{(avgBrake * 100).toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Max { (maxBrake * 100).toFixed(1) }%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Throttle</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Avg Throttle</p>
            <p className="text-2xl font-semibold">{(avgThrottle * 100).toFixed(1)}%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delta Time</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Lap Duration</p>
            <p className="text-2xl font-semibold">{(lapDurationMs / 1000).toFixed(3)}s</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gear</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Gear Changes</p>
            <p className="text-2xl font-semibold">{gearChanges}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Telemetry Analysis</CardTitle>
          <p className="text-muted-foreground text-sm">
            Gran Turismo–style data overlay for speed, throttle & brake
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-sm text-muted-foreground">Max Speed</p>
              <p className="text-2xl font-semibold">{maxSpeed.toFixed(1)} km/h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Avg Speed</p>
              <p className="text-2xl font-semibold">{avgSpeed.toFixed(1)} km/h</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Full Throttle</p>
              <p className="text-2xl font-semibold">{(avgThrottle * 100).toFixed(1)}%</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Braking Time</p>
              <p className="text-2xl font-semibold">{(avgBrake * 100).toFixed(1)}%</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Telemetry Graph</CardTitle>
          <p className="text-muted-foreground text-sm">
            Speed (blue), Throttle (green), and Brake (red)
          </p>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={400}>
            <LineChart
              data={telemetry.map((t, i) => ({
                index: i,
                speed: Number(t.speed),
                throttle: Number(t.throttle),
                brake: Number(t.brake),
              }))}
              margin={{ top: 20, right: 50, left: 20, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis
                dataKey="index"
                label={{ value: "Time Samples", position: "insideBottom", offset: -5 }}
                tickFormatter={(v: number) => `${v}`}
              />
              <YAxis
                yAxisId="left"
                domain={[0, Math.max(...telemetry.map((t) => t.speed || 0)) + 10]}
                label={{ value: "Speed (km/h)", angle: -90, position: "insideLeft" }}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                domain={[0, 1]}
                label={{ value: "Pedal Input", angle: 90, position: "insideRight" }}
              />
              <Tooltip />
              <RechartLegend onClick={handleLegendClick} />

              {/* Speed Line */}
              <Line
                yAxisId="left"
                type="monotone"
                dataKey="speed"
                stroke="#38bdf8"
                strokeWidth={2}
                dot={false}
                name="speed"
                opacity={visibleLines.speed ? 1 : 0.25}
                hide={!visibleLines.speed}
              />

              {/* Throttle Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="throttle"
                stroke="#22c55e"
                strokeWidth={2}
                dot={false}
                name="throttle"
                opacity={visibleLines.throttle ? 1 : 0.25}
                hide={!visibleLines.throttle}
              />

              {/* Brake Line */}
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="brake"
                stroke="#ef4444"
                strokeWidth={2}
                dot={false}
                name="brake"
                opacity={visibleLines.brake ? 1 : 0.25}
                hide={!visibleLines.brake}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
