import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Trophy, Medal, Award, Clock, Car, MapPin, Filter } from "lucide-react";
import type { LapData } from "../types/racing";

interface LeaderboardEntry extends LapData {
  userName: string;
  userInitials: string;
  isCurrentUser?: boolean;
}

interface LeaderboardProps {
  userLaps: LapData[];
}

export function Leaderboard({ userLaps }: LeaderboardProps) {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedCar, setSelectedCar] = useState<string>("all");

  // Generate mock leaderboard data with other users
  const generateMockLeaderboard = (): LeaderboardEntry[] => {
    const mockUsers = [
      { name: "Alex Rodriguez", initials: "AR" },
      { name: "Sarah Chen", initials: "SC" },
      { name: "Marcus Johnson", initials: "MJ" },
      { name: "Elena Petrov", initials: "EP" },
      { name: "David Kim", initials: "DK" },
      { name: "Isabella Torres", initials: "IT" },
      { name: "James Wilson", initials: "JW" },
      { name: "Zoe Anderson", initials: "ZA" },
      { name: "Ryan O'Connor", initials: "RO" },
      { name: "Nina Sharma", initials: "NS" }
    ];

    const tracks = ["Spa-Francorchamps", "Monza", "Silverstone", "Suzuka", "Brands Hatch", "Nürburgring"];
    const cars = ["Ferrari 488 GT3", "McLaren 720S GT3", "Porsche 991 GT3 R", "BMW M6 GT3", "Audi R8 LMS", "Mercedes AMG GT3"];
    
    const mockLaps: LeaderboardEntry[] = [];

    // Add current user's laps
    userLaps.forEach(lap => {
      mockLaps.push({
        ...lap,
        userName: "You",
        userInitials: "ME",
        isCurrentUser: true
      });
    });

    // Generate mock laps for other users
    for (let i = 0; i < 50; i++) {
      const track = tracks[Math.floor(Math.random() * tracks.length)];
      const car = cars[Math.floor(Math.random() * cars.length)];
      const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
      
      // Generate realistic lap times based on track
      let baseLapTime = 120000; // 2:00.000 default
      switch (track) {
        case "Monza":
          baseLapTime = 95000 + Math.random() * 8000; // 1:35-1:43
          break;
        case "Spa-Francorchamps":
          baseLapTime = 125000 + Math.random() * 10000; // 2:05-2:15
          break;
        case "Silverstone":
          baseLapTime = 110000 + Math.random() * 8000; // 1:50-1:58
          break;
        case "Suzuka":
          baseLapTime = 108000 + Math.random() * 7000; // 1:48-1:55
          break;
        case "Brands Hatch":
          baseLapTime = 78000 + Math.random() * 5000; // 1:18-1:23
          break;
        case "Nürburgring":
          baseLapTime = 480000 + Math.random() * 30000; // 8:00-8:30
          break;
      }

      const lapTime = Math.floor(baseLapTime);
      const sectorTimes = [
        Math.floor(lapTime * 0.33),
        Math.floor(lapTime * 0.33),
        Math.floor(lapTime * 0.34)
      ];

      mockLaps.push({
        id: `mock-${i}`,
        trackName: track,
        carModel: car,
        lapTime,
        dateRecorded: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000), // Random within last week
        weather: Math.random() > 0.8 ? "wet" : "dry",
        temperature: Math.floor(Math.random() * 20) + 15, // 15-35°C
        sectorTimes,
        topSpeed: Math.floor(Math.random() * 50) + 250, // 250-300 km/h
        averageSpeed: Math.floor(Math.random() * 30) + 140, // 140-170 km/h
        userName: user.name,
        userInitials: user.initials,
        isCurrentUser: false
      });
    }

    return mockLaps;
  };

  const leaderboardData = useMemo(() => generateMockLeaderboard(), [userLaps]);

  // Filter and sort the data
  const filteredAndSortedData = useMemo(() => {
    let filtered = leaderboardData;

    if (selectedTrack !== "all") {
      filtered = filtered.filter(entry => entry.trackName === selectedTrack);
    }

    if (selectedCar !== "all") {
      filtered = filtered.filter(entry => entry.carModel === selectedCar);
    }

    // Sort by lap time (fastest first)
    return filtered.sort((a, b) => a.lapTime - b.lapTime);
  }, [leaderboardData, selectedTrack, selectedCar]);

  // Get unique tracks and cars for filter options
  const uniqueTracks = [...new Set(leaderboardData.map(entry => entry.trackName))].sort();
  const uniqueCars = [...new Set(leaderboardData.map(entry => entry.carModel))].sort();

  const formatTime = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = ((ms % 60000) / 1000).toFixed(3);
    return `${minutes}:${seconds.padStart(6, '0')}`;
  };

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 2:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 3:
        return <Award className="h-5 w-5 text-amber-600" />;
      default:
        return <span className="text-muted-foreground font-medium">#{position}</span>;
    }
  };

  const getPositionDelta = (entry: LeaderboardEntry, position: number) => {
    if (position === 1) return null;
    const timeDiff = entry.lapTime - filteredAndSortedData[0].lapTime;
    return `+${(timeDiff / 1000).toFixed(3)}s`;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Global Leaderboard
          </CardTitle>
          <CardDescription>
            Compare your lap times with drivers from around the world
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <label className="text-sm font-medium">Filter by Track</label>
              </div>
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
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <label className="text-sm font-medium">Filter by Car</label>
              </div>
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

      <Card>
        <CardHeader>
          <CardTitle>Rankings</CardTitle>
          <CardDescription>
            {filteredAndSortedData.length} drivers • {selectedTrack !== "all" ? selectedTrack : "All tracks"} • {selectedCar !== "all" ? selectedCar : "All cars"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredAndSortedData.slice(0, 50).map((entry, index) => {
              const position = index + 1;
              const delta = getPositionDelta(entry, position);
              
              return (
                <div 
                  key={`${entry.id}-${entry.userName}`}
                  className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${
                    entry.isCurrentUser ? "bg-primary/5 border-primary/20" : "hover:bg-muted/50"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-8">
                      {getRankIcon(position)}
                    </div>
                    
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className={entry.isCurrentUser ? "bg-primary text-primary-foreground" : ""}>
                        {entry.userInitials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${entry.isCurrentUser ? "text-primary" : ""}`}>
                          {entry.userName}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {entry.trackName} • {entry.carModel}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {entry.weather}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {entry.temperature}°C
                      </span>
                    </div>
                    
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{formatTime(entry.lapTime)}</span>
                      </div>
                      {delta && (
                        <div className="text-xs text-muted-foreground">
                          {delta}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredAndSortedData.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Filter className="h-8 w-8 mx-auto mb-2 opacity-50" />
              No entries found for the selected filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}