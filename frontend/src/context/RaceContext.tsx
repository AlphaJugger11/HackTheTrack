import React, { createContext, useContext, useReducer, ReactNode } from "react";
import type { RaceState, LapData } from "../types/race.types";

interface RaceContextType {
  state: RaceState;
  dispatch: React.Dispatch<RaceAction>;
}

type RaceAction =
  | { type: "SET_RACE"; payload: { track: string; raceNum: number } }
  | { type: "SET_CURRENT_LAP"; payload: number }
  | { type: "SET_TOTAL_LAPS"; payload: number }
  | { type: "SELECT_DRIVER"; payload: string | null }
  | { type: "SET_COMPARISON_DRIVER"; payload: string | null }
  | { type: "SET_PLAYING"; payload: boolean }
  | { type: "SET_PLAYBACK_SPEED"; payload: number }
  | { type: "UPDATE_LAP_DATA"; payload: LapData[] };

const initialState: RaceState = {
  currentLap: 0,
  totalLaps: 0,
  selectedDriver: null,
  comparisonDriver: null,
  isPlaying: false,
  playbackSpeed: 1,
  track: null,
  raceNum: null,
};

function raceReducer(state: RaceState, action: RaceAction): RaceState {
  switch (action.type) {
    case "SET_RACE":
      return {
        ...state,
        track: action.payload.track,
        raceNum: action.payload.raceNum,
        currentLap: 1,
      };
    case "SET_CURRENT_LAP":
      return { ...state, currentLap: action.payload };
    case "SET_TOTAL_LAPS":
      return { ...state, totalLaps: action.payload };
    case "SELECT_DRIVER":
      return { ...state, selectedDriver: action.payload };
    case "SET_COMPARISON_DRIVER":
      return { ...state, comparisonDriver: action.payload };
    case "SET_PLAYING":
      return { ...state, isPlaying: action.payload };
    case "SET_PLAYBACK_SPEED":
      return { ...state, playbackSpeed: action.payload };
    default:
      return state;
  }
}

const RaceContext = createContext<RaceContextType | undefined>(undefined);

export function RaceProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(raceReducer, initialState);

  return (
    <RaceContext.Provider value={{ state, dispatch }}>
      {children}
    </RaceContext.Provider>
  );
}

export function useRace() {
  const context = useContext(RaceContext);
  if (context === undefined) {
    throw new Error("useRace must be used within a RaceProvider");
  }
  return context;
}
