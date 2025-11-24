import { memo, useState, useRef, useEffect } from "react";

interface TimelineControlProps {
  currentLap: number;
  totalLaps: number;
  onLapChange: (lap: number) => void;
  isPlaying?: boolean;
  onPlayPause?: () => void;
  playbackSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

export const TimelineControl = memo(
  function TimelineControl({
    currentLap,
    totalLaps,
    onLapChange,
    isPlaying = false,
    onPlayPause,
    playbackSpeed = 1,
    onSpeedChange,
  }: TimelineControlProps) {
    const [isDragging, setIsDragging] = useState(false);
    const timelineRef = useRef<HTMLDivElement>(null);

    const progress = totalLaps > 0 ? (currentLap / totalLaps) * 100 : 0;

    const handleMouseDown = (e: React.MouseEvent) => {
      setIsDragging(true);
      updateLapFromPosition(e.clientX);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        updateLapFromPosition(e.clientX);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    const updateLapFromPosition = (clientX: number) => {
      if (!timelineRef.current) return;

      const rect = timelineRef.current.getBoundingClientRect();
      const x = clientX - rect.left;
      const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
      const lap = Math.round((percentage / 100) * totalLaps);
      const clampedLap = Math.max(1, Math.min(totalLaps, lap));

      if (clampedLap !== currentLap) {
        onLapChange(clampedLap);
      }
    };

    useEffect(() => {
      if (isDragging) {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", handleMouseUp);
        return () => {
          window.removeEventListener("mousemove", handleMouseMove);
          window.removeEventListener("mouseup", handleMouseUp);
        };
      }
    }, [isDragging]);

    const handlePrevious = () => {
      if (currentLap > 1) {
        onLapChange(currentLap - 1);
      }
    };

    const handleNext = () => {
      if (currentLap < totalLaps) {
        onLapChange(currentLap + 1);
      }
    };

    const handleFirst = () => {
      onLapChange(1);
    };

    const handleLast = () => {
      onLapChange(totalLaps);
    };

    const speeds = [0.5, 1, 2, 5, 10];

    return (
      <div className="bg-racing-gray border-t border-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            {/* Playback Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleFirst}
                disabled={currentLap === 1}
                className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                title="First Lap"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>

              <button
                onClick={handlePrevious}
                disabled={currentLap === 1}
                className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                title="Previous Lap"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M8.445 14.832A1 1 0 0010 14V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>

              {onPlayPause && (
                <button
                  onClick={onPlayPause}
                  className="p-3 bg-racing-red hover:bg-red-600 rounded-full transition-colors"
                  title={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              )}

              <button
                onClick={handleNext}
                disabled={currentLap === totalLaps}
                className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                title="Next Lap"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10.894 5.168A1 1 0 0010 6v8a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4z" />
                </svg>
              </button>

              <button
                onClick={handleLast}
                disabled={currentLap === totalLaps}
                className="p-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded transition-colors"
                title="Last Lap"
              >
                <svg
                  className="w-5 h-5"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                </svg>
              </button>
            </div>

            {/* Timeline Scrubber */}
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="text-sm font-mono text-gray-400 min-w-[80px]">
                  Lap {currentLap}
                </span>

                <div
                  ref={timelineRef}
                  className="flex-1 relative h-8 bg-gray-800 rounded-full cursor-pointer"
                  onMouseDown={handleMouseDown}
                >
                  {/* Progress Bar */}
                  <div
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-racing-red to-racing-yellow rounded-full transition-all"
                    style={{ width: `${progress}%` }}
                  ></div>

                  {/* Scrubber Handle */}
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full shadow-lg cursor-grab active:cursor-grabbing transition-transform hover:scale-110"
                    style={{ left: `calc(${progress}% - 12px)` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-2 h-2 bg-racing-red rounded-full"></div>
                    </div>
                  </div>

                  {/* Lap Markers */}
                  {Array.from({ length: Math.min(totalLaps, 20) }, (_, i) => {
                    const lap = Math.floor((i / 19) * totalLaps) + 1;
                    const position = ((lap - 1) / totalLaps) * 100;
                    return (
                      <div
                        key={lap}
                        className="absolute top-0 w-px h-full bg-gray-700"
                        style={{ left: `${position}%` }}
                      ></div>
                    );
                  })}
                </div>

                <span className="text-sm font-mono text-gray-400 min-w-[80px] text-right">
                  / {totalLaps}
                </span>
              </div>
            </div>

            {/* Speed Control */}
            {onSpeedChange && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Speed:</span>
                {speeds.map((speed) => (
                  <button
                    key={speed}
                    onClick={() => onSpeedChange(speed)}
                    className={`px-3 py-1 text-xs rounded transition-colors ${
                      playbackSpeed === speed
                        ? "bg-racing-red text-white font-bold"
                        : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                    }`}
                  >
                    {speed}x
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.currentLap === nextProps.currentLap &&
      prevProps.totalLaps === nextProps.totalLaps &&
      prevProps.isPlaying === nextProps.isPlaying &&
      prevProps.playbackSpeed === nextProps.playbackSpeed
    );
  }
);
