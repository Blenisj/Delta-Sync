import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface TelemetryMeta {
  car_name?: string;
  track_name?: string;
  best_lap_time_ms?: number | null;
  samples_logged?: number;
  last_save_timestamp?: string;
}

function formatLapTime(ms?: number | null): string {
  if (!ms || ms <= 0) return "N/A";

  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

export function TelemetryMetadata() {
  const [meta, setMeta] = useState<TelemetryMeta | null>(null);

  useEffect(() => {
    try {
      const savedMeta = localStorage.getItem("lastUploadedTelemetryMeta");
      if (!savedMeta) {
        setMeta(null);
        return;
      }
      const parsed: TelemetryMeta = JSON.parse(savedMeta);
      setMeta(parsed);
    } catch (err) {
      console.error("Failed to load telemetry metadata:", err);
      setMeta(null);
    }
  }, []);

  // If no metadata has been stored yet, don't render anything
  if (!meta) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">Lap Summary</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-1">
        <p>
          <span className="font-medium text-foreground">Car:</span>{" "}
          {meta.car_name || "Unknown"}
        </p>
        <p>
          <span className="font-medium text-foreground">Track:</span>{" "}
          {meta.track_name || "Unknown"}
        </p>
        <p>
          <span className="font-medium text-foreground">Best Lap:</span>{" "}
          {formatLapTime(meta.best_lap_time_ms)}
        </p>
        {typeof meta.samples_logged === "number" && (
          <p>
            <span className="font-medium text-foreground">Samples:</span>{" "}
            {meta.samples_logged}
          </p>
        )}
        {meta.last_save_timestamp && (
          <p>
            <span className="font-medium text-foreground">Logged at:</span>{" "}
            {meta.last_save_timestamp}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
