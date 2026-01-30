export type TelemetrySample = {
  brake?: number;
  throttle?: number;
  gear?: string | number;
  speed?: number;
  lap_progress?: number;
};

export type TelemetryMeta = {
  lap_duration_ms?: number;
  best_lap_time_ms?: number;
};