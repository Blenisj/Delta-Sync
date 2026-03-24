import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Upload } from "lucide-react";
import type { LapUploadProps } from "../types/racing";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useLapUpload } from "./hooks/useLapUpload";

export function LapUpload({ onAddLap }: LapUploadProps) {
  const { telemetry, fileName, handleDrop, handleBrowse } = useLapUpload(onAddLap);

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
