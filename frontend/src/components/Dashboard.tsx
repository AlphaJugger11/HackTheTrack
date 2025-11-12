import { useEffect, useState } from "react";
import { useRace } from "../context/RaceContext";
import { raceApi } from "../services/api";
import { RaceSelector } from "./RaceSelector";
import { LapTimeChart } from "./LapTimeChart";
import { SectorComparisonChart } from "./SectorComparisonChart";
import { StrategyPanel } from "./StrategyPanel";
import { TelemetryDashboard } from "./TelemetryDashboard";
import { LapSelector } from "./LapSelector";
import type { LapData } from "../types/race.types";

export function Dashboard() {
  const { state, dispatch } = useRace();
  const [lapData, setLapData] = useState<LapData[]>([]);
  const [loading, setLoading] = useState(false);
  const [drivers, setDrivers] = useState<string[]>([]);

  useEffect(() => {
    if (state.track && state.raceNum) {
      // Debounce race data loading to avoid multiple rapid calls
      const timer = setTimeout(() => {
        loadRaceData();
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [state.track, state.raceNum]);

  const loadRaceData = async () => {
    if (!state.track || !state.raceNum) return;

    try {
      setLoading(true);
      const [laps, driverList] = await Promise.all([
        raceApi.getLapData(state.track, state.raceNum),
        raceApi.getDrivers(state.track, state.raceNum),
      ]);

      setLapData(laps);
      setDrivers(driverList);

      // Set total laps
      if (laps.length > 0) {
        const maxLap = Math.max(...laps.map((l) => l.LAP_NUMBER || 0));
        // Dispatch to context if needed
      }
    } catch (error) {
      console.error("Failed to load race data:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-racing-dark text-white">
      {/* Header */}
      <header className="bg-racing-gray border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold">GR Cup Analytics Platform</h1>
          <p className="text-gray-400 text-sm">
            Real-time race analytics and strategy
          </p>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
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
                    <span className="ml-2 text-white">
                      {lapData.length > 0
                        ? Math.max(...lapData.map((l) => l.LAP_NUMBER || 0))
                        : "-"}
                    </span>
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
              <div className="bg-racing-gray p-12 rounded-lg text-center">
                <div className="text-xl text-gray-400">
                  Loading race data...
                </div>
              </div>
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
                        {lapData.length > 0
                          ? Math.max(...lapData.map((l) => l.LAP_NUMBER || 0))
                          : 0}
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

                {/* Driver List */}
                <div className="bg-racing-gray p-6 rounded-lg">
                  <h3 className="text-xl font-semibold mb-4">
                    Drivers
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
                  <LapSelector
                    totalLaps={Math.max(
                      ...lapData.map(
                        (l) =>
                          l.LAP_NUMBER || l[" LAP_NUMBER" as keyof LapData] || 0
                      )
                    )}
                  />
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
    </div>
  );
}
