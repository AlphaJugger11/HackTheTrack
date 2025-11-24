export interface RaceMetadata {
  POSITION: number;
  NUMBER: string;
  STATUS: string;
  LAPS: number;
  TOTAL_TIME: string;
  FL_TIME: string;
  CLASS: string;
  VEHICLE: string;
}

export interface LapData {
  NUMBER: string;
  LAP_NUMBER: number;
  LAP_TIME: number;
  LAP_IMPROVEMENT: number;
  S1_SECONDS: number;
  S2_SECONDS: number;
  S3_SECONDS: number;
  KPH: number;
  ELAPSED: number;
  is_pit_lap: boolean;
}

export interface TelemetryPoint {
  timestamp: string;
  lap: number;
  Speed: number;
  Gear: number;
  nmot: number;
  ath: number;
  aps: number;
  pbrake_f: number;
  pbrake_r: number;
  accx_can: number;
  accy_can: number;
  Steering_Angle: number;
  VBOX_Lat_Min: number;
  VBOX_Long_Minutes: number;
  Laptrigger_lapdist_dls: number;
}

export interface StrategyRecommendation {
  recommendation: 'PIT_NOW' | 'STAY_OUT' | 'PIT_ASAP';
  message: string;
  pit_window: {
    optimal_lap: number;
    window_start: number;
    window_end: number;
    confidence: string;
    degradation_rate: number;
    justification: string;
  };
  tire_degradation_percent: number;
  predicted_position_after_pit: number;
  current_position: number;
  current_lap: number;
  total_laps: number;
}

export interface Driver {
  number: string;
  position: number;
  lastLapTime: number;
  gapToLeader: number;
  gapToAhead: number;
  bestLap: number;
  currentLap: number;
}

export interface RaceState {
  currentLap: number;
  totalLaps: number;
  selectedDriver: string | null;
  comparisonDriver: string | null;
  isPlaying: boolean;
  playbackSpeed: number;
  track: string | null;
  raceNum: number | null;
}

export interface AvailableRaces {
  tracks: Record<string, number[]>;
  total_races: number;
}

export interface RacingLineData {
  x: number[];
  y: number[];
  speed: number[];
  distance: number[];
  origin?: number[];
}

export interface WebSocketMessage {
  type: 'lap_update' | 'position_change' | 'pit_stop' | 'flag_change' | 'simulation_started' | 'simulation_complete' | 'paused' | 'error';
  lap?: number;
  drivers?: LapData[];
  track?: string;
  race_num?: number;
  total_laps?: number;
  message?: string;
}
