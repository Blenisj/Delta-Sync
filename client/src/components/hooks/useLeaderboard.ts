import { useState, useMemo } from "react";
import type { LapData } from "../../types/racing";

export interface LeaderboardEntry extends LapData {
  userName: string;
  userInitials: string;
  isCurrentUser?: boolean;
}

function toLeaderboardEntry(lap: any, isCurrentUser = false): LeaderboardEntry {
  return {
    ...lap,
    userName: lap.userName || "Unknown",
    userInitials: lap.userInitials || "??",
    isCurrentUser,
  };
}

export function useLeaderboard(userLaps: LapData[]) {
  const [selectedTrack, setSelectedTrack] = useState<string>("all");
  const [selectedCar, setSelectedCar] = useState<string>("all");

  const leaderboardData = useMemo(
    () => userLaps.map((lap) => toLeaderboardEntry(lap, false)),
    [userLaps],
  );

  // Compute available tracks based on selected car
  const availableTracks = useMemo(() => {
    if (selectedCar === "all") {
      return [...new Set(leaderboardData.map(entry => entry.trackName))].sort();
    } else {
      return [...new Set(leaderboardData.filter(entry => entry.carModel === selectedCar).map(entry => entry.trackName))].sort();
    }
  }, [leaderboardData, selectedCar]);

  // Compute available cars based on selected track
  const availableCars = useMemo(() => {
    if (selectedTrack === "all") {
      return [...new Set(leaderboardData.map(entry => entry.carModel))].sort();
    } else {
      return [...new Set(leaderboardData.filter(entry => entry.trackName === selectedTrack).map(entry => entry.carModel))].sort();
    }
  }, [leaderboardData, selectedTrack]);

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

  const handleTrackChange = (value: string) => {
    setSelectedTrack(value);
    if (value !== "all" && selectedCar !== "all") {
      const hasCarOnTrack = leaderboardData.some(entry => entry.trackName === value && entry.carModel === selectedCar);
      if (!hasCarOnTrack) {
        setSelectedCar("all");
      }
    }
  };

  const handleCarChange = (value: string) => {
    setSelectedCar(value);
    if (value !== "all" && selectedTrack !== "all") {
      const hasTrackForCar = leaderboardData.some(entry => entry.carModel === value && entry.trackName === selectedTrack);
      if (!hasTrackForCar) {
        setSelectedTrack("all");
      }
    }
  };

  return {
    selectedTrack,
    selectedCar,
    leaderboardData,
    availableTracks,
    availableCars,
    filteredAndSortedData,
    handleTrackChange,
    handleCarChange,
  };
}