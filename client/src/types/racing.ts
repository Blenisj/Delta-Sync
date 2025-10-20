export interface LapData {
  id: string;
  trackName: string;
  carModel: string;
  lapTime: number; // in milliseconds
  dateRecorded: Date;
  weather: 'dry' | 'wet' | 'mixed';
  temperature: number; // in Celsius
  sectorTimes: number[]; // array of sector times in milliseconds
  topSpeed: number; // in km/h
  averageSpeed: number; // in km/h
}

export interface TelemetryPoint {
  timestamp: number; // in milliseconds from start of lap
  speed: number; // in km/h
  throttle: number; // percentage 0-100
  brake: number; // percentage 0-100
  steering: number; // degrees, negative = left, positive = right
  gear: number; // current gear
  rpm: number; // engine RPM
  distance: number; // distance along track in meters
}

export interface TelemetryData {
  lapId: string;
  points: TelemetryPoint[];
}

export interface ImprovementArea {
  area: string;
  description: string;
  potentialGain: number; // in milliseconds
}

export interface ComparisonAnalysis {
  timeDifference: number; // in milliseconds (lap2 - lap1)
  sectorDifferences: number[]; // array of sector differences in milliseconds
  improvementAreas: ImprovementArea[];
}