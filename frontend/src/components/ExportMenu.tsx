import { memo, useState } from "react";
import type { LapData } from "../types/race.types";
import {
  exportLapDataToCSV,
  exportTelemetryToCSV,
  exportRaceDataAsJSON,
  exportSummaryStats,
} from "../utils/exportUtils";

interface ExportMenuProps {
  lapData: LapData[];
  telemetry?: any[];
  track: string;
  raceNum: number;
  driver?: string | null;
  currentLap?: number;
}

export const ExportMenu = memo(
  function ExportMenu({
    lapData,
    telemetry,
    track,
    raceNum,
    driver,
    currentLap,
  }: ExportMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [exporting, setExporting] = useState(false);

    const handleExportLapData = async () => {
      setExporting(true);
      try {
        exportLapDataToCSV(lapData, track, raceNum, driver || undefined);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed. Please try again.");
      } finally {
        setExporting(false);
        setIsOpen(false);
      }
    };

    const handleExportTelemetry = async () => {
      if (!telemetry || telemetry.length === 0) {
        alert("No telemetry data available to export");
        return;
      }

      if (!driver || !currentLap) {
        alert("Please select a driver and lap first");
        return;
      }

      setExporting(true);
      try {
        exportTelemetryToCSV(telemetry, track, raceNum, driver, currentLap);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed. Please try again.");
      } finally {
        setExporting(false);
        setIsOpen(false);
      }
    };

    const handleExportJSON = async () => {
      setExporting(true);
      try {
        exportRaceDataAsJSON(lapData, track, raceNum, driver || undefined);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed. Please try again.");
      } finally {
        setExporting(false);
        setIsOpen(false);
      }
    };

    const handleExportSummary = async () => {
      if (!driver) {
        alert("Please select a driver first");
        return;
      }

      setExporting(true);
      try {
        exportSummaryStats(lapData, track, raceNum, driver);
      } catch (error) {
        console.error("Export failed:", error);
        alert("Export failed. Please try again.");
      } finally {
        setExporting(false);
        setIsOpen(false);
      }
    };

    return (
      <div className="relative">
        {/* Export Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2 bg-racing-blue hover:bg-blue-600 text-white rounded-lg transition-colors font-semibold"
          disabled={exporting}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          {exporting ? "Exporting..." : "Export Data"}
        </button>

        {/* Dropdown Menu */}
        {isOpen && !exporting && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            ></div>

            {/* Menu */}
            <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl border border-gray-700 z-20">
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase">
                  Export Options
                </div>

                {/* Lap Data CSV */}
                <button
                  onClick={handleExportLapData}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded transition-colors flex items-start gap-3"
                >
                  <svg
                    className="w-5 h-5 text-green-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Lap Data (CSV)
                    </div>
                    <div className="text-xs text-gray-400">
                      {driver
                        ? `Driver #${driver} lap times`
                        : "All drivers lap times"}
                    </div>
                  </div>
                </button>

                {/* Telemetry CSV */}
                <button
                  onClick={handleExportTelemetry}
                  disabled={!telemetry || telemetry.length === 0 || !driver}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded transition-colors flex items-start gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5 text-blue-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Telemetry Data (CSV)
                    </div>
                    <div className="text-xs text-gray-400">
                      {driver && currentLap
                        ? `Driver #${driver}, Lap ${currentLap}`
                        : "Select driver & lap first"}
                    </div>
                  </div>
                </button>

                {/* JSON Export */}
                <button
                  onClick={handleExportJSON}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded transition-colors flex items-start gap-3"
                >
                  <svg
                    className="w-5 h-5 text-yellow-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Race Data (JSON)
                    </div>
                    <div className="text-xs text-gray-400">
                      Complete race data with metadata
                    </div>
                  </div>
                </button>

                {/* Summary Stats */}
                <button
                  onClick={handleExportSummary}
                  disabled={!driver}
                  className="w-full text-left px-3 py-2 hover:bg-gray-700 rounded transition-colors flex items-start gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg
                    className="w-5 h-5 text-purple-400 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div>
                    <div className="text-sm font-medium text-white">
                      Summary Report (TXT)
                    </div>
                    <div className="text-xs text-gray-400">
                      {driver
                        ? `Statistics for driver #${driver}`
                        : "Select driver first"}
                    </div>
                  </div>
                </button>

                <div className="mt-2 px-3 py-2 text-xs text-gray-500 border-t border-gray-700">
                  💡 Tip: Files include track, race, and date in filename
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.track === nextProps.track &&
      prevProps.raceNum === nextProps.raceNum &&
      prevProps.driver === nextProps.driver &&
      prevProps.currentLap === nextProps.currentLap &&
      prevProps.lapData === nextProps.lapData &&
      prevProps.telemetry === nextProps.telemetry
    );
  }
);
