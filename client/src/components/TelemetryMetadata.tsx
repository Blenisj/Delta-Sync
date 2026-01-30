import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

interface TelemetryMeta {
  car_name?: string;
  track_name?: string;
  best_lap_time_ms?: number;
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

export function TelemetryMetadata({ meta }: { meta?: TelemetryMeta | null }) {
  const [storedMeta, setStoredMeta] = useState<TelemetryMeta | null>(null);

  useEffect(() => {
    if (meta) return;
    try {
      const savedMeta = localStorage.getItem("lastUploadedTelemetryMeta");
      if (!savedMeta) {
        setStoredMeta(null);
        return;
      }
      const parsed: TelemetryMeta = JSON.parse(savedMeta);
      setStoredMeta(parsed);
    } catch (err) {
      console.error("Failed to load telemetry metadata:", err);
      setStoredMeta(null);
    }
  }, [meta]);

  const activeMeta = meta ?? storedMeta;

  // If no metadata has been stored yet, don't render anything
  if (!activeMeta) return null;

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="text-base">Lap Summary</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground space-y-1">
        <p>
          <span className="font-medium text-foreground">Car:</span>{" "}
          {activeMeta.car_name || "Unknown"}
        </p>
        <p>
          <span className="font-medium text-foreground">Track:</span>{" "}
          {activeMeta.track_name || "Unknown"}
        </p>
        <p>
          <span className="font-medium text-foreground">Best Lap:</span>{" "}
          {formatLapTime(activeMeta.best_lap_time_ms)}
        </p>
        {typeof activeMeta.samples_logged === "number" && (
          <p>
            <span className="font-medium text-foreground">Samples:</span>{" "}
            {activeMeta.samples_logged}
          </p>
        )}
        {activeMeta.last_save_timestamp && (
          <p>
            <span className="font-medium text-foreground">Logged at:</span>{" "}
            {activeMeta.last_save_timestamp}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
