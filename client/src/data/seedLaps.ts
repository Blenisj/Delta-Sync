import type { LapData } from "../types/racing";
import type { TelemetrySample, TelemetryMeta } from "../telemetry";

type TelemetryFile = {
  metadata?: {
    track_name?: string;
    car_name?: string;
    best_lap_time_ms?: number;
    lap_time_ms?: number;
    sector_times_ms?: number[];
    weather?: string;
    temperature?: number;
    date_recorded?: string;
    lap_duration_ms?: number;
  };
  telemetry?: TelemetrySample[];
};

const telemetryModules = import.meta.glob(
  ["../Test Laps/**/telemetry_*.json", "../../testlaps/**/*.json"],
  { eager: true, import: "default" }
);

export const seedTelemetryById: Record<string, TelemetrySample[]> = {};
export const seedTelemetryMetaById: Record<string, TelemetryMeta> = {};

const toLapData = (path: string, file: TelemetryFile | any[]): LapData => {
  const metadata = (file as TelemetryFile).metadata ?? {};
  const telemetry = Array.isArray(file)
    ? file
    : (file as TelemetryFile).telemetry ?? [];

  const id = `seed-${path}`;
  seedTelemetryById[id] = telemetry;
  seedTelemetryMetaById[id] = {
    lap_duration_ms: metadata.lap_duration_ms,
    best_lap_time_ms: metadata.best_lap_time_ms,
  };

  const speeds = telemetry.map((t) => t?.speed ?? 0);
  const topSpeed = speeds.length ? Math.max(...speeds) : 0;
  const averageSpeed =
    speeds.length ? speeds.reduce((a, b) => a + b, 0) / speeds.length : 0;

  return {
    id,
    trackName: metadata.track_name ?? "Unknown Track",
    carModel: metadata.car_name ?? "Unknown Car",
    lapTime: metadata.best_lap_time_ms ?? metadata.lap_time_ms ?? 0,
    dateRecorded: metadata.date_recorded
      ? new Date(metadata.date_recorded)
      : new Date(),
    weather: metadata.weather ?? "dry",
    temperature: metadata.temperature ?? 20,
    sectorTimes: metadata.sector_times_ms ?? [],
    topSpeed,
    averageSpeed,
  };
};

export const seedLaps: LapData[] = Object.entries(telemetryModules).map(
  ([path, file]) => toLapData(path, file as TelemetryFile)
);