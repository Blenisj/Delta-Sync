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
  Upload,
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

  // Load laps from localStorage
  useEffect(() => {
    const savedLaps = localStorage.getItem("assettoCorsa_laps");
    if (savedLaps) {
      const parsed = JSON.parse(savedLaps);
      const lapsWithDates = parsed.map((lap: any) => ({
        ...lap,
        dateRecorded: new Date(lap.dateRecorded),
      }));
      setLaps(lapsWithDates);
    } else {
      // fallback demo laps
      const sampleLaps: LapData[] = [
        {
          id: "1",
          trackName: "Spa-Francorchamps",
          carModel: "Ferrari 488 GT3",
          lapTime: 125456,
          dateRecorded: new Date(Date.now() - 86400000 * 2),
          weather: "dry",
          temperature: 22,
          sectorTimes: [42150, 41200, 42106],
          topSpeed: 285,
          averageSpeed: 142.8,
        },
      ];
      setLaps(sampleLaps);
    }
  }, []);

  // Save laps to localStorage when changed
  useEffect(() => {
    localStorage.setItem("assettoCorsa_laps", JSON.stringify(laps));
  }, [laps]);

  //  Modified to also handle telemetry JSON
  const handleAddLap = (newLap: LapData, telemetryData?: any[]) => {
    setLaps((prevLaps) => [...prevLaps, newLap]);
    if (telemetryData && telemetryData.length > 0) {
      setLastUploadedTelemetry(telemetryData);
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
