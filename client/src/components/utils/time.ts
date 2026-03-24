/**
 * Time formatting utilities for racing lap times and durations
 */

export function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = ((ms % 60000) / 1000).toFixed(3);
  return `${minutes}:${seconds.padStart(6, "0")}`;
}

export function formatTimeDifference(ms: number): string {
  const sign = ms >= 0 ? '+' : '';
  return `${sign}${(ms / 1000).toFixed(3)}s`;
}

export function formatDuration(ms: number): string {
  return `${(ms / 1000).toFixed(3)}s`;
}