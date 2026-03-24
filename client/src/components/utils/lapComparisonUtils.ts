import { formatTime, formatTimeDifference } from "../utils/time";

export function formatLapTime(ms: number) {
  return formatTime(ms);
}

export function formatLapTimeDifference(ms: number) {
  return formatTimeDifference(ms);
}