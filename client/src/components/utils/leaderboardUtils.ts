import type { LapData } from "../../types/racing";
import { formatTime } from "../utils/time";

export interface LeaderboardEntry extends LapData {
  userName: string;
  userInitials: string;
  isCurrentUser?: boolean;
}

export function getRankIcon(position: number) {
  switch (position) {
    case 1:
      return "🥇";
    case 2:
      return "🥈";
    case 3:
      return "🥉";
    default:
      return `#${position}`;
  }
}

export function getPositionDelta(entry: LeaderboardEntry, position: number, sortedData: LeaderboardEntry[]) {
  if (position === 1) return null;
  const timeDiff = entry.lapTime - sortedData[0].lapTime;
  return `+${(timeDiff / 1000).toFixed(3)}s`;
}

export function formatLeaderboardTime(ms: number) {
  return formatTime(ms);
}