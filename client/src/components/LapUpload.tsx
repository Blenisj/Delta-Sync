import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import type { LapData } from "../types/racing";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface LapUploadProps {
  onAddLap: (lap: LapData) => void;
}

export function LapUpload({ onAddLap }: LapUploadProps) {
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [fileName, setFileName] = useState<string>("");

  const parseTelemetryFile = (json: any) => {
    // NEW FORMAT: { metadata, telemetry }
    if (json && Array.isArray(json.telemetry)) {
      localStorage.setItem(
        "lastUploadedTelemetry",
        JSON.stringify(json.telemetry)
      );
      localStorage.setItem(
        "lastUploadedTelemetryMeta",
        JSON.stringify(json.metadata || {})
      );
      return json.telemetry;
    }

    // OLD FORMAT: pure array
    if (Array.isArray(json)) {
      localStorage.setItem("lastUploadedTelemetry", JSON.stringify(json));
      localStorage.removeItem("lastUploadedTelemetryMeta");
      return json;
    }

    throw new Error("Invalid telemetry format");
  };

  const handleFileUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        const parsedTelemetry = parseTelemetryFile(json);
        setTelemetry(parsedTelemetry);
        setFileName(file.name);

        const maxSpeed = Math.max(...parsedTelemetry.map((d) => d.speed));
        const avgSpeed =
          parsedTelemetry.reduce((acc, d) => acc + d.speed, 0) /
          (parsedTelemetry.length || 1);

        const newLap: LapData = {
          id: Date.now().toString(),
          trackName: json?.metadata?.track_name || "Unknown Track",
          carModel: json?.metadata?.car_name || "Unknown Car",
          lapTime: json?.metadata?.best_lap_time_ms || 0,
          dateRecorded: new Date(),
          weather: "dry",
          temperature: 20,
          sectorTimes: [],
          topSpeed: maxSpeed,
          averageSpeed: avgSpeed,
        };

        onAddLap(newLap);
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

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload DeltaSync Telemetry
          </CardTitle>
          <CardDescription>
            Drag & drop your telemetry JSON file from Assetto Corsa
          </CardDescription>
        </CardHeader>

        <CardContent>
          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary transition"
          >
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              Drag and drop your telemetry file here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              or click below to browse
            </p>

            <input
              type="file"
              accept=".json"
              className="hidden"
              id="telemetryUpload"
              onChange={handleBrowse}
            />
            <label htmlFor="telemetryUpload">
              <Button variant="outline">Browse Files</Button>
            </label>
          </div>

          {/* File Info */}
          {fileName && (
            <p className="text-center mt-3 text-sm text-gray-400">
              Loaded file: <span className="font-semibold">{fileName}</span>
            </p>
          )}

          {/* Telemetry Table */}
          {telemetry.length > 0 && (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-sm text-left text-gray-200 border border-gray-700 rounded-lg">
                <thead className="bg-gray-800 text-gray-100">
                  <tr>
                    <th className="px-4 py-2">#</th>
                    <th className="px-4 py-2">Speed</th>
                    <th className="px-4 py-2">Gear</th>
                    <th className="px-4 py-2">Throttle</th>
                    <th className="px-4 py-2">Brake</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetry.slice(0, 100).map((row, i) => (
                    <tr
                      key={i}
                      className={`${
                        i % 2 === 0 ? "bg-gray-900" : "bg-gray-800"
                      } hover:bg-gray-700`}
                    >
                      <td className="px-4 py-1">{i + 1}</td>
                      <td className="px-4 py-1">{row.speed}</td>
                      <td className="px-4 py-1">{row.gear}</td>
                      <td className="px-4 py-1">
                        {(row.throttle * 100).toFixed(0)}%
                      </td>
                      <td className="px-4 py-1">
                        {(row.brake * 100).toFixed(0)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {telemetry.length > 100 && (
                <p className="text-gray-400 mt-2 text-xs italic text-center">
                  Showing first 100 samples…
                </p>
              )}
            </div>
          )}

          {/* Telemetry Graph */}
          {telemetry.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-semibold mb-3 text-center text-white">
                Telemetry Graph
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={telemetry.slice(0, 500)}>
                  <XAxis dataKey="speed" hide />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="speed"
                    stroke="#38bdf8"
                    dot={false}
                    name="Speed (km/h)"
                  />
                  <Line
                    type="monotone"
                    dataKey="throttle"
                    stroke="#22c55e"
                    dot={false}
                    name="Throttle"
                  />
                  <Line
                    type="monotone"
                    dataKey="brake"
                    stroke="#ef4444"
                    dot={false}
                    name="Brake"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
