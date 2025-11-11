import { useEffect, useState } from "react";
import Plot from "react-plotly.js";
import type { LapData } from "../types/race.types";

interface LapTimeChartProps {
  lapData: LapData[];
  selectedDriver?: string | null;
}

export function LapTimeChart({ lapData, selectedDriver }: LapTimeChartProps) {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (lapData.length === 0) return;

    // Group laps by driver
    const driverLaps: Record<string, LapData[]> = {};
    lapData.forEach((lap) => {
      // Handle both with and without space prefix
      const lapTime = lap.LAP_TIME || lap[" LAP_TIME" as keyof LapData];
      const lapNumber = lap.LAP_NUMBER || lap[" LAP_NUMBER" as keyof LapData];
      const driverNumber = lap.NUMBER || lap[" NUMBER" as keyof LapData];

      // Skip pit laps and invalid lap times
      if (lap.is_pit_lap || !lapTime || lapTime <= 0) return;

      const driverKey = String(driverNumber);
      if (!driverLaps[driverKey]) {
        driverLaps[driverKey] = [];
      }
      driverLaps[driverKey].push(lap);
    });

    // Define distinct colors for better visibility (red, green, yellow, orange, cyan)
    const colors = ["#ef4444", "#22c55e", "#eab308", "#f97316", "#06b6d4"];

    // Create traces for each driver
    const traces = Object.entries(driverLaps)
      .filter(([driver]) => !selectedDriver || driver === selectedDriver)
      .slice(0, selectedDriver ? 1 : 5) // Show top 5 drivers or selected driver
      .map(([driver, laps], index) => {
        const sortedLaps = laps.sort((a, b) => {
          const aLapNum =
            a.LAP_NUMBER || a[" LAP_NUMBER" as keyof LapData] || 0;
          const bLapNum =
            b.LAP_NUMBER || b[" LAP_NUMBER" as keyof LapData] || 0;
          return Number(aLapNum) - Number(bLapNum);
        });

        return {
          x: sortedLaps.map(
            (l) => l.LAP_NUMBER || l[" LAP_NUMBER" as keyof LapData]
          ),
          y: sortedLaps.map(
            (l) => l.LAP_TIME || l[" LAP_TIME" as keyof LapData]
          ),
          type: "scatter",
          mode: "lines+markers",
          name: `Driver #${driver}`,
          line: { width: 2, color: colors[index % colors.length] },
          marker: { size: 4, color: colors[index % colors.length] },
        };
      });

    setChartData(traces);
  }, [lapData, selectedDriver]);

  if (chartData.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        No lap data available
      </div>
    );
  }

  return (
    <Plot
      data={chartData}
      layout={{
        title: selectedDriver
          ? `Driver #${selectedDriver} Lap Times`
          : "Lap Times (Top 5 Drivers)",
        xaxis: { title: "Lap Number", color: "#9ca3af" },
        yaxis: { title: "Lap Time (seconds)", color: "#9ca3af" },
        paper_bgcolor: "#1a1a1a",
        plot_bgcolor: "#1a1a1a",
        font: { color: "#ffffff" },
        showlegend: true,
        legend: { x: 1, y: 1 },
        margin: { t: 40, r: 20, b: 40, l: 60 },
      }}
      config={{ responsive: true }}
      style={{ width: "100%", height: "400px" }}
    />
  );
}
