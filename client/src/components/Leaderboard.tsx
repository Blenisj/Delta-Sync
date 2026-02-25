import { useState, useMemo, useEffect, use } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Trophy, Medal, Award, Clock, Car, MapPin, Filter } from "lucide-react";
import type { LapData } from "../types/racing";
import { getAll } from "../../../database/db_funcs"

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

  //get all data from database
  useEffect(() => {
    async function fetchData() {
      const data = await getAll();

      setData(
        data.map((lap: any) => ({
          ...lap,
          userName: lap.userName || "Unknown",
          userInitials: lap.userInitials || "??",
          isCurrentUser: false
        }))
      )
    }

    fetchData();
  })

  const [leaderboardData, setData] = useState<LeaderboardEntry[]>([]);

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