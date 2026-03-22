import { useMemo } from "react";
import type { LapData } from "../../types/racing";
import { calculateDashboardStats, getRecentLaps, type DashboardData } from "../utils/dashboardCalculations";

export function useDashboardData(laps: LapData[]): DashboardData {
  const stats = useMemo(() => calculateDashboardStats(laps), [laps]);
  const recentLaps = useMemo(() => getRecentLaps(laps), [laps]);

  return {
    stats,
    recentLaps,
  };
}