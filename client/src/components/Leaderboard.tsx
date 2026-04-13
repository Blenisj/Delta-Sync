import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Badge } from "./ui/badge";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Trophy, Clock, Car, MapPin, Filter } from "lucide-react";
import type { LeaderboardProps } from "../types/racing";
import { useLeaderboard } from "./hooks/useLeaderboard";
import { getRankIcon, getPositionDelta, formatLeaderboardTime } from "./utils/leaderboardUtils";
import { formatIdentifierLabel } from "./utils/displayFormatters";

export function Leaderboard({ userLaps }: LeaderboardProps) {
  const {
    selectedTrack,
    selectedCar,
    availableTracks,
    availableCars,
    filteredAndSortedData,
    handleTrackChange,
    handleCarChange,
  } = useLeaderboard(userLaps);

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
              <Select 
                value={selectedTrack} 
                onValueChange={handleTrackChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tracks</SelectItem>
                  {availableTracks.map(track => (
                    <SelectItem key={track} value={track}>{formatIdentifierLabel(track)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Car className="h-4 w-4" />
                <label className="text-sm font-medium">Filter by Car</label>
              </div>
              <Select 
                value={selectedCar} 
                onValueChange={handleCarChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cars</SelectItem>
                  {availableCars.map(car => (
                    <SelectItem key={car} value={car}>{formatIdentifierLabel(car)}</SelectItem>
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
            {filteredAndSortedData.length} drivers • {selectedTrack !== "all" ? formatIdentifierLabel(selectedTrack) : "All tracks"} • {selectedCar !== "all" ? formatIdentifierLabel(selectedCar) : "All cars"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredAndSortedData.slice(0, 50).map((entry: any, index: number) => {
              const position = index + 1;
              const delta = getPositionDelta(entry, position, filteredAndSortedData);
              
              // --- THE BYPASS FIX ---
              // useLeaderboard is stripping the name. Reach back to the raw source data!
              const rawLap = userLaps.find(l => l.id === entry.id);
              const displayName = rawLap?.userName || "Local Driver";
              const initials = rawLap?.userInitials || "??";
              // ----------------------

              return (
                <div 
                  key={`${entry.id}-${displayName}`}
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
                        {/* Use our bypassed initials */}
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium ${entry.isCurrentUser ? "text-primary" : ""}`}>
                          {/* Use our bypassed name */}
                          {displayName}
                        </span>
                        {entry.isCurrentUser && (
                          <Badge variant="secondary" className="text-xs">You</Badge>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatIdentifierLabel(entry.trackName)} • {formatIdentifierLabel(entry.carModel)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-bold">{formatLeaderboardTime(entry.lapTime)}</span>
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