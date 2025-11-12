import { useRace } from "../context/RaceContext";

interface LapSelectorProps {
  totalLaps: number;
}

export function LapSelector({ totalLaps }: LapSelectorProps) {
  const { state, dispatch } = useRace();

  if (totalLaps === 0) return null;

  const handleLapChange = (lap: number) => {
    dispatch({ type: "SET_CURRENT_LAP", payload: lap });
  };

  const handlePrevious = () => {
    if (state.currentLap > 1) {
      handleLapChange(state.currentLap - 1);
    }
  };

  const handleNext = () => {
    if (state.currentLap < totalLaps) {
      handleLapChange(state.currentLap + 1);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 bg-gray-800 p-4 rounded-lg">
      <button
        onClick={handlePrevious}
        disabled={state.currentLap <= 1}
        className="px-4 py-2 bg-racing-gray text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        ← Previous
      </button>

      <div className="flex items-center gap-3">
        <label htmlFor="lap-slider" className="text-gray-400 text-sm">
          Lap:
        </label>
        <input
          id="lap-slider"
          type="range"
          min="1"
          max={totalLaps}
          value={state.currentLap}
          onChange={(e) => handleLapChange(parseInt(e.target.value))}
          className="w-64 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-racing-red"
        />
        <span className="text-white font-bold text-lg min-w-[80px] text-center">
          {state.currentLap} / {totalLaps}
        </span>
      </div>

      <button
        onClick={handleNext}
        disabled={state.currentLap >= totalLaps}
        className="px-4 py-2 bg-racing-gray text-white rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Next →
      </button>
    </div>
  );
}
