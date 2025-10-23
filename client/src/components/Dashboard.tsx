import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Clock, TrendingUp, Trophy, Zap } from "lucide-react";
import type { LapData } from "../types/racing";

interface DashboardProps {
  laps: LapData[];
}

export function Dashboard({ laps }: DashboardProps) {
  const bestLap = laps.reduce((best, current) => 
    current.lapTime < best.lapTime ? current : best, laps[0]);
  
  const recentLaps = laps.slice(-5).reverse();
  
  const averageLapTime = laps.length > 0 
    ? laps.reduce((sum, lap) => sum + lap.lapTime, 0) / laps.length 
    : 0;

  const uniqueTracks = new Set(laps.map(lap => lap.trackName)).size;

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(3);
    return `${minutes}:${seconds.padStart(6, '0')}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Laps</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{laps.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Best Lap Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {bestLap ? formatTime(bestLap.lapTime) : "--:--"}
            </div>
            {bestLap && (
              <p className="text-xs text-muted-foreground">
                {bestLap.trackName} • {bestLap.carModel}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Lap Time</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {averageLapTime > 0 ? formatTime(averageLapTime) : "--:--"}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tracks Driven</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueTracks}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Laps</CardTitle>
          <CardDescription>Your latest 5 lap times</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLaps.length > 0 ? (
            <div className="space-y-3">
              {recentLaps.map((lap) => (
                <div key={lap.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex flex-col">
                    <div className="font-medium">{lap.trackName}</div>
                    <div className="text-sm text-muted-foreground">{lap.carModel}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary">{lap.weather}</Badge>
                    <div className="text-right">
                      <div className="font-bold">{formatTime(lap.lapTime)}</div>
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