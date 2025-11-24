import { memo } from "react";

interface RaceStatusBarProps {
  track: string;
  raceNum: number;
  currentLap: number;
  totalLaps: number;
  selectedDriver?: string | null;
}

export const RaceStatusBar = memo(
  function RaceStatusBar({
    track,
    raceNum,
    currentLap,
    totalLaps,
    selectedDriver,
  }: RaceStatusBarProps) {
    const progress = totalLaps > 0 ? (currentLap / totalLaps) * 100 : 0;

    return (
      <div className="bg-racing-gray border-b border-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left: Race Info */}
            <div className="flex items-center gap-6">
              <div>
                <div className="text-xs text-gray-400">Track</div>
                <div className="text-lg font-bold text-white">{track}</div>
              </div>
              <div className="h-8 w-px bg-gray-700"></div>
              <div>
                <div className="text-xs text-gray-400">Race</div>
                <div className="text-lg font-bold text-white">#{raceNum}</div>
              </div>
              <div className="h-8 w-px bg-gray-700"></div>
              <div>
                <div className="text-xs text-gray-400">Lap</div>
                <div className="text-lg font-bold text-racing-red">
                  {currentLap} / {totalLaps}
                </div>
              </div>
            </div>

            {/* Center: Progress Bar */}
            <div className="flex-1 max-w-md mx-8">
              <div className="text-xs text-gray-400 mb-1 text-center">
                Race Progress
              </div>
              <div className="relative h-3 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-gradient-to-r from-racing-red to-racing-yellow transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white drop-shadow-lg">
                    {progress.toFixed(1)}%
                  </span>
                </div>
              </div>
            </div>

            {/* Right: Selected Driver & Status */}
            <div className="flex items-center gap-6">
              {selectedDriver ? (
                <>
                  <div>
                    <div className="text-xs text-gray-400">Selected Driver</div>
                    <div className="text-lg font-bold text-racing-red">
                      #{selectedDriver}
                    </div>
                  </div>
                  <div className="h-8 w-px bg-gray-700"></div>
                </>
              ) : null}
              <div>
                <div className="text-xs text-gray-400">Status</div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold text-green-400">
                    GREEN FLAG
                  </span>
                </div>
              </div>
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
      prevProps.currentLap === nextProps.currentLap &&
      prevProps.totalLaps === nextProps.totalLaps &&
      prevProps.selectedDriver === nextProps.selectedDriver
    );
  }
);
