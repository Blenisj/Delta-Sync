import { useState } from "react";
import type { LapData } from "../../types/racing";
import { parseTelemetryFile, createLapFromTelemetry } from "../utils/fileParsing";

export function useLapUpload(onAddLap: (lap: LapData, telemetryData?: any[], telemetryMeta?: any) => void) {
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        const { telemetry: parsedTelemetry, metadata } = parseTelemetryFile(json);
        setTelemetry(parsedTelemetry);
        setFileName(file.name);

        const newLap = createLapFromTelemetry(parsedTelemetry, metadata);
        onAddLap(newLap, parsedTelemetry, metadata);
      } catch (err) {
        console.error("Error parsing telemetry file:", err);
        alert("Invalid telemetry JSON file.");
      }
    };

    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".json")) handleFileUpload(file);
  };

  const handleBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
  };

  return {
    telemetry,
    fileName,
    handleDrop,
    handleBrowse,
  };
}