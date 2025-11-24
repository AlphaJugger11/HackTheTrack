import { memo, useMemo } from "react";
import type { LapData } from "../types/race.types";
import Plot from "react-plotly.js";

interface DriverComparisonProps {
  lapData: LapData[];
  driver1: string;
  driver2: string;
  track: string;
  raceNum: number;
}

export const DriverComparison = memo(
  function DriverComparison({
    lapData,
    driver1,
    driver2,
    track,
    raceNum,
  }: DriverComparisonProps) {
    const comparisonData = useMemo(() => {
      // Filter data for both drivers
      const driver1Laps = lapData
        .filter((lap) => String(lap.NUMBER) === driver1 && !lap.is_pit_lap)
        .sort((a, b) => (a.LAP_NUMBER || 0) - (b.LAP_NUMBER || 0));

      const driver2Laps = lapData
        .filter((lap) => String(lap.NUMBER) === driver2 && !lap.is_pit_lap)
        .sort((a, b) => (a.LAP_NUMBER || 0) - (b.LAP_NUMBER || 0));

      if (driver1Laps.length === 0 || driver2Laps.length === 0) {
        return null;
      }

      // Calculate statistics
      const driver1Times = driver1Laps
        .map((l) => l.LAP_TIME || 0)
        .filter((t) => t > 0);
      const driver2Times = driver2Laps
        .map((l) => l.LAP_TIME || 0)
        .filter((t) => t > 0);

      const stats = {
        driver1: {
          best: Math.min(...driver1Times),
          avg: driver1Times.reduce((a, b) => a + b, 0) / driver1Times.length,
          worst: Math.max(...driver1Times),
          laps: driver1Times.length,
        },
        driver2: {
          best: Math.min(...driver2Times),
          avg: driver2Times.reduce((a, b) => a + b, 0) / driver2Times.length,
          worst: Math.max(...driver2Times),
          laps: driver2Times.length,
        },
      };

      return {
        driver1Laps,
        driver2Laps,
        stats,
      };
    }, [lapData, driver1, driver2]);

    if (!comparisonData) {
      return (
        <div className="bg-racing-gray p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Driver Comparison</h3>
          <div className="text-gray-400 text-center py-8">
            No data available for comparison
          </div>
        </div>
      );
    }

    const { driver1Laps, driver2Laps, stats } = comparisonData;

    // Calculate who's faster
    const bestLapDiff = stats.driver1.best - stats.driver2.best;
    const avgLapDiff = stats.driver1.avg - stats.driver2.avg;

    return (
      <div className="bg-racing-gray p-6 rounded-lg space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Driver Comparison</h3>
          <div className="text-sm text-gray-400">
            {track} - Race {raceNum}
          </div>
        </div>

        {/* Head-to-Head Stats */}
        <div className="grid grid-cols-3 gap-4">
          {/* Driver 1 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Driver</div>
              <div className="text-3xl font-bold text-racing-red">
                #{driver1}
              </div>
            </div>
          </div>

          {/* VS */}
          <div className="flex items-center justify-center">
            <div className="text-2xl font-bold text-gray-600">VS</div>
          </div>

          {/* Driver 2 */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-center">
              <div className="text-sm text-gray-400 mb-2">Driver</div>
              <div className="text-3xl font-bold text-racing-blue">
                #{driver2}
              </div>
            </div>
          </div>
        </div>

        {/* Statistics Comparison */}
        <div className="grid grid-cols-3 gap-4">
          {/* Best Lap */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-2 text-center">
              Best Lap
            </div>
            <div className="flex justify-between items-center">
              <div
                className={`text-lg font-bold ${
                  bestLapDiff < 0 ? "text-racing-green" : "text-white"
                }`}
              >
                {stats.driver1.best.toFixed(3)}s
              </div>
              <div className="text-xs text-gray-500">
                {bestLapDiff < 0 ? "↓" : "↑"}
                {Math.abs(bestLapDiff).toFixed(3)}s
              </div>
              <div
                className={`text-lg font-bold ${
                  bestLapDiff > 0 ? "text-racing-green" : "text-white"
                }`}
              >
                {stats.driver2.best.toFixed(3)}s
              </div>
            </div>
          </div>

          {/* Average Lap */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-2 text-center">
              Average Lap
            </div>
            <div className="flex justify-between items-center">
              <div
                className={`text-lg font-bold ${
                  avgLapDiff < 0 ? "text-racing-green" : "text-white"
                }`}
              >
                {stats.driver1.avg.toFixed(3)}s
              </div>
              <div className="text-xs text-gray-500">
                {avgLapDiff < 0 ? "↓" : "↑"}
                {Math.abs(avgLapDiff).toFixed(3)}s
              </div>
              <div
                className={`text-lg font-bold ${
                  avgLapDiff > 0 ? "text-racing-green" : "text-white"
                }`}
              >
                {stats.driver2.avg.toFixed(3)}s
              </div>
            </div>
          </div>

          {/* Total Laps */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <div className="text-sm text-gray-400 mb-2 text-center">
              Total Laps
            </div>
            <div className="flex justify-between items-center">
              <div className="text-lg font-bold text-white">
                {stats.driver1.laps}
              </div>
              <div className="text-xs text-gray-500">laps</div>
              <div className="text-lg font-bold text-white">
                {stats.driver2.laps}
              </div>
            </div>
          </div>
        </div>

        {/* Lap Time Comparison Chart */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-white">
            Lap Time Comparison
          </h4>
          <Plot
            data={[
              {
                x: driver1Laps.map((l) => l.LAP_NUMBER),
                y: driver1Laps.map((l) => l.LAP_TIME),
                type: "scatter",
                mode: "lines+markers",
                name: `Driver #${driver1}`,
                line: { color: "#ef4444", width: 2 },
                marker: { size: 6, color: "#ef4444" },
              },
              {
                x: driver2Laps.map((l) => l.LAP_NUMBER),
                y: driver2Laps.map((l) => l.LAP_TIME),
                type: "scatter",
                mode: "lines+markers",
                name: `Driver #${driver2}`,
                line: { color: "#3b82f6", width: 2 },
                marker: { size: 6, color: "#3b82f6" },
              },
            ]}
            layout={{
              autosize: true,
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: "#fff" },
              xaxis: {
                title: "Lap Number",
                gridcolor: "#374151",
              },
              yaxis: {
                title: "Lap Time (seconds)",
                gridcolor: "#374151",
              },
              legend: {
                orientation: "h",
                y: -0.2,
              },
              margin: { t: 20, b: 60, l: 60, r: 20 },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "400px" }}
          />
        </div>

        {/* Delta Chart (Difference) */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-white">
            Lap Time Delta (Driver #{driver1} vs #{driver2})
          </h4>
          <Plot
            data={[
              {
                x: driver1Laps.map((l) => l.LAP_NUMBER),
                y: driver1Laps.map((l) => {
                  const d2Lap = driver2Laps.find(
                    (d2) => d2.LAP_NUMBER === l.LAP_NUMBER
                  );
                  if (!d2Lap) return null;
                  return (l.LAP_TIME || 0) - (d2Lap.LAP_TIME || 0);
                }),
                type: "bar",
                name: "Delta",
                marker: {
                  color: driver1Laps.map((l) => {
                    const d2Lap = driver2Laps.find(
                      (d2) => d2.LAP_NUMBER === l.LAP_NUMBER
                    );
                    if (!d2Lap) return "#666";
                    const delta = (l.LAP_TIME || 0) - (d2Lap.LAP_TIME || 0);
                    return delta < 0 ? "#22c55e" : "#ef4444";
                  }),
                },
              },
            ]}
            layout={{
              autosize: true,
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: "#fff" },
              xaxis: {
                title: "Lap Number",
                gridcolor: "#374151",
              },
              yaxis: {
                title: "Time Difference (seconds)",
                gridcolor: "#374151",
                zeroline: true,
                zerolinecolor: "#9ca3af",
                zerolinewidth: 2,
              },
              showlegend: false,
              margin: { t: 20, b: 60, l: 60, r: 20 },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "300px" }}
          />
          <div className="mt-2 text-xs text-gray-400 text-center">
            Green = Driver #{driver1} faster | Red = Driver #{driver2} faster
          </div>
        </div>

        {/* Winner Summary */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <div className="text-center">
            <div className="text-sm text-gray-400 mb-2">Overall Winner</div>
            <div className="text-2xl font-bold">
              {avgLapDiff < 0 ? (
                <span className="text-racing-red">
                  Driver #{driver1} by {Math.abs(avgLapDiff).toFixed(3)}s/lap
                </span>
              ) : (
                <span className="text-racing-blue">
                  Driver #{driver2} by {Math.abs(avgLapDiff).toFixed(3)}s/lap
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Based on average lap time
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.driver1 === nextProps.driver1 &&
      prevProps.driver2 === nextProps.driver2 &&
      prevProps.lapData === nextProps.lapData &&
      prevProps.track === nextProps.track &&
      prevProps.raceNum === nextProps.raceNum
    );
  }
);
