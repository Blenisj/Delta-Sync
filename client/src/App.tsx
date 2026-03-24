import { useState, useEffect } from "react";
import "./styles/globals.css";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { Dashboard } from "./components/Dashboard";
import { LapUpload } from "./components/LapUpload";
import { LapComparison } from "./components/LapComparison";
import { TelemetryAnalysis } from "./components/TelemetryAnalysis";
import { Leaderboard } from "./components/Leaderboard";
import type { LapData } from "./types/racing";
import { getAll } from "../../database/db_funcs";
import {
  BarChart3,
  GitCompare,
  Activity,
  Car,
  Plus,
  Trophy,
} from "lucide-react";
import { Button } from "./components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";

export default function App() {
  const [laps, setLaps] = useState<LapData[]>([]);
  const [lastUploadedTelemetry, setLastUploadedTelemetry] = useState<any[]>([]);
  const [activeView, setActiveView] = useState("dashboard");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);

  const toWeather = (value: unknown): LapData["weather"] => {
    const raw = typeof value === "string" ? value.toLowerCase() : "dry";
    if (raw === "wet" || raw === "mixed") return raw;
    return "dry";
  };

  const toLapData = (record: any): LapData => {
    const metadata = record?.metadata ?? {};
    const telemetry = Array.isArray(record?.telemetry) ? record.telemetry : [];

    const speeds = telemetry
      .map((sample: any) => Number(sample?.speed ?? 0))
      .filter((speed: number) => Number.isFinite(speed));

    const computedTopSpeed = speeds.length ? Math.max(...speeds) : 0;
    const computedAverageSpeed = speeds.length
      ? speeds.reduce((sum: number, speed: number) => sum + speed, 0) / speeds.length
      : 0;

    return {
      id: String(record?.id ?? crypto.randomUUID()),
      trackName: String(record?.trackName ?? record?.track_name ?? metadata?.track_name ?? "unknown_track"),
      carModel: String(record?.carModel ?? record?.car_name ?? metadata?.car_name ?? "unknown_car"),
      lapTime: Number(record?.lapTime ?? record?.lap_duration_ms ?? record?.best_lap_time_ms ?? metadata?.lap_duration_ms ?? metadata?.best_lap_time_ms ?? 0),
      dateRecorded: new Date(record?.dateRecorded ?? record?.last_save_timestamp ?? metadata?.date_recorded ?? metadata?.last_save_timestamp ?? Date.now()),
      weather: toWeather(record?.weather ?? metadata?.weather),
      temperature: Number(record?.temperature ?? metadata?.temperature ?? 20),
      sectorTimes: Array.isArray(record?.sectorTimes)
        ? record.sectorTimes
        : Array.isArray(record?.sector_times_ms)
          ? record.sector_times_ms
        : Array.isArray(metadata?.sector_times_ms)
          ? metadata.sector_times_ms
          : [],
      topSpeed: Number(record?.topSpeed ?? computedTopSpeed),
      averageSpeed: Number(record?.averageSpeed ?? computedAverageSpeed),
    };
  };

  useEffect(() => {
    async function fetchFirebaseLaps() {
      try {
        const data = await getAll();

        const normalizedLaps = data.map((record: any) => toLapData(record));
        setLaps(normalizedLaps);

        const telemetryByLapId: Record<string, any[]> = {};
        const telemetryMetaByLapId: Record<string, any> = {};

        normalizedLaps.forEach((lap: LapData, index: number) => {
          const source = data[index] ?? {};
          telemetryByLapId[lap.id] = Array.isArray(source.telemetry) ? source.telemetry : [];
          telemetryMetaByLapId[lap.id] = source.metadata ?? source ?? {};
        });

        localStorage.setItem("telemetryByLapId", JSON.stringify(telemetryByLapId));
        localStorage.setItem("telemetryMetaByLapId", JSON.stringify(telemetryMetaByLapId));
      } catch (error) {
        console.error("Failed to load laps from Firebase:", error);
        setLaps([]);
      }
    }

    fetchFirebaseLaps();
  }, []);

  //  Modified to also handle telemetry JSON
  const handleAddLap = (newLap: LapData, telemetryData?: any[], telemetryMeta?: any) => {
    if (telemetryData && telemetryData.length > 0) {
      setLastUploadedTelemetry(telemetryData);

      const existing = JSON.parse(localStorage.getItem("telemetryByLapId") || "{}");
      existing[newLap.id] = telemetryData;
      localStorage.setItem("telemetryByLapId", JSON.stringify(existing));

      const metaExisting = JSON.parse(localStorage.getItem("telemetryMetaByLapId") || "{}");
      metaExisting[newLap.id] = telemetryMeta || {};
      localStorage.setItem("telemetryMetaByLapId", JSON.stringify(metaExisting));
    }

    setUploadDialogOpen(false);
  };

  const renderContent = () => {
    switch (activeView) {
      case "dashboard":
        return (
          <Dashboard laps={laps} lastUploadedTelemetry={lastUploadedTelemetry} />
        );
      case "comparison":
        return <LapComparison laps={laps} />;
      case "telemetry":
        return (
          <TelemetryAnalysis
            laps={laps}
            lastUploadedTelemetry={lastUploadedTelemetry}
          />
        );
      case "leaderboard":
        return <Leaderboard userLaps={laps} />;
      default:
        return (
          <Dashboard laps={laps} lastUploadedTelemetry={lastUploadedTelemetry} />
        );
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <Sidebar>
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-3">
              <Car className="h-6 w-6 text-primary" />
              <h2 className="font-semibold">DeltaSync</h2>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveView("dashboard")}
                  isActive={activeView === "dashboard"}
                >
                  <BarChart3 className="h-4 w-4" />
                  Dashboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveView("leaderboard")}
                  isActive={activeView === "leaderboard"}
                >
                  <Trophy className="h-4 w-4" />
                  Leaderboard
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveView("comparison")}
                  isActive={activeView === "comparison"}
                >
                  <GitCompare className="h-4 w-4" />
                  Compare Laps
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setActiveView("telemetry")}
                  isActive={activeView === "telemetry"}
                >
                  <Activity className="h-4 w-4" />
                  Telemetry Analysis
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        <main className="flex-1 flex flex-col">
          <header className="border-b bg-background px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div>
                  <h1 className="text-2xl font-bold">DeltaSync Telemetry</h1>
                  <p className="text-sm text-muted-foreground">
                    Analyze and compare your Assetto Corsa lap data
                  </p>
                </div>
              </div>

              <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Add Lap Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Upload Lap Data</DialogTitle>
                    <DialogDescription>
                      Upload your DeltaSync telemetry JSON file
                    </DialogDescription>
                  </DialogHeader>
                  {/* Pass the telemetry handler */}
                  <LapUpload onAddLap={handleAddLap} />
                </DialogContent>
              </Dialog>
            </div>
          </header>

          <div className="flex-1 p-6">{renderContent()}</div>
        </main>
      </div>
    </SidebarProvider>
  );
}
