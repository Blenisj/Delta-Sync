import { useState } from "react";
import { TelemetryMetadata } from "./TelemetryMetadata";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import type { TelemetryAnalysisProps } from "../types/racing";
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
import { useTelemetryAnalysis } from "./hooks/useTelemetryAnalysis";
import { formatTime } from "./utils/time";
import { formatIdentifierLabel } from "./utils/displayFormatters";
import { MapPin, Car, Flag } from "lucide-react";

type VisibleLineKey = "speed" | "throttle" | "brake";

export function TelemetryAnalysis({ laps, lastUploadedTelemetry }: TelemetryAnalysisProps) {
  const [visibleLines, setVisibleLines] = useState({
    speed: true,
    throttle: true,
    brake: true,
  });

  const {
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
    maxSpeed,
    avgSpeed,
    avgThrottle,
    avgBrake,
    maxBrake,
    gearChanges,
  } = useTelemetryAnalysis(laps, lastUploadedTelemetry);

  const selectedLap = laps.find((lap) => lap.id === selectedLapId);

  const handleLegendClick = (o: { dataKey?: string }) => {
    const dataKey = o.dataKey as VisibleLineKey | undefined;
    if (!dataKey) {
      return;
    }
    setVisibleLines((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Lap Telemetry</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Track Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Track
              </label>
              <Select value={selectedTrack} onValueChange={handleTrackChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a track" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueTracks.map((track) => (
                    <SelectItem key={track} value={track}>
                      {formatIdentifierLabel(track)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Car Filter */}
            {selectedTrack && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  Car
                </label>
                <Select value={selectedCar} onValueChange={handleCarChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a car" />
                  </SelectTrigger>
                  <SelectContent>
                    {uniqueCars.map((car) => (
                      <SelectItem key={car} value={car}>
                        {formatIdentifierLabel(car)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Lap Select */}
            {selectedCar && filteredLaps.length > 0 && (
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Flag className="h-4 w-4" />
                  Lap
                </label>
                <Select value={selectedLapId} onValueChange={setSelectedLapId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a lap" />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredLaps.map((lap) => (
                      <SelectItem key={lap.id} value={lap.id}>
                        {formatTime(lap.lapTime)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <TelemetryMetadata
        meta={selectedMeta ?? undefined}
        fallbackTrackName={selectedLap?.trackName}
        fallbackCarName={selectedLap?.carModel}
        fallbackLapTimeMs={selectedLap?.lapTime}
      />

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
            {/* --- YOUR MERGE: Replaced the broken hook calculation with the actual lap time --- */}
            <p className="text-2xl font-semibold">{formatTime(selectedLap?.lapTime || 0)}</p>
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