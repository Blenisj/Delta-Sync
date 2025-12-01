import { TelemetryMetadata } from "./TelemetryMetadata";
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
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

export function TelemetryAnalysis() {
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [visibleLines, setVisibleLines] = useState({
    speed: true,
    throttle: true,
    brake: true,
  });

  useEffect(() => {
    try {
      const saved = localStorage.getItem("lastUploadedTelemetry");
      if (saved) {
        const parsed = JSON.parse(saved);
        console.log("Telemetry data being graphed:", parsed.slice(0, 10));
        setTelemetry(parsed);
      }
    } catch (err) {
      console.error("Failed to parse telemetry:", err);
    }
  }, []);

  const handleLegendClick = (o: any) => {
    const { dataKey } = o;
    setVisibleLines((prev) => ({ ...prev, [dataKey]: !prev[dataKey] }));
  };

  const maxSpeed = telemetry.length ? Math.max(...telemetry.map((t) => t.speed)) : 0;
  const avgSpeed = telemetry.length
    ? telemetry.reduce((a, b) => a + b.speed, 0) / telemetry.length
    : 0;
  const avgThrottle = telemetry.length
    ? telemetry.reduce((a, b) => a + b.throttle, 0) / telemetry.length
    : 0;
  const avgBrake = telemetry.length
    ? telemetry.reduce((a, b) => a + b.brake, 0) / telemetry.length
    : 0;

  return (
    <div className="space-y-6">
      <TelemetryMetadata />
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
              <p className="text-2xl font-semibold">
                {(avgThrottle * 100).toFixed(1)}%
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Braking Time</p>
              <p className="text-2xl font-semibold">
                {(avgBrake * 100).toFixed(1)}%
              </p>
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
