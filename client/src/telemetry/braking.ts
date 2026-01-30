import type { TelemetrySample } from "./types";

export function getBrakingSeries(samples: TelemetrySample[]) {
  return samples.map((s, i) => ({
    index: i,
    brake: s.brake ?? 0,
  }));
}