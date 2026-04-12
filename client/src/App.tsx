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
    async function fetchFromRTDB() {
      try {
        // 1. Point to our fresh v2 database folder
        const response = await fetch("https://deltasync-c17bc-default-rtdb.firebaseio.com/laps_v2.json");
        const rawData = await response.json();

        if (!rawData) return;

        // 2. Translate dictionary to array (Fixed TypeScript strictness here)
        const data = Object.entries(rawData).map(([firebaseId, lapData]: [string, any]) => ({
          id: firebaseId,
          ...lapData
        }));

        // 3. Use your app's existing toLapData function to parse it perfectly
        const normalizedLaps = data.map((record: any) => toLapData(record));
        
        // Sort newest first
        normalizedLaps.sort((a, b) => b.dateRecorded.getTime() - a.dateRecorded.getTime());
        setLaps(normalizedLaps);

        // 4. Safely reconstruct the LocalStorage maps your comparison charts rely on
        const telemetryByLapId: Record<string, any[]> = {};
        const telemetryMetaByLapId: Record<string, any> = {};

        normalizedLaps.forEach((lap: LapData) => {
          const source = data.find(d => d.id === lap.id) || {};
          telemetryByLapId[lap.id] = Array.isArray(source.telemetry) ? source.telemetry : [];
          telemetryMetaByLapId[lap.id] = source.metadata || {};
        });

        localStorage.setItem("telemetryByLapId", JSON.stringify(telemetryByLapId));
        localStorage.setItem("telemetryMetaByLapId", JSON.stringify(telemetryMetaByLapId));

        // Feed the newest lap to the dashboard graph
        if (normalizedLaps.length > 0) {
          setLastUploadedTelemetry(telemetryByLapId[normalizedLaps[0].id]);
        }

      } catch (error) {
        console.error("Failed to load laps from RTDB:", error);
      }
    }

    // Fetch immediately, then poll every 5 seconds
    fetchFromRTDB();
    const intervalId = setInterval(fetchFromRTDB, 5000);
    return () => clearInterval(intervalId);
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
