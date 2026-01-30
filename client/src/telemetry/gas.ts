import type { TelemetrySample } from "./types";

export function getGasSeries(samples: TelemetrySample[]) {
  return samples.map((s, i) => ({
    index: i,
    throttle: s.throttle ?? 0,
  }));
}