declare module "*database/db_funcs" {
  export type TelemetrySample = {
    speed?: number;
    throttle?: number;
    brake?: number;
    gear?: number | string;
    lap_progress?: number;
    [key: string]: unknown;
  };

  export type DbMetadata = {
    track_name?: string;
    car_name?: string;
    lap_duration_ms?: number;
    best_lap_time_ms?: number;
    date_recorded?: string;
    last_save_timestamp?: string;
    sector_times_ms?: number[];
    weather?: string;
    temperature?: number;
    [key: string]: unknown;
  };

  export type DbLap = {
    id: string;
    trackName?: string;
    track_name?: string;
    carModel?: string;
    car_name?: string;
    lapTime?: number;
    lap_duration_ms?: number;
    best_lap_time_ms?: number;
    dateRecorded?: string;
    last_save_timestamp?: string;
    sectorTimes?: number[];
    sector_times_ms?: number[];
    weather?: string;
    temperature?: number;
    topSpeed?: number;
    averageSpeed?: number;
    userName?: string;
    userInitials?: string;
    telemetry?: TelemetrySample[];
    metadata?: DbMetadata;
    [key: string]: unknown;
  };

  export function getAll(): Promise<DbLap[]>;
}