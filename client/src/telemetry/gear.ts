import type { TelemetrySample } from "./types";

export function getGearSeries(samples: TelemetrySample[]) {
  return samples.map((s, i) => ({
    index: i,
    gear: s.gear ?? "N",
  }));
}