import { useEffect, useState, memo } from "react";
import { raceApi } from "../services/api";

interface StrategyPanelProps {
  track: string;
  raceNum: number;
  driver: string;
}

interface StrategyRecommendation {
  recommendation?: string;
  message?: string;
  pit_window?: {
    optimal_lap?: number;
    window_start?: number;
    window_end?: number;
    confidence?: string;
    degradation_rate?: number;
    justification?: string;
  };
  tire_degradation_percent?: number;
  predicted_position_after_pit?: number;
  current_position?: number;
  current_lap?: number;
  total_laps?: number;
  average_lap_time?: number;
  consistency_score?: number;
}

export const StrategyPanel = memo(
  function StrategyPanel({ track, raceNum, driver }: StrategyPanelProps) {
    const [strategy, setStrategy] = useState<StrategyRecommendation | null>(
      null
    );
    const [loading, setLoading] = useState(false);

    useEffect(() => {
      loadStrategy();
    }, [track, raceNum, driver]);

    const loadStrategy = async () => {
      try {
        setLoading(true);
        const data = await raceApi.getStrategy(track, raceNum, driver);
        setStrategy(data);
      } catch (error) {
        console.error("Failed to load strategy:", error);
        setStrategy(null); // Clear data on error
      } finally {
        setLoading(false);
      }
    };

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">Calculating strategy...</div>
        </div>
      );
    }

    if (!strategy) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-400">No strategy data available</div>
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {/* Recommendation Banner */}
        {strategy.recommendation && (
          <div
            className={`p-4 rounded-lg ${
              strategy.recommendation === "PIT_NOW"
                ? "bg-racing-red"
                : strategy.recommendation === "PIT_SOON"
                ? "bg-racing-yellow text-black"
                : "bg-racing-green"
            }`}
          >
            <div className="text-lg font-bold">
              {strategy.recommendation.replace("_", " ")}
            </div>
            {strategy.message && (
              <div className="text-sm mt-1">{strategy.message}</div>
            )}
          </div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {strategy.current_position !== undefined && (
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-gray-400 text-sm">Current Position</div>
              <div className="text-2xl font-bold text-white">
                P{strategy.current_position}
              </div>
            </div>
          )}

          {strategy.predicted_position_after_pit !== undefined && (
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-gray-400 text-sm">Predicted After Pit</div>
              <div className="text-2xl font-bold text-white">
                P{strategy.predicted_position_after_pit}
              </div>
            </div>
          )}

          {strategy.current_lap !== undefined &&
            strategy.total_laps !== undefined && (
              <div className="bg-gray-800 p-4 rounded">
                <div className="text-gray-400 text-sm">Race Progress</div>
                <div className="text-2xl font-bold text-white">
                  {strategy.current_lap}/{strategy.total_laps}
                </div>
              </div>
            )}

          {strategy.tire_degradation_percent !== undefined && (
            <div className="bg-gray-800 p-4 rounded">
              <div className="text-gray-400 text-sm">Tire Degradation</div>
              <div className="text-2xl font-bold text-white">
                {strategy.tire_degradation_percent.toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500">per lap</div>
            </div>
          )}
        </div>

        {/* Pit Strategy */}
        {strategy.pit_window && (
          <div className="bg-gray-800 p-4 rounded">
            <h4 className="text-lg font-semibold mb-3 text-racing-red">
              Pit Stop Strategy
            </h4>
            <div className="space-y-2">
              {strategy.pit_window.window_start &&
                strategy.pit_window.window_end && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pit Window:</span>
                    <span className="text-white font-mono">
                      Laps {strategy.pit_window.window_start} -{" "}
                      {strategy.pit_window.window_end}
                    </span>
                  </div>
                )}
              {strategy.pit_window.optimal_lap && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Optimal Pit Lap:</span>
                  <span className="text-racing-green font-bold">
                    Lap {strategy.pit_window.optimal_lap}
                  </span>
                </div>
              )}
              {strategy.pit_window.confidence && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Confidence:</span>
                  <span className="text-white capitalize">
                    {strategy.pit_window.confidence}
                  </span>
                </div>
              )}
              {strategy.pit_window.justification && (
                <div className="mt-3 p-3 bg-gray-900 rounded text-sm text-gray-300">
                  {strategy.pit_window.justification}
                </div>
              )}
            </div>
          </div>
        )}
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
