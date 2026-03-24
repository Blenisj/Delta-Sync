import type { LapData } from "../../types/racing";

export interface DashboardStats {
  totalLaps: number;
  bestLap: LapData | null;
  averageLapTime: number;
  uniqueTracks: number;
}

export interface DashboardData {
  stats: DashboardStats;
  recentLaps: LapData[];
}

export function calculateDashboardStats(laps: LapData[]): DashboardStats {
  if (!laps || laps.length === 0) {
    return {
      totalLaps: 0,
      bestLap: null,
      averageLapTime: 0,
      uniqueTracks: 0,
    };
  }

  const bestLap = laps.reduce(
    (best, current) => (current.lapTime < best.lapTime ? current : best),
    laps[0]
  );

  const averageLapTime =
    laps.length > 0
      ? laps.reduce((sum, lap) => sum + lap.lapTime, 0) / laps.length
      : 0;

  const uniqueTracks = new Set(laps.map((lap) => lap.trackName)).size;

  return {
    totalLaps: laps.length,
    bestLap,
    averageLapTime,
    uniqueTracks,
  };
}

export function getRecentLaps(laps: LapData[], count: number = 5): LapData[] {
  return laps.slice(-count).reverse();
}