import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Progress } from "./ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from "recharts";
import { TrendingDown, TrendingUp, Clock, AlertCircle, Target, Users, Zap, Trophy, Brain, Gauge } from "lucide-react";
import type { LapData, ComparisonAnalysis } from "../types/racing";
import { GitCompare } from 'lucide-react';

interface LapComparisonProps {
  laps: LapData[];
}

interface FasterDriverData extends LapData {
  driverName: string;
  driverInitials: string;
  skillLevel: "Pro" | "Semi-Pro" | "Advanced";
}

interface TrendAnalysis {
  category: string;
  userAverage: number;
  fasterDriversAverage: number;
  improvement: number;
  confidence: number;
  description: string;
  actionableAdvice: string;
}

interface PerformanceGap {
  metric: string;
  userValue: number;
  topDriversValue: number;
  gap: number;
  impactLevel: "High" | "Medium" | "Low";
  priority: number;
}

export function LapComparison({ laps }: LapComparisonProps) {
  const [selectedLap1, setSelectedLap1] = useState<string>("");
  const [selectedLap2, setSelectedLap2] = useState<string>("");
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedCar, setSelectedCar] = useState<string>("all");

  const lap1 = laps.find(lap => lap.id === selectedLap1);
  const lap2 = laps.find(lap => lap.id === selectedLap2);

  // Generate mock faster driver data
  const generateFasterDriversData = (): FasterDriverData[] => {
    const driverProfiles = [
      { name: "Lewis Hamilton", initials: "LH", skill: "Pro" as const },
      { name: "Max Verstappen", initials: "MV", skill: "Pro" as const },
      { name: "Charles Leclerc", initials: "CL", skill: "Pro" as const },
      { name: "Lando Norris", initials: "LN", skill: "Semi-Pro" as const },
      { name: "George Russell", initials: "GR", skill: "Semi-Pro" as const },
      { name: "Carlos Sainz", initials: "CS", skill: "Semi-Pro" as const },
      { name: "Oscar Piastri", initials: "OP", skill: "Advanced" as const },
      { name: "Alexander Albon", initials: "AA", skill: "Advanced" as const },
    ];

    const tracks = ["Spa-Francorchamps", "Monza", "Silverstone", "Suzuka", "Brands Hatch", "Nürburgring"];
    const cars = ["Ferrari 488 GT3", "McLaren 720S GT3", "Porsche 991 GT3 R", "BMW M6 GT3", "Audi R8 LMS", "Mercedes AMG GT3"];
    
    const fasterDrivers: FasterDriverData[] = [];

    for (let i = 0; i < 30; i++) {
      const track = tracks[Math.floor(Math.random() * tracks.length)];
      const car = cars[Math.floor(Math.random() * cars.length)];
      const driver = driverProfiles[Math.floor(Math.random() * driverProfiles.length)];
      
      // Generate faster lap times (these drivers are better than the user)
      let baseLapTime = 120000;
      switch (track) {
        case "Monza":
          baseLapTime = 90000 + Math.random() * 5000; // 1:30-1:35 (faster than user)
          break;
        case "Spa-Francorchamps":
          baseLapTime = 115000 + Math.random() * 8000; // 1:55-2:03 (faster than user)
          break;
        case "Silverstone":
          baseLapTime = 105000 + Math.random() * 5000; // 1:45-1:50
          break;
        case "Suzuka":
          baseLapTime = 103000 + Math.random() * 5000; // 1:43-1:48
          break;
        case "Brands Hatch":
          baseLapTime = 75000 + Math.random() * 3000; // 1:15-1:18
          break;
        case "Nürburgring":
          baseLapTime = 450000 + Math.random() * 20000; // 7:30-7:50
          break;
      }

      const lapTime = Math.floor(baseLapTime);
      const sectorTimes = [
        Math.floor(lapTime * 0.32), // Slightly more optimized distribution
        Math.floor(lapTime * 0.33),
        Math.floor(lapTime * 0.35)
      ];

      fasterDrivers.push({
        id: `faster-${i}`,
        trackName: track,
        carModel: car,
        lapTime,
        dateRecorded: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        weather: Math.random() > 0.8 ? "wet" : "dry",
        temperature: Math.floor(Math.random() * 20) + 15,
        sectorTimes,
        topSpeed: Math.floor(Math.random() * 40) + 270, // Higher top speeds
        averageSpeed: Math.floor(Math.random() * 25) + 155, // Higher average speeds
        driverName: driver.name,
        driverInitials: driver.initials,
        skillLevel: driver.skill
      });
    }

    return fasterDrivers;
  };

  const fasterDriversData = useMemo(() => generateFasterDriversData(), []);

  // Filter user's laps and faster drivers by track/car
  const getFilteredLaps = (lapsToFilter: LapData[]) => {
    let filtered = lapsToFilter;
    if (selectedTrack !== "all") {
      filtered = filtered.filter(lap => lap.trackName === selectedTrack);
    }
    if (selectedCar !== "all") {
      filtered = filtered.filter(lap => lap.carModel === selectedCar);
    }
    return filtered;
  };

  const filteredUserLaps = getFilteredLaps(laps);
  const filteredFasterDrivers = getFilteredLaps(fasterDriversData);

  // Analyze trends between user and faster drivers
  const getTrendAnalysis = (): TrendAnalysis[] => {
    if (filteredUserLaps.length === 0 || filteredFasterDrivers.length === 0) return [];

    const userAvgLapTime = filteredUserLaps.reduce((sum, lap) => sum + lap.lapTime, 0) / filteredUserLaps.length;
    const fasterAvgLapTime = filteredFasterDrivers.reduce((sum, lap) => sum + lap.lapTime, 0) / filteredFasterDrivers.length;

    const userAvgTopSpeed = filteredUserLaps.reduce((sum, lap) => sum + lap.topSpeed, 0) / filteredUserLaps.length;
    const fasterAvgTopSpeed = filteredFasterDrivers.reduce((sum, lap) => sum + lap.topSpeed, 0) / filteredFasterDrivers.length;

    const userAvgSpeed = filteredUserLaps.reduce((sum, lap) => sum + lap.averageSpeed, 0) / filteredUserLaps.length;
    const fasterAvgSpeed = filteredFasterDrivers.reduce((sum, lap) => sum + lap.averageSpeed, 0) / filteredFasterDrivers.length;

    // Sector analysis
    const userSector1Avg = filteredUserLaps.reduce((sum, lap) => sum + lap.sectorTimes[0], 0) / filteredUserLaps.length;
    const fasterSector1Avg = filteredFasterDrivers.reduce((sum, lap) => sum + lap.sectorTimes[0], 0) / filteredFasterDrivers.length;

    const userSector2Avg = filteredUserLaps.reduce((sum, lap) => sum + lap.sectorTimes[1], 0) / filteredUserLaps.length;
    const fasterSector2Avg = filteredFasterDrivers.reduce((sum, lap) => sum + lap.sectorTimes[1], 0) / filteredFasterDrivers.length;

    const userSector3Avg = filteredUserLaps.reduce((sum, lap) => sum + lap.sectorTimes[2], 0) / filteredUserLaps.length;
    const fasterSector3Avg = filteredFasterDrivers.reduce((sum, lap) => sum + lap.sectorTimes[2], 0) / filteredFasterDrivers.length;

    return [
      {
        category: "Overall Lap Time",
        userAverage: userAvgLapTime,
        fasterDriversAverage: fasterAvgLapTime,
        improvement: userAvgLapTime - fasterAvgLapTime,
        confidence: 95,
        description: "Time difference compared to faster drivers",
        actionableAdvice: "Focus on the most impactful sectors and cornering consistency"
      },
      {
        category: "Sector 1 Performance",
        userAverage: userSector1Avg,
        fasterDriversAverage: fasterSector1Avg,
        improvement: userSector1Avg - fasterSector1Avg,
        confidence: 88,
        description: "First sector contains mainly straights and high-speed corners",
        actionableAdvice: "Work on early braking points and entry speed optimization"
      },
      {
        category: "Sector 2 Performance", 
        userAverage: userSector2Avg,
        fasterDriversAverage: fasterSector2Avg,
        improvement: userSector2Avg - fasterSector2Avg,
        confidence: 91,
        description: "Technical middle sector with tight corners",
        actionableAdvice: "Focus on maintaining speed through technical sections and smoother inputs"
      },
      {
        category: "Sector 3 Performance",
        userAverage: userSector3Avg,
        fasterDriversAverage: fasterSector3Avg,
        improvement: userSector3Avg - fasterSector3Avg,
        confidence: 87,
        description: "Final sector emphasizes exit speed and acceleration",
        actionableAdvice: "Improve corner exit technique and throttle application timing"
      },
      {
        category: "Top Speed",
        userAverage: userAvgTopSpeed,
        fasterDriversAverage: fasterAvgTopSpeed,
        improvement: fasterAvgTopSpeed - userAvgTopSpeed,
        confidence: 78,
        description: "Maximum speed achieved during the lap",
        actionableAdvice: "Optimize slipstream usage and aerodynamic setup for straights"
      },
      {
        category: "Average Speed",
        userAverage: userAvgSpeed,
        fasterDriversAverage: fasterAvgSpeed,
        improvement: fasterAvgSpeed - userAvgSpeed,
        confidence: 92,
        description: "Overall speed efficiency throughout the lap",
        actionableAdvice: "Focus on carrying more speed through corners and reducing time lost in slower sections"
      }
    ];
  };

  const getPerformanceGaps = (): PerformanceGap[] => {
    const trends = getTrendAnalysis();
    if (trends.length === 0) return [];

    return trends.map((trend, index) => ({
      metric: trend.category,
      userValue: trend.userAverage,
      topDriversValue: trend.fasterDriversAverage,
      gap: Math.abs(trend.improvement),
      impactLevel: trend.improvement > 1000 ? "High" : trend.improvement > 500 ? "Medium" : "Low",
      priority: index + 1
    }));
  };

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(3);
    return `${minutes}:${seconds.padStart(6, '0')}`;
  };

  const formatTimeDifference = (ms: number) => {
    const sign = ms >= 0 ? '+' : '';
    return `${sign}${(ms / 1000).toFixed(3)}s`;
  };

  const trendAnalysis = getTrendAnalysis();
  const performanceGaps = getPerformanceGaps();

  // Get unique tracks and cars
  const uniqueTracks = [...new Set(laps.map(lap => lap.trackName))].sort();
  const uniqueCars = [...new Set(laps.map(lap => lap.carModel))].sort();

  // Traditional lap comparison analysis
  const getTraditionalAnalysis = (): ComparisonAnalysis | null => {
    if (!lap1 || !lap2) return null;

    const timeDiff = lap2.lapTime - lap1.lapTime;
    const sectorDiffs = lap2.sectorTimes.map((sector, i) => sector - lap1.sectorTimes[i]);

    return {
      timeDifference: timeDiff,
      sectorDifferences: sectorDiffs,
      improvementAreas: [
        {
          area: "Braking Points",
          description: "Consider braking later into turn 3 and turn 7",
          potentialGain: 250
        },
        {
          area: "Cornering Speed",
          description: "Maintain higher speed through sector 2 corners",
          potentialGain: 180
        },
        {
          area: "Throttle Application",
          description: "Earlier throttle application on corner exit",
          potentialGain: 320
        }
      ]
    };
  };

  const traditionalAnalysis = getTraditionalAnalysis();

  const sectorComparisonData = lap1 && lap2 ? [
    {
      sector: "Sector 1",
      lap1: lap1.sectorTimes[0] / 1000,
      lap2: lap2.sectorTimes[0] / 1000,
      difference: (lap2.sectorTimes[0] - lap1.sectorTimes[0]) / 1000
    },
    {
      sector: "Sector 2",
      lap1: lap1.sectorTimes[1] / 1000,
      lap2: lap2.sectorTimes[1] / 1000,
      difference: (lap2.sectorTimes[1] - lap1.sectorTimes[1]) / 1000
    },
    {
      sector: "Sector 3",
      lap1: lap1.sectorTimes[2] / 1000,
      lap2: lap2.sectorTimes[2] / 1000,
      difference: (lap2.sectorTimes[2] - lap1.sectorTimes[2]) / 1000
    }
  ] : [];

  // Prepare radar chart data for performance comparison
  const radarData = trendAnalysis.map(trend => ({
    metric: trend.category.split(' ')[0], // Shorten names for chart
    user: Math.max(0, 100 - (Math.abs(trend.improvement) / trend.fasterDriversAverage * 100)),
    topDrivers: 100,
    fullMetric: trend.category
  }));

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Performance Analysis & Lap Comparison
          </CardTitle>
          <CardDescription>
            Compare your performance against faster drivers and analyze individual laps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Track</label>
              <Select value={selectedTrack} onValueChange={setSelectedTrack}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {uniqueTracks.map(track => (
                    <SelectItem key={track} value={track}>{track}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Filter by Car</label>
              <Select value={selectedCar} onValueChange={setSelectedCar}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cars</SelectItem>
                  {uniqueCars.map(car => (
                    <SelectItem key={car} value={car}>{car}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="trends" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            vs Faster Drivers
          </TabsTrigger>
          <TabsTrigger value="individual" className="flex items-center gap-2">
            <GitCompare className="h-4 w-4" />
            Individual Laps
          </TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          {trendAnalysis.length > 0 ? (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5" />
                      Performance Overview
                    </CardTitle>
                    <CardDescription>
                      Your performance vs top {filteredFasterDrivers.length} drivers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <RadarChart data={radarData}>
                        <PolarGrid />
                        <PolarAngleAxis dataKey="metric" />
                        <PolarRadiusAxis angle={90} domain={[0, 100]} tickCount={5} />
                        <Radar name="You" dataKey="user" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                        <Radar name="Top Drivers" dataKey="topDrivers" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.3} />
                        <Tooltip 
                          formatter={(value, name) => [`${Number(value).toFixed(1)}%`, name]}
                          labelFormatter={(label) => radarData.find(d => d.metric === label)?.fullMetric || label}
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Zap className="h-5 w-5" />
                      Priority Improvement Areas
                    </CardTitle>
                    <CardDescription>
                      Focus on these areas for maximum lap time gains
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {performanceGaps.slice(0, 4).map((gap, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">{gap.metric}</span>
                            <Badge 
                              variant={gap.impactLevel === "High" ? "destructive" : gap.impactLevel === "Medium" ? "default" : "secondary"}
                            >
                              {gap.impactLevel} Impact
                            </Badge>
                          </div>
                          <Progress 
                            value={Math.min(100, (gap.gap / Math.max(gap.userValue, gap.topDriversValue)) * 100)} 
                            className="h-2"
                          />
                          <p className="text-xs text-muted-foreground">
                            Gap: {gap.metric.includes("Time") ? formatTimeDifference(gap.gap) : `${gap.gap.toFixed(1)} ${gap.metric.includes("Speed") ? "km/h" : "ms"}`}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    Detailed Analysis & Recommendations
                  </CardTitle>
                  <CardDescription>
                    AI-powered insights based on {filteredFasterDrivers.length} faster drivers' telemetry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {trendAnalysis.map((trend, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{trend.category}</h4>
                            <p className="text-sm text-muted-foreground">{trend.description}</p>
                          </div>
                          <div className="text-right">
                            <Badge variant="outline" className="mb-1">
                              {trend.confidence}% confidence
                            </Badge>
                            <div className="text-sm">
                              {trend.category.includes("Speed") ? (
                                <span className={trend.improvement < 0 ? "text-red-500" : "text-green-500"}>
                                  {trend.improvement > 0 ? "+" : ""}{trend.improvement.toFixed(1)} km/h
                                </span>
                              ) : (
                                <span className={trend.improvement < 0 ? "text-green-500" : "text-red-500"}>
                                  {formatTimeDifference(trend.improvement)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="bg-muted/50 rounded-md p-3">
                          <p className="text-sm"><strong>Action:</strong> {trend.actionableAdvice}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  No data available for comparison. Upload more laps or adjust your filters.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Select Laps to Compare</CardTitle>
              <CardDescription>
                Choose two of your laps to analyze the differences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Reference Lap (Lap 1)</label>
                  <Select onValueChange={setSelectedLap1}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reference lap" />
                    </SelectTrigger>
                    <SelectContent>
                      {laps.map((lap) => (
                        <SelectItem key={lap.id} value={lap.id}>
                          {formatTime(lap.lapTime)} - {lap.trackName} ({lap.carModel})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Comparison Lap (Lap 2)</label>
                  <Select onValueChange={setSelectedLap2}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select comparison lap" />
                    </SelectTrigger>
                    <SelectContent>
                      {laps.map((lap) => (
                        <SelectItem key={lap.id} value={lap.id}>
                          {formatTime(lap.lapTime)} - {lap.trackName} ({lap.carModel})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

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
                      <div className="text-2xl font-bold">{formatTime(lap1.lapTime)}</div>
                      <div className="text-sm text-muted-foreground">{lap1.trackName}</div>
                      <div className="text-sm text-muted-foreground">{lap1.carModel}</div>
                      <Badge variant="secondary">{lap1.weather}</Badge>
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
                      <div className="text-2xl font-bold">{formatTime(lap2.lapTime)}</div>
                      <div className="text-sm text-muted-foreground">{lap2.trackName}</div>
                      <div className="text-sm text-muted-foreground">{lap2.carModel}</div>
                      <Badge variant="secondary">{lap2.weather}</Badge>
                      {traditionalAnalysis && (
                        <div className="flex items-center gap-2 mt-2">
                          {traditionalAnalysis.timeDifference < 0 ? (
                            <TrendingDown className="h-4 w-4 text-green-500" />
                          ) : (
                            <TrendingUp className="h-4 w-4 text-red-500" />
                          )}
                          <span className={traditionalAnalysis.timeDifference < 0 ? "text-green-500" : "text-red-500"}>
                            {formatTimeDifference(traditionalAnalysis.timeDifference)}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Sector Comparison</CardTitle>
                  <CardDescription>
                    Compare sector times to identify areas for improvement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={sectorComparisonData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="sector" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value, name) => [
                          `${Number(value).toFixed(3)}s`, 
                          name === 'lap1' ? 'Reference' : 'Comparison'
                        ]}
                      />
                      <Bar dataKey="lap1" fill="#8884d8" name="lap1" />
                      <Bar dataKey="lap2" fill="#82ca9d" name="lap2" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {traditionalAnalysis && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      Improvement Analysis
                    </CardTitle>
                    <CardDescription>
                      Suggestions based on your lap comparison
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {traditionalAnalysis.improvementAreas.map((area, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{area.area}</h4>
                            <Badge variant="outline">
                              -{(area.potentialGain / 1000).toFixed(3)}s
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{area.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {(!lap1 || !lap2) && laps.length > 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  Select two laps above to see detailed comparison and analysis
                </div>
              </CardContent>
            </Card>
          )}

          {laps.length === 0 && (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  No laps available for comparison. Upload some laps first!
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}