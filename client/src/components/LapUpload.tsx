import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Upload, Plus } from "lucide-react";
import type { LapData } from "../types/racing";

interface LapUploadProps {
  onAddLap: (lap: LapData) => void;
}

export function LapUpload({ onAddLap }: LapUploadProps) {
  const [formData, setFormData] = useState({
    trackName: "",
    carModel: "",
    lapTime: "",
    weather: "",
    temperature: "",
    topSpeed: "",
    sector1: "",
    sector2: "",
    sector3: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.trackName || !formData.carModel || !formData.lapTime) {
      return;
    }

    const lapTimeMs = parseFloat(formData.lapTime) * 1000;
    const sectorTimes = [
      parseFloat(formData.sector1 || "0") * 1000,
      parseFloat(formData.sector2 || "0") * 1000,
      parseFloat(formData.sector3 || "0") * 1000
    ];

    const newLap: LapData = {
      id: Date.now().toString(),
      trackName: formData.trackName,
      carModel: formData.carModel,
      lapTime: lapTimeMs,
      dateRecorded: new Date(),
      weather: formData.weather as 'dry' | 'wet' | 'mixed',
      temperature: parseFloat(formData.temperature || "20"),
      sectorTimes,
      topSpeed: parseFloat(formData.topSpeed || "0"),
      averageSpeed: (lapTimeMs > 0 ? (5000 / (lapTimeMs / 1000)) * 3.6 : 0) // Rough calculation for ~5km track
    };

    onAddLap(newLap);
    
    // Reset form
    setFormData({
      trackName: "",
      carModel: "",
      lapTime: "",
      weather: "",
      temperature: "",
      topSpeed: "",
      sector1: "",
      sector2: "",
      sector3: ""
    });
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Lap Data
          </CardTitle>
          <CardDescription>
            Manually enter your lap data or upload from Assetto Corsa telemetry files
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="trackName">Track Name</Label>
                <Input
                  id="trackName"
                  placeholder="e.g., Spa-Francorchamps"
                  value={formData.trackName}
                  onChange={(e) => handleInputChange("trackName", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="carModel">Car Model</Label>
                <Input
                  id="carModel"
                  placeholder="e.g., Ferrari 488 GT3"
                  value={formData.carModel}
                  onChange={(e) => handleInputChange("carModel", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lapTime">Lap Time (seconds)</Label>
                <Input
                  id="lapTime"
                  type="number"
                  step="0.001"
                  placeholder="125.456"
                  value={formData.lapTime}
                  onChange={(e) => handleInputChange("lapTime", e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weather">Weather</Label>
                <Select onValueChange={(value) => handleInputChange("weather", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select weather" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dry">Dry</SelectItem>
                    <SelectItem value="wet">Wet</SelectItem>
                    <SelectItem value="mixed">Mixed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature (°C)</Label>
                <Input
                  id="temperature"
                  type="number"
                  placeholder="20"
                  value={formData.temperature}
                  onChange={(e) => handleInputChange("temperature", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="topSpeed">Top Speed (km/h)</Label>
                <Input
                  id="topSpeed"
                  type="number"
                  placeholder="280"
                  value={formData.topSpeed}
                  onChange={(e) => handleInputChange("topSpeed", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Sector Times (seconds)</Label>
              <div className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Sector 1"
                  value={formData.sector1}
                  onChange={(e) => handleInputChange("sector1", e.target.value)}
                />
                <Input
                  placeholder="Sector 2"
                  value={formData.sector2}
                  onChange={(e) => handleInputChange("sector2", e.target.value)}
                />
                <Input
                  placeholder="Sector 3"
                  value={formData.sector3}
                  onChange={(e) => handleInputChange("sector3", e.target.value)}
                />
              </div>
            </div>

            <Button type="submit" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Lap
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>File Upload</CardTitle>
          <CardDescription>
            Upload telemetry files directly from Assetto Corsa
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <Upload className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">
              Drag and drop your telemetry files here
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports .json, .csv files from Assetto Corsa
            </p>
            <Button variant="outline">
              Browse Files
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}