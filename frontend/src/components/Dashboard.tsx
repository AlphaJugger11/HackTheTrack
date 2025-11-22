import { useEffect, useState, useMemo, useCallback } from "react";
import { useRace } from "../context/RaceContext";
import { raceApi } from "../services/api";
import { RaceSelector } from "./RaceSelector";
import { LapTimeChart } from "./LapTimeChart";
import { SectorComparisonChart } from "./SectorComparisonChart";
import { StrategyPanel } from "./StrategyPanel";
import { TelemetryDashboard } from "./TelemetryDashboard";
import { LapSelector } from "./LapSelector";
import { LoadingSkeleton } from "./LoadingSkeleton";
import { Tooltip } from "./Tooltip";
import { RaceStatusBar } from "./RaceStatusBar";
import { TimingTower } from "./TimingTower";
import { TimelineControl } from "./TimelineControl";
import type { LapData } from "../types/race.types";

export function Dashboard() {
  const { state, dispatch } = useRace();
  const [lapData, setLapData] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<string[]>([]);

  // Memoized calculations
  const maxLap = useMemo(() => {
    if (lapData.length === 0) return 0;
    return Math.max(...lapData.map((l) => l.LAP_NUMBER || 0));
  }, [lapData]);

  const loadRaceData = useCallback(async () => {
    if (!state.track || !state.raceNum) return;

    try {
      setLoading(true);
      const [laps, driverList] = await Promise.all([
        raceApi.getLapData(state.track, state.raceNum),
        raceApi.getDrivers(state.track, state.raceNum),
      ]);

      setLapData(laps);
      setDrivers(driverList);
    } catch (error) {
      console.error("Failed to load race data:", error);
    } finally {
      setLoading(false);
    }
  }, [state.track, state.raceNum]);

  useEffect(() => {
    if (state.track && state.raceNum) {
      // Debounce race data loading to avoid multiple rapid calls
      const timer = setTimeout(() => {
        loadRaceData();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [state.track, state.raceNum, loadRaceData]);

  // Keyboard shortcuts for lap navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!state.selectedDriver) return;

      switch (e.key) {
        case "ArrowLeft":
          if (state.currentLap > 1) {
            dispatch({
              type: "SET_CURRENT_LAP",
              payload: state.currentLap - 1,
            });
          }
          break;
        case "ArrowRight":
          if (state.currentLap < maxLap) {
            dispatch({
              type: "SET_CURRENT_LAP",
              payload: state.currentLap + 1,
            });
          }
          break;
        case "Home":
          dispatch({ type: "SET_CURRENT_LAP", payload: 1 });
          break;
        case "End":
          dispatch({ type: "SET_CURRENT_LAP", payload: maxLap });
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [state.selectedDriver, state.currentLap, maxLap, dispatch]);

  return (
    <div className="min-h-screen bg-racing-dark text-white flex flex-col">
      {/* Header */}
      <header className="bg-racing-gray border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">GR Cup Analytics Platform</h1>
          <p className="text-gray-400 text-sm">
            Real-time race analytics and strategy
          </p>
        </div>
      </header>

      {/* Race Status Bar - Only show when race is selected */}
      {state.track && state.raceNum && maxLap > 0 && (
        <RaceStatusBar
          track={state.track}
          raceNum={state.raceNum}
          currentLap={state.currentLap || 1}
          totalLaps={maxLap}
          selectedDriver={state.selectedDriver}
        />
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Race Selection */}
          <div className="lg:col-span-1">
            <RaceSelector />

            {state.track && state.raceNum && (
              <div className="mt-6 bg-racing-gray p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-3">Race Info</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Track:</span>
                    <span className="ml-2 text-white">{state.track}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Race:</span>
                    <span className="ml-2 text-white">{state.raceNum}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Drivers:</span>
                    <span className="ml-2 text-white">{drivers.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Total Laps:</span>
                    <span className="ml-2 text-white">{maxLap || "-"}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Area */}
          <div className="lg:col-span-3">
            {!state.track || !state.raceNum ? (
              <div className="bg-racing-gray p-12 rounded-lg text-center">
                <h2 className="text-2xl font-semibold mb-2">
                  Welcome to GR Cup Analytics
                </h2>
                <p className="text-gray-400">
                  Select a race from the sidebar to begin analysis
                </p>
              </div>
            ) : loading ? (
              <LoadingSkeleton />
            ) : (
              <div className="space-y-6">
                {/* Race Data Summary */}
                <div className="bg-racing-gray p-6 rounded-lg">
                  <h2 className="text-2xl font-semibold mb-4">
                    {state.track} - Race {state.raceNum}
                  </h2>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gray-800 p-4 rounded">
                      <div className="text-gray-400 text-sm">Total Laps</div>
                      <div className="text-2xl font-bold text-white">
                        {maxLap}
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                      <div className="text-gray-400 text-sm">Drivers</div>
                      <div className="text-2xl font-bold text-white">
                        {drivers.length}
                      </div>
                    </div>
                    <div className="bg-gray-800 p-4 rounded">
                      <div className="text-gray-400 text-sm">Data Points</div>
                      <div className="text-2xl font-bold text-white">
                        {lapData.length}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timing Tower */}
                <TimingTower
                  lapData={lapData}
                  currentLap={state.currentLap || 1}
                  selectedDriver={state.selectedDriver}
                  onDriverSelect={(driver) => {
                    dispatch({
                      type: "SELECT_DRIVER",
                      payload: state.selectedDriver === driver ? null : driver,
                    });
                  }}
                />

                {/* Driver List */}
                <div className="bg-racing-gray p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">
                    <Tooltip content="Select a driver to view detailed analytics">
                      <span>Drivers</span>
                    </Tooltip>
                    {state.selectedDriver && (
                      <span className="ml-3 text-sm text-gray-400">
                        Selected: #{state.selectedDriver}
                      </span>
                    )}
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {drivers.map((driver) => (
                      <div
                        key={driver}
                        onClick={() =>
                          dispatch({
                            type: "SELECT_DRIVER",
                            payload:
                              state.selectedDriver === driver ? null : driver,
                          })
                        }
                        className={`px-3 py-2 rounded text-center cursor-pointer transition-colors ${
                          state.selectedDriver === driver
                            ? "bg-racing-red text-white font-bold"
                            : "bg-gray-800 hover:bg-gray-700"
                        }`}
                      >
                        #{driver}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Lap Selector - Only show when driver selected */}
                {state.selectedDriver && lapData.length > 0 && (
                  <div>
                    <LapSelector totalLaps={maxLap} />
                    <div className="mt-2 text-sm text-gray-400 text-center">
                      Use ← → arrow keys to navigate laps, Home/End for
                      first/last lap
                    </div>
                  </div>
                )}

                {/* Telemetry Dashboard - Only show when driver selected */}
                {state.selectedDriver && (
                  <div className="bg-racing-gray p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">
                      Telemetry Analysis - #{state.selectedDriver} - Lap{" "}
                      {state.currentLap || 1}
                    </h3>
                    <TelemetryDashboard
                      track={state.track!}
                      raceNum={state.raceNum!}
                      driver={state.selectedDriver}
                      currentLap={state.currentLap || 1}
                    />
                  </div>
                )}

                {/* Lap Time Chart */}
                <div className="bg-racing-gray p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">
                    Lap Time Analysis
                  </h3>
                  <LapTimeChart
                    lapData={lapData}
                    selectedDriver={state.selectedDriver}
                  />
                </div>

                {/* Sector Comparison Chart - Only show when driver selected */}
                {state.selectedDriver && (
                  <div className="bg-racing-gray p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">
                      Sector Time Comparison - #{state.selectedDriver}
                    </h3>
                    <SectorComparisonChart
                      track={state.track!}
                      raceNum={state.raceNum!}
                      driver={state.selectedDriver}
                    />
                  </div>
                )}

                {/* Strategy Panel - Only show when driver selected */}
                {state.selectedDriver && (
                  <div className="bg-racing-gray p-6 rounded-lg">
                    <h3 className="text-xl font-semibold mb-4">
                      Strategy Recommendations - #{state.selectedDriver}
                    </h3>
                    <StrategyPanel
                      track={state.track!}
                      raceNum={state.raceNum!}
                      driver={state.selectedDriver}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Timeline Control - Only show when race is selected */}
      {state.track && state.raceNum && maxLap > 0 && (
        <TimelineControl
          currentLap={state.currentLap || 1}
          totalLaps={maxLap}
          onLapChange={(lap) =>
            dispatch({ type: "SET_CURRENT_LAP", payload: lap })
          }
        />
      )}
    </div>
  );
}
