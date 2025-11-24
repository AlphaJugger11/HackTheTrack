import { useEffect, useState, memo } from "react";
import Plot from "react-plotly.js";
import { raceApi } from "../services/api";

interface SectorComparisonChartProps {
  track: string;
  raceNum: number;
  driver: string;
}

interface SectorData {
  sector: string;
  current_avg: number;
  best_avg: number;
  delta: number;
}

export const SectorComparisonChart = memo(
  function SectorComparisonChart({
    track,
    raceNum,
    driver,
  }: SectorComparisonChartProps) {
    const [sectorData, setSectorData] = useState<SectorData[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      loadSectorData();
    }, [track, raceNum, driver]);

    const loadSectorData = async () => {
      try {
        setLoading(true);
        const analysis = await raceApi.getAnalytics(track, raceNum, driver);

        // Extract sector comparison data
        const sectors: SectorData[] = [];

        // Check if we have the flattened sector data
        if (analysis.sector_1_average !== undefined) {
          for (let i = 1; i <= 3; i++) {
            const avgKey = `sector_${i}_average`;
            const bestKey = `sector_${i}_best`;

            if (
              analysis[avgKey] !== undefined &&
              analysis[bestKey] !== undefined
            ) {
              sectors.push({
                sector: `Sector ${i}`,
                current_avg: analysis[avgKey],
                best_avg: analysis[bestKey],
                delta: analysis[avgKey] - analysis[bestKey],
              });
            }
          }
        }

        setSectorData(sectors);
      } catch (error) {
        console.error("Failed to load sector data:", error);
        setSectorData([]); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading sector analysis...</div>
        </div>
      );
    }

    if (sectorData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">No sector data available</div>
        </div>
      );
    }

    return (
      <div>
        <Plot
          data={[
            {
              x: sectorData.map((s) => s.sector),
              y: sectorData.map((s) => s.current_avg),
              type: "bar",
              name: "Current Average",
              marker: { color: "#ef4444" },
            },
            {
              x: sectorData.map((s) => s.sector),
              y: sectorData.map((s) => s.best_avg),
              type: "bar",
              name: "Best Average",
              marker: { color: "#22c55e" },
            },
          ]}
          layout={{
            autosize: true,
            paper_bgcolor: "rgba(0,0,0,0)",
            plot_bgcolor: "rgba(0,0,0,0)",
            font: { color: "#fff" },
            xaxis: {
              title: "Sector",
              gridcolor: "#374151",
            },
            yaxis: {
              title: "Time (seconds)",
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

        {/* Delta Table */}
        <div className="mt-4 grid grid-cols-3 gap-4">
          {sectorData.map((sector) => (
            <div key={sector.sector} className="bg-gray-800 p-3 rounded">
              <div className="text-sm text-gray-400">{sector.sector}</div>
              <div className="text-lg font-bold">
                {sector.delta >= 0 ? "+" : ""}
                {sector.delta.toFixed(3)}s
              </div>
              <div className="text-xs text-gray-500">vs best</div>
            </div>
          ))}
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.track === nextProps.track &&
      prevProps.raceNum === nextProps.raceNum &&
      prevProps.driver === nextProps.driver
    );
  }
);
