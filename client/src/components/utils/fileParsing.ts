import type { LapData } from "../../types/racing";

export interface ParsedTelemetryResult {
  telemetry: any[];
  metadata?: any;
}

export function parseTelemetryFile(json: any): ParsedTelemetryResult {
  if (json && Array.isArray(json.telemetry)) {
    localStorage.setItem(
      "lastUploadedTelemetry",
      JSON.stringify(json.telemetry)
    );
    localStorage.setItem(
      "lastUploadedTelemetryMeta",
      JSON.stringify(json.metadata || {})
    );
    return { telemetry: json.telemetry, metadata: json.metadata };
  }

  if (Array.isArray(json)) {
    localStorage.setItem("lastUploadedTelemetry", JSON.stringify(json));
    localStorage.removeItem("lastUploadedTelemetryMeta");
    return { telemetry: json };
  }

  throw new Error("Invalid telemetry format");
}

export function createLapFromTelemetry(
  telemetry: any[],
  metadata?: any
): LapData {
  const maxSpeed = Math.max(...telemetry.map((d) => d.speed || 0));
  const avgSpeed =
    telemetry.reduce((acc, d) => acc + (d.speed || 0), 0) / (telemetry.length || 1);

  return {
    id: Date.now().toString(),
    trackName: metadata?.track_name || "Unknown Track",
    carModel: metadata?.car_name || "Unknown Car",
    lapTime: metadata?.best_lap_time_ms || 0,
    dateRecorded: new Date(),
    weather: "dry",
    temperature: 20,
    sectorTimes: [],
    topSpeed: maxSpeed,
    averageSpeed: avgSpeed,
  };
}