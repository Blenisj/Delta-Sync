import type { TelemetrySample, TelemetryMeta } from "./types";

export function getDeltaTimeSeries(
  samples: TelemetrySample[],
  meta?: TelemetryMeta
) {
  const lapMs = meta?.lap_duration_ms ?? meta?.best_lap_time_ms ?? 0;
  if (!lapMs || samples.length === 0) return [];

  return samples.map((s, i) => ({
    index: i,
    deltaMs: Math.round((s.lap_progress ?? 0) * lapMs),
  }));
}