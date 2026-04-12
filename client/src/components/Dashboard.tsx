import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Clock, TrendingUp, Trophy, Zap } from "lucide-react";
import type { DashboardProps } from "../types/racing";
import { useDashboardData } from "./hooks/useDashboardData";
import { formatTime } from "./utils/time";
import { formatIdentifierLabel } from "./utils/displayFormatters";

export function Dashboard({ laps }: DashboardProps) {
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
    </div>
  );
}
