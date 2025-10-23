import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Button } from "./ui/button";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ComposedChart, Area, AreaChart } from "recharts";
import { Activity, Gauge, Zap, RotateCcw } from "lucide-react";
import type { LapData, TelemetryData, TelemetryPoint } from "../types/racing";

interface TelemetryAnalysisProps {
  laps: LapData[];
}

export function TelemetryAnalysis({ laps }: TelemetryAnalysisProps) {
  const [selectedLap, setSelectedLap] = useState<string>("");
  const [selectedMetric, setSelectedMetric] = useState<string>("speed");

  // Generate mock telemetry data for the selected lap
  const generateMockTelemetry = (lap: LapData): TelemetryData => {
    const points: TelemetryPoint[] = [];
    const totalTime = lap.lapTime;
    const numPoints = 200;
    
    for (let i = 0; i < numPoints; i++) {
      const timestamp = (i / numPoints) * totalTime;
      const progress = i / numPoints;
      
      // Generate realistic telemetry curves
      const baseSpeed = 120 + Math.sin(progress * Math.PI * 6) * 40;
      const speed = Math.max(50, baseSpeed + (Math.random() - 0.5) * 20);
      
      const throttle = Math.max(0, Math.min(100, 
        progress < 0.1 ? 100 : // Full throttle at start
        Math.sin(progress * Math.PI * 8) * 50 + 50 + (Math.random() - 0.5) * 20
      ));
      
      const brake = throttle < 30 ? Math.max(0, Math.min(100, 
        80 - throttle + (Math.random() - 0.5) * 30
      )) : 0;
      
      const steering = Math.sin(progress * Math.PI * 12) * 45 + (Math.random() - 0.5) * 20;
      const gear = Math.max(1, Math.min(6, Math.floor(speed / 40) + 1));
      const rpm = Math.min(8000, speed * 30 + gear * 1000 + (Math.random() - 0.5) * 500);
      
      points.push({
        timestamp,
        speed,
        throttle,
        brake,
        steering,
        gear,
        rpm,
        distance: (progress * 5000) // Assume 5km track
      });
    }
    
    return {
      lapId: lap.id,
      points
    };
  };

  const selectedLapData = laps.find(lap => lap.id === selectedLap);
  const telemetryData = selectedLapData ? generateMockTelemetry(selectedLapData) : null;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(1);
    return `${minutes}:${seconds.padStart(4, '0')}`;
  };

  const chartData = telemetryData?.points.map(point => ({
    time: point.timestamp / 1000, // Convert to seconds
    speed: point.speed,
    throttle: point.throttle,
    brake: point.brake,
    steering: point.steering,
    gear: point.gear,
    rpm: point.rpm,
    distance: point.distance
  })) || [];

  const getMetricConfig = (metric: string) => {
    switch (metric) {
      case "speed":
        return { key: "speed", color: "#8884d8", unit: "km/h", name: "Speed" };
      case "throttle":
        return { key: "throttle", color: "#82ca9d", unit: "%", name: "Throttle" };
      case "brake":
        return { key: "brake", color: "#ff7300", unit: "%", name: "Brake" };
      case "steering":
        return { key: "steering", color: "#ff0080", unit: "°", name: "Steering" };
      case "rpm":
        return { key: "rpm", color: "#ff4444", unit: "RPM", name: "Engine RPM" };
      default:
        return { key: "speed", color: "#8884d8", unit: "km/h", name: "Speed" };
    }
  };

  const metricConfig = getMetricConfig(selectedMetric);

  const getStats = () => {
    if (!telemetryData) return null;
    
    const speeds = telemetryData.points.map(p => p.speed);
    const throttleData = telemetryData.points.map(p => p.throttle);
    const brakeData = telemetryData.points.map(p => p.brake);
    
    return {
      maxSpeed: Math.max(...speeds),
      avgSpeed: speeds.reduce((a, b) => a + b, 0) / speeds.length,
      fullThrottleTime: (throttleData.filter(t => t > 95).length / throttleData.length) * 100,
      brakingTime: (brakeData.filter(b => b > 10).length / brakeData.length) * 100
    };
  };

  const stats = getStats();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Telemetry Analysis</CardTitle>
          <CardDescription>
            Detailed analysis of your lap telemetry data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Lap</label>
              <Select onValueChange={setSelectedLap}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a lap to analyze" />
                </SelectTrigger>
                <SelectContent>
                  {laps.map((lap) => (
                    <SelectItem key={lap.id} value={lap.id}>
                      {formatTime(lap.lapTime)} - {lap.trackName} ({lap.carModel})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Metric to Display</label>
              <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="speed">Speed</SelectItem>
                  <SelectItem value="throttle">Throttle Position</SelectItem>
                  <SelectItem value="brake">Brake Pressure</SelectItem>
                  <SelectItem value="steering">Steering Angle</SelectItem>
                  <SelectItem value="rpm">Engine RPM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {selectedLapData && stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Max Speed</CardTitle>
              <Gauge className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.maxSpeed.toFixed(1)} km/h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Speed</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgSpeed.toFixed(1)} km/h</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Full Throttle</CardTitle>
              <Zap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.fullThrottleTime.toFixed(1)}%</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Braking Time</CardTitle>
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.brakingTime.toFixed(1)}%</div>
            </CardContent>
          </Card>
        </div>
      )}

      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{metricConfig.name} over Time</CardTitle>
            <CardDescription>
              {metricConfig.name} telemetry data throughout the lap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="time" 
                  tickFormatter={(value) => `${value.toFixed(0)}s`}
                />
                <YAxis 
                  tickFormatter={(value) => `${value.toFixed(0)}${metricConfig.unit === "°" ? "°" : ""}`}
                />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(1)}${metricConfig.unit}`, metricConfig.name]}
                  labelFormatter={(value) => `Time: ${Number(value).toFixed(1)}s`}
                />
                <Line 
                  type="monotone" 
                  dataKey={metricConfig.key} 
                  stroke={metricConfig.color} 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {chartData.length > 0 && selectedMetric === "speed" && (
        <Card>
          <CardHeader>
            <CardTitle>Speed vs Track Position</CardTitle>
            <CardDescription>
              Speed analysis throughout the track layout
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="distance" 
                  tickFormatter={(value) => `${(value/1000).toFixed(1)}km`}
                />
                <YAxis tickFormatter={(value) => `${value}km/h`} />
                <Tooltip 
                  formatter={(value) => [`${Number(value).toFixed(1)}km/h`, "Speed"]}
                  labelFormatter={(value) => `Distance: ${(Number(value)/1000).toFixed(2)}km`}
                />
                <Area 
                  type="monotone" 
                  dataKey="speed" 
                  stroke="#8884d8" 
                  fill="#8884d8" 
                  fillOpacity={0.3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {!selectedLap && laps.length > 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Select a lap above to view detailed telemetry analysis
            </div>
          </CardContent>
        </Card>
      )}

      {laps.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No laps available for telemetry analysis. Upload some laps first!
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}