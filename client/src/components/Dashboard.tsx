import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, TrendingUp, Trophy, Zap } from "lucide-react";
import type { DashboardProps } from "../types/racing";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useDashboardData } from "./hooks/useDashboardData";
import { formatTime } from "./utils/time";
import { formatIdentifierLabel, formatWeatherLabel } from "./utils/displayFormatters";

export function Dashboard({ laps, lastUploadedTelemetry }: DashboardProps) {
  const { stats, recentLaps } = useDashboardData(laps);

  if (!laps || laps.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No laps recorded yet. Upload your first lap to get started!
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laps</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLaps}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Lap Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.bestLap ? formatTime(stats.bestLap.lapTime) : "--:--"}
            </div>
            {stats.bestLap && (
              <p className="text-xs text-muted-foreground">
                {formatIdentifierLabel(stats.bestLap.trackName)} • {formatIdentifierLabel(stats.bestLap.carModel)}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Lap Time
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageLapTime > 0 ? formatTime(stats.averageLapTime) : "--:--"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracks Driven</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.uniqueTracks}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Laps */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Laps</CardTitle>
          <CardDescription>Your latest 5 lap uploads</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLaps.length > 0 ? (
            <div className="space-y-3">
              {recentLaps.map((lap) => (
                <div
                  key={lap.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex flex-col">
                    <div className="font-medium">{formatIdentifierLabel(lap.trackName)}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatIdentifierLabel(lap.carModel)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{formatWeatherLabel(lap.weather)}</Badge>
                    <div className="text-right">
                      <div className="font-bold">
                        {formatTime(lap.lapTime)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(lap.dateRecorded).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No laps recorded yet. Upload your first lap to get started!
            </div>
          )}
        </CardContent>
      </Card>

      {/* GT7-style Telemetry Graph */}
      {lastUploadedTelemetry && lastUploadedTelemetry.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Lap Telemetry Overview</CardTitle>
            <CardDescription>
              Speed, Throttle, and Brake over the lap
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={lastUploadedTelemetry.slice(0, 500)}>
                  <XAxis dataKey="speed" hide />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="#38bdf8"
                    dot={false}
                    name="Speed (km/h)"
                  />
                  <Line
                    type="monotone"
                    dataKey="throttle"
                    stroke="#22c55e"
                    dot={false}
                    name="Throttle"
                  />
                  <Line
                    type="monotone"
                    dataKey="brake"
                    stroke="#ef4444"
                    dot={false}
                    name="Brake"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
