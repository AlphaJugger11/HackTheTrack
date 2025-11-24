import { memo, useMemo } from "react";
import type { LapData } from "../types/race.types";

interface TimingTowerProps {
  lapData: LapData[];
  currentLap: number;
  selectedDriver?: string | null;
  onDriverSelect: (driver: string) => void;
}

interface DriverStanding {
  position: number;
  driver: string;
  lapTime: number;
  gapToLeader: string;
  gapToAhead: string;
  lastLap: number;
}

export const TimingTower = memo(
  function TimingTower({
    lapData,
    currentLap,
    selectedDriver,
    onDriverSelect,
  }: TimingTowerProps) {
    const standings = useMemo(() => {
      // Filter laps for current lap
      const currentLapData = lapData.filter(
        (lap) => (lap.LAP_NUMBER || 0) === currentLap
      );

      if (currentLapData.length === 0) return [];

      // Deduplicate by driver - keep only the best lap time for each driver
      const driverBestLaps = new Map<string, (typeof currentLapData)[0]>();
      currentLapData.forEach((lap) => {
        const driverNum = String(lap.NUMBER || "");
        const existing = driverBestLaps.get(driverNum);

        if (
          !existing ||
          (lap.LAP_TIME || 999999) < (existing.LAP_TIME || 999999)
        ) {
          driverBestLaps.set(driverNum, lap);
        }
      });

      // Convert to array and sort by lap time (fastest first)
      const sorted = Array.from(driverBestLaps.values()).sort((a, b) => {
        const timeA = a.LAP_TIME || 999999;
        const timeB = b.LAP_TIME || 999999;
        return timeA - timeB;
      });

      const leaderTime = sorted[0]?.LAP_TIME || 0;

      // Build standings
      const standings: DriverStanding[] = sorted.map((lap, index) => {
        const lapTime = lap.LAP_TIME || 0;
        const gapToLeader = index === 0 ? 0 : lapTime - leaderTime;
        const gapToAhead =
          index === 0 ? 0 : lapTime - (sorted[index - 1]?.LAP_TIME || 0);

        return {
          position: index + 1,
          driver: String(lap.NUMBER || ""),
          lapTime: lapTime,
          gapToLeader: index === 0 ? "LEADER" : `+${gapToLeader.toFixed(3)}s`,
          gapToAhead: index === 0 ? "-" : `+${gapToAhead.toFixed(3)}s`,
          lastLap: lapTime,
        };
      });

      return standings;
    }, [lapData, currentLap]);

    if (standings.length === 0) {
      return (
        <div className="bg-racing-gray rounded-lg p-6">
          <h3 className="text-xl font-semibold mb-4">Timing Tower</h3>
          <div className="text-gray-400 text-center py-8">
            No timing data available for lap {currentLap}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-racing-gray rounded-lg p-4">
        <h3 className="text-xl font-semibold mb-4 text-white">
          Timing Tower - Lap {currentLap}
        </h3>

        {/* Header */}
        <div className="grid grid-cols-5 gap-2 px-3 py-2 bg-gray-800 rounded-t text-xs font-semibold text-gray-400 border-b border-gray-700">
          <div>POS</div>
          <div>DRIVER</div>
          <div className="text-right">LAST LAP</div>
          <div className="text-right">GAP</div>
          <div className="text-right">INT</div>
        </div>

        {/* Driver List */}
        <div className="max-h-96 overflow-y-auto">
          {standings.map((standing) => {
            const isSelected = selectedDriver === standing.driver;
            const isLeader = standing.position === 1;

            return (
              <div
                key={standing.driver}
                onClick={() => onDriverSelect(standing.driver)}
                className={`
                  grid grid-cols-5 gap-2 px-3 py-2 cursor-pointer transition-colors
                  border-b border-gray-800
                  ${
                    isSelected
                      ? "bg-racing-red text-white font-bold"
                      : "hover:bg-gray-800 text-gray-300"
                  }
                  ${isLeader && !isSelected ? "bg-gray-800" : ""}
                `}
              >
                {/* Position */}
                <div className="flex items-center">
                  <span
                    className={`
                    text-sm font-bold
                    ${isLeader ? "text-racing-yellow" : ""}
                  `}
                  >
                    {standing.position}
                  </span>
                </div>

                {/* Driver Number */}
                <div className="flex items-center">
                  <span className="text-sm font-mono font-bold">
                    #{standing.driver}
                  </span>
                </div>

                {/* Last Lap Time */}
                <div className="flex items-center justify-end">
                  <span className="text-sm font-mono">
                    {standing.lastLap.toFixed(3)}
                  </span>
                </div>

                {/* Gap to Leader */}
                <div className="flex items-center justify-end">
                  <span
                    className={`text-xs font-mono ${
                      isLeader ? "text-racing-yellow font-bold" : ""
                    }`}
                  >
                    {standing.gapToLeader}
                  </span>
                </div>

                {/* Gap to Ahead (Interval) */}
                <div className="flex items-center justify-end">
                  <span className="text-xs font-mono">
                    {standing.gapToAhead}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-3 text-xs text-gray-400 text-center">
          Click driver to select • {standings.length} drivers
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.currentLap === nextProps.currentLap &&
      prevProps.selectedDriver === nextProps.selectedDriver &&
      prevProps.lapData === nextProps.lapData
    );
  }
);
