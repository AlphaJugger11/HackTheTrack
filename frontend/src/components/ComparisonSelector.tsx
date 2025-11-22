import { memo, useState } from "react";

interface ComparisonSelectorProps {
  drivers: string[];
  onCompare: (driver1: string, driver2: string) => void;
  onClose: () => void;
}

export const ComparisonSelector = memo(function ComparisonSelector({
  drivers,
  onCompare,
  onClose,
}: ComparisonSelectorProps) {
  const [driver1, setDriver1] = useState<string>("");
  const [driver2, setDriver2] = useState<string>("");

  const handleCompare = () => {
    if (driver1 && driver2 && driver1 !== driver2) {
      onCompare(driver1, driver2);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-racing-gray p-6 rounded-lg max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Compare Drivers</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Driver 1 Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Driver 1</label>
            <select
              value={driver1}
              onChange={(e) => setDriver1(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-racing-red focus:outline-none"
            >
              <option value="">Select driver...</option>
              {drivers.map((driver) => (
                <option
                  key={driver}
                  value={driver}
                  disabled={driver === driver2}
                >
                  Driver #{driver}
                </option>
              ))}
            </select>
          </div>

          {/* VS */}
          <div className="text-center text-2xl font-bold text-gray-600">VS</div>

          {/* Driver 2 Selection */}
          <div>
            <label className="block text-sm text-gray-400 mb-2">Driver 2</label>
            <select
              value={driver2}
              onChange={(e) => setDriver2(e.target.value)}
              className="w-full bg-gray-800 text-white px-4 py-2 rounded border border-gray-700 focus:border-racing-blue focus:outline-none"
            >
              <option value="">Select driver...</option>
              {drivers.map((driver) => (
                <option
                  key={driver}
                  value={driver}
                  disabled={driver === driver1}
                >
                  Driver #{driver}
                </option>
              ))}
            </select>
          </div>

          {/* Compare Button */}
          <button
            onClick={handleCompare}
            disabled={!driver1 || !driver2 || driver1 === driver2}
            className="w-full bg-racing-red hover:bg-red-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 rounded transition-colors"
          >
            Compare Drivers
          </button>

          <div className="text-xs text-gray-500 text-center">
            Select two different drivers to compare their performance
          </div>
        </div>
      </div>
    </div>
  );
});
