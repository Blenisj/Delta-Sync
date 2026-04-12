import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";
import { TrendingDown, TrendingUp, Clock, Target, MapPin, Activity } from "lucide-react";
import type { LapComparisonProps } from "../types/racing";
import { useLapComparison } from "./hooks/useLapComparison";
import { formatLapTime, formatLapTimeDifference } from "./utils/lapComparisonUtils";
import { formatIdentifierLabel } from "./utils/displayFormatters";

export function LapComparison({ laps }: LapComparisonProps) {
  const {
    selectedTrack,
    selectedLap1,
    setSelectedLap1,
    selectedLap2,
    setSelectedLap2,
    selectedTelemetryType,
    setSelectedTelemetryType,
    selectedSector,
    setSelectedSector,
    uniqueTracks,
    trackLaps,
    lap1,
    lap2,
    throttleBrakeComparison,
    gearComparison,
    deltaComparison,
    gearChanges1,
    gearChanges2,
    handleTrackChange,
  } = useLapComparison(laps);

  const formatProgressPercent = (value: number | string) => `${(Number(value) * 100).toFixed(0)}%`;

  const renderTelemetryChart = () => {
    switch (selectedTelemetryType) {
      case "throttle":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Throttle Input</h4>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={throttleBrakeComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="progress"
                  domain={[0, 1]}
                  type="number"
                  tickFormatter={formatProgressPercent}
                />
                <YAxis domain={[0, 1]} />
                <Tooltip
                  labelFormatter={(value) => `Lap Progress: ${formatProgressPercent(value as number | string)}`}
                  formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`}
                />
                <Line type="monotone" dataKey="throttle1" stroke="#8884d8" name="Throttle Lap1" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="throttle2" stroke="#82ca9d" name="Throttle Lap2" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "brake":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Brake Input</h4>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={throttleBrakeComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="progress"
                  domain={[0, 1]}
                  type="number"
                  tickFormatter={formatProgressPercent}
                />
                <YAxis domain={[0, 1]} />
                <Tooltip
                  labelFormatter={(value) => `Lap Progress: ${formatProgressPercent(value as number | string)}`}
                  formatter={(value) => `${(Number(value) * 100).toFixed(1)}%`}
                />
                <Line type="monotone" dataKey="brake1" stroke="#ff7300" name="Brake Lap1" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="brake2" stroke="#ff0000" name="Brake Lap2" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "gear":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Gear Changes</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{gearChanges1}</div>
                  <p className="text-xs text-muted-foreground">Gear Changes - {formatIdentifierLabel(lap1?.trackName)}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold">{gearChanges2}</div>
                  <p className="text-xs text-muted-foreground">Gear Changes - {formatIdentifierLabel(lap2?.trackName)}</p>
                </CardContent>
              </Card>
            </div>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={gearComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="progress"
                  domain={[0, 1]}
                  type="number"
                  tickFormatter={formatProgressPercent}
                />
                <YAxis allowDecimals={false} />
                <Tooltip
                  labelFormatter={(value) => `Lap Progress: ${formatProgressPercent(value as number | string)}`}
                  formatter={(value) => [`Gear ${value}`, "Selected Lap"]}
                />
                <Line type="stepAfter" dataKey="gear1" stroke="#2563eb" name="Gear Lap1" strokeWidth={2} dot={false} />
                <Line type="stepAfter" dataKey="gear2" stroke="#16a34a" name="Gear Lap2" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      case "delta":
        return (
          <div>
            <h4 className="text-sm font-medium mb-2">Delta Time Progression</h4>
            <ResponsiveContainer width="100%" height={500}>
              <LineChart data={deltaComparison}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="progress"
                  domain={[0, 1]}
                  type="number"
                  tickFormatter={formatProgressPercent}
                />
                <YAxis />
                <Tooltip
                  labelFormatter={(value) => `Lap Progress: ${formatProgressPercent(value as number | string)}`}
                  formatter={(value) => `${(Number(value) / 1000).toFixed(3)}s`}
                />
                <Line type="monotone" dataKey="delta1" stroke="#8884d8" name="Delta Lap1" strokeWidth={1} dot={false} />
                <Line type="monotone" dataKey="delta2" stroke="#82ca9d" name="Delta Lap2" strokeWidth={1} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Lap Comparison
          </CardTitle>
          <CardDescription>
            Compare two laps from the same track to analyze telemetry differences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Track Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Select Track
              </label>
              <Select value={selectedTrack} onValueChange={handleTrackChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a track to compare laps" />
                </SelectTrigger>
                <SelectContent>
                  {uniqueTracks.map((track) => (
                    <SelectItem key={track} value={track}>
                      {formatIdentifierLabel(track)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedTrack && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Lap (Lap 1)</label>
                  <Select value={selectedLap1} onValueChange={setSelectedLap1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reference lap" />
                    </SelectTrigger>
                    <SelectContent>
                      {trackLaps.map((lap) => (
                        <SelectItem key={lap.id} value={lap.id}>
                          {formatLapTime(lap.lapTime)} - {formatIdentifierLabel(lap.carModel)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Comparison Lap (Lap 2)</label>
                  <Select value={selectedLap2} onValueChange={setSelectedLap2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select comparison lap" />
                    </SelectTrigger>
                    <SelectContent>
                      {trackLaps.map((lap) => (
                        <SelectItem key={lap.id} value={lap.id}>
                          {formatLapTime(lap.lapTime)} - {formatIdentifierLabel(lap.carModel)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTrack && trackLaps.length === 0 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              No laps found for {formatIdentifierLabel(selectedTrack)}. Upload some laps for this track first!
            </div>
          </CardContent>
        </Card>
      )}

      {selectedTrack && trackLaps.length > 0 && trackLaps.length < 2 && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Need at least 2 laps on {formatIdentifierLabel(selectedTrack)} to compare. Upload another lap for this track!
            </div>
          </CardContent>
        </Card>
      )}

      {lap1 && lap2 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Reference Lap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{formatLapTime(lap1.lapTime)}</div>
                  <div className="text-sm text-muted-foreground">{formatIdentifierLabel(lap1.trackName)}</div>
                  <div className="text-sm text-muted-foreground">{formatIdentifierLabel(lap1.carModel)}</div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  Comparison Lap
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-2xl font-bold">{formatLapTime(lap2.lapTime)}</div>
                  <div className="text-sm text-muted-foreground">{formatIdentifierLabel(lap2.trackName)}</div>
                  <div className="text-sm text-muted-foreground">{formatIdentifierLabel(lap2.carModel)}</div>
                  <div className="flex items-center gap-2 mt-2">
                    {lap2.lapTime < lap1.lapTime ? (
                      <TrendingDown className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-red-500" />
                    )}
                    <span className={lap2.lapTime < lap1.lapTime ? "text-green-500" : "text-red-500"}>
                      {formatLapTimeDifference(lap2.lapTime - lap1.lapTime)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Telemetry Comparison */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Telemetry Comparison
              </CardTitle>
              <CardDescription>
                Select a telemetry type to compare between laps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Telemetry Type Selector */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Select Telemetry Type</label>
                <Select value={selectedTelemetryType} onValueChange={setSelectedTelemetryType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose telemetry type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="throttle">Throttle Input</SelectItem>
                    <SelectItem value="brake">Brake Input</SelectItem>
                    <SelectItem value="gear">Gear Changes</SelectItem>
                    <SelectItem value="delta">Delta Time Progression</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sector Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Filter by Sector</label>
                <Select value={selectedSector} onValueChange={setSelectedSector}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose sector to display" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whole">Whole Lap</SelectItem>
                    <SelectItem value="1">Sector 1</SelectItem>
                    <SelectItem value="2">Sector 2</SelectItem>
                    <SelectItem value="3">Sector 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Render Selected Chart */}
              {renderTelemetryChart()}
            </CardContent>
          </Card>
        </>
      )}

      {!selectedTrack && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-muted-foreground">
              Select a track above to start comparing laps.
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}