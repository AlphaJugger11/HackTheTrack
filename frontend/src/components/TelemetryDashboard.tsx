import { useEffect, useState, memo } from "react";
import Plot from "react-plotly.js";
import { raceApi } from "../services/api";

interface TelemetryDashboardProps {
  track: string;
  raceNum: number;
  driver: string;
  currentLap: number;
}

export const TelemetryDashboard = memo(
  function TelemetryDashboard({
    track,
    raceNum,
    driver,
    currentLap,
  }: TelemetryDashboardProps) {
    const [telemetry, setTelemetry] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      loadTelemetry();
    }, [track, raceNum, driver, currentLap]);

    const loadTelemetry = async () => {
      try {
        setLoading(true);
        const data = await raceApi.getTelemetry(track, raceNum, currentLap, 10);
        setTelemetry(data);
      } catch (error) {
        console.error("Failed to load telemetry:", error);
        setTelemetry([]);
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Loading telemetry data...</div>
        </div>
      );
    }

    if (telemetry.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">No telemetry data available</div>
        </div>
      );
    }

    // Extract data
    const timestamps = telemetry.map((_, i) => i);
    const speeds = telemetry.map((d: any) => d.speed || d.Speed || 0);
    const throttle = telemetry.map((d: any) => d.ath || 0);
    const brakeFront = telemetry.map((d: any) => d.pbrake_f || 0);
    const gearData = telemetry.map((d: any) => d.gear || 0);
    const accX = telemetry.map((d: any) => d.accx_can || 0);
    const accY = telemetry.map((d: any) => d.accy_can || 0);
    const steering = telemetry.map(
      (d: any) => d.Steering_Angle || d.steering_angle || 0
    );

    return (
      <div className="space-y-6">
        {/* Speed Trace */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-white">Speed Trace</h4>
          <Plot
            data={[
              {
                x: timestamps,
                y: speeds,
                type: "scatter",
                mode: "lines",
                name: "Speed",
                line: { color: "#22c55e", width: 2 },
                fill: "tozeroy",
                fillcolor: "rgba(34, 197, 94, 0.2)",
              },
            ]}
            layout={{
              autosize: true,
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: "#fff" },
              xaxis: {
                title: "Time",
                gridcolor: "#374151",
                showticklabels: false,
              },
              yaxis: {
                title: "Speed (km/h)",
                gridcolor: "#374151",
              },
              margin: { t: 20, b: 40, l: 60, r: 20 },
              showlegend: false,
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "250px" }}
          />
        </div>

        {/* Throttle and Brake */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-white">
            Driver Inputs
          </h4>
          <Plot
            data={[
              {
                x: timestamps,
                y: throttle,
                type: "scatter",
                mode: "lines",
                name: "Throttle",
                line: { color: "#22c55e", width: 2 },
                fill: "tozeroy",
                fillcolor: "rgba(34, 197, 94, 0.3)",
              },
              {
                x: timestamps,
                y: brakeFront.map((b: number) => -b),
                type: "scatter",
                mode: "lines",
                name: "Brake (Front)",
                line: { color: "#ef4444", width: 2 },
                fill: "tozeroy",
                fillcolor: "rgba(239, 68, 68, 0.3)",
              },
            ]}
            layout={{
              autosize: true,
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: "#fff" },
              xaxis: {
                title: "Time",
                gridcolor: "#374151",
                showticklabels: false,
              },
              yaxis: {
                title: "Input %",
                gridcolor: "#374151",
                zeroline: true,
                zerolinecolor: "#9ca3af",
              },
              margin: { t: 20, b: 40, l: 60, r: 20 },
              legend: {
                orientation: "h",
                y: -0.2,
              },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "250px" }}
          />
        </div>

        {/* G-Forces */}
        <div className="bg-gray-800 p-4 rounded-lg">
          <h4 className="text-lg font-semibold mb-3 text-white">G-Forces</h4>
          <Plot
            data={[
              {
                x: timestamps,
                y: accX,
                type: "scatter",
                mode: "lines",
                name: "Longitudinal (Accel/Brake)",
                line: { color: "#3b82f6", width: 2 },
              },
              {
                x: timestamps,
                y: accY,
                type: "scatter",
                mode: "lines",
                name: "Lateral (Cornering)",
                line: { color: "#f97316", width: 2 },
              },
            ]}
            layout={{
              autosize: true,
              paper_bgcolor: "rgba(0,0,0,0)",
              plot_bgcolor: "rgba(0,0,0,0)",
              font: { color: "#fff" },

              xaxis: {
                title: "Time",
                gridcolor: "#374151",
                showticklabels: false,
              },
              yaxis: {
                title: "G-Force",
                gridcolor: "#374151",
                zeroline: true,
                zerolinecolor: "#9ca3af",
              },
              margin: { t: 20, b: 40, l: 60, r: 20 },
              legend: {
                orientation: "h",
                y: -0.2,
              },
            }}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: "100%", height: "250px" }}
          />
        </div>

        {/* Gear and Steering */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-white">
              Gear Usage
            </h4>
            <Plot
              data={[
                {
                  x: timestamps,
                  y: gearData,
                  type: "scatter",
                  mode: "lines",
                  name: "Gear",
                  line: { color: "#eab308", width: 3, shape: "hv" },
                },
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: "#fff" },
                xaxis: {
                  title: "Time",
                  gridcolor: "#374151",
                  showticklabels: false,
                },
                yaxis: {
                  title: "Gear",
                  gridcolor: "#374151",
                  dtick: 1,
                },
                margin: { t: 20, b: 40, l: 60, r: 20 },
                showlegend: false,
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: "100%", height: "200px" }}
            />
          </div>

          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-lg font-semibold mb-3 text-white">
              Steering Angle
            </h4>
            <Plot
              data={[
                {
                  x: timestamps,
                  y: steering,
                  type: "scatter",
                  mode: "lines",
                  name: "Steering",
                  line: { color: "#06b6d4", width: 2 },
                },
              ]}
              layout={{
                autosize: true,
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                font: { color: "#fff" },
                xaxis: {
                  title: "Time",
                  gridcolor: "#374151",
                  showticklabels: false,
                },
                yaxis: {
                  title: "Angle (deg)",
                  gridcolor: "#374151",
                  zeroline: true,
                  zerolinecolor: "#9ca3af",
                },
                margin: { t: 20, b: 40, l: 60, r: 20 },
                showlegend: false,
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: "100%", height: "200px" }}
            />
          </div>
        </div>

        {/* Telemetry Stats */}
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-gray-800 p-4 rounded text-center">
            <div className="text-gray-400 text-sm">Max Speed</div>
            <div className="text-2xl font-bold text-racing-green">
              {Math.max(...speeds).toFixed(1)} km/h
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded text-center">
            <div className="text-gray-400 text-sm">Avg Speed</div>
            <div className="text-2xl font-bold text-white">
              {(
                speeds.reduce((a: number, b: number) => a + b, 0) /
                speeds.length
              ).toFixed(1)}{" "}
              km/h
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded text-center">
            <div className="text-gray-400 text-sm">Max G-Force</div>
            <div className="text-2xl font-bold text-racing-yellow">
              {Math.max(...accY.map(Math.abs)).toFixed(2)}g
            </div>
          </div>
          <div className="bg-gray-800 p-4 rounded text-center">
            <div className="text-gray-400 text-sm">Max Brake</div>
            <div className="text-2xl font-bold text-racing-red">
              {Math.max(...brakeFront).toFixed(1)} bar
            </div>
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.track === nextProps.track &&
      prevProps.raceNum === nextProps.raceNum &&
      prevProps.driver === nextProps.driver &&
      prevProps.currentLap === nextProps.currentLap
    );
  }
);
