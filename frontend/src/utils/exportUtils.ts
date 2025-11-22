import type { LapData } from "../types/race.types";

/**
 * Export lap data to CSV format
 */
export function exportLapDataToCSV(
  lapData: LapData[],
  track: string,
  raceNum: number,
  driver?: string
): void {
  if (lapData.length === 0) {
    alert("No lap data to export");
    return;
  }

  // Filter by driver if specified
  const dataToExport = driver
    ? lapData.filter((lap) => String(lap.NUMBER) === driver)
    : lapData;

  if (dataToExport.length === 0) {
    alert("No data found for selected driver");
    return;
  }

  // Get all unique column names
  const columns = Array.from(
    new Set(dataToExport.flatMap((lap) => Object.keys(lap)))
  );

  // Create CSV header
  const header = columns.join(",");

  // Create CSV rows
  const rows = dataToExport.map((lap) => {
    return columns
      .map((col) => {
        const value = lap[col as keyof LapData];
        // Handle values with commas or quotes
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      })
      .join(",");
  });

  // Combine header and rows
  const csv = [header, ...rows].join("\n");

  // Create filename
  const driverSuffix = driver ? `_driver${driver}` : "_all_drivers";
  const filename = `${track}_race${raceNum}${driverSuffix}_laps_${new Date().toISOString().split("T")[0]}.csv`;

  // Download file
  downloadFile(csv, filename, "text/csv");
}

/**
 * Export telemetry data to CSV format
 */
export function exportTelemetryToCSV(
  telemetry: any[],
  track: string,
  raceNum: number,
  driver: string,
  lap: number
): void {
  if (telemetry.length === 0) {
    alert("No telemetry data to export");
    return;
  }

  // Get all unique column names
  const columns = Array.from(
    new Set(telemetry.flatMap((point) => Object.keys(point)))
  );

  // Create CSV header
  const header = columns.join(",");

  // Create CSV rows
  const rows = telemetry.map((point) => {
    return columns
      .map((col) => {
        const value = point[col];
        if (
          typeof value === "string" &&
          (value.includes(",") || value.includes('"'))
        ) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value ?? "";
      })
      .join(",");
  });

  // Combine header and rows
  const csv = [header, ...rows].join("\n");

  // Create filename
  const filename = `${track}_race${raceNum}_driver${driver}_lap${lap}_telemetry_${new Date().toISOString().split("T")[0]}.csv`;

  // Download file
  downloadFile(csv, filename, "text/csv");
}

/**
 * Export chart as PNG image using Plotly
 */
export function exportChartAsPNG(
  chartId: string,
  filename: string
): Promise<void> {
  return new Promise((resolve, reject) => {
    // Find the Plotly chart element
    const chartElement = document.querySelector(`[data-chart-id="${chartId}"]`);

    if (!chartElement) {
      alert("Chart not found");
      reject(new Error("Chart not found"));
      return;
    }

    // Use Plotly's built-in export functionality
    // @ts-ignore - Plotly is loaded globally
    if (window.Plotly) {
      // @ts-ignore
      window.Plotly.downloadImage(chartElement, {
        format: "png",
        width: 1200,
        height: 800,
        filename: filename,
      })
        .then(() => resolve())
        .catch((error: Error) => {
          console.error("Failed to export chart:", error);
          alert("Failed to export chart. Please try again.");
          reject(error);
        });
    } else {
      alert("Plotly not loaded");
      reject(new Error("Plotly not loaded"));
    }
  });
}

/**
 * Export all race data as JSON
 */
export function exportRaceDataAsJSON(
  lapData: LapData[],
  track: string,
  raceNum: number,
  driver?: string
): void {
  const dataToExport = driver
    ? lapData.filter((lap) => String(lap.NUMBER) === driver)
    : lapData;

  if (dataToExport.length === 0) {
    alert("No data to export");
    return;
  }

  const exportData = {
    metadata: {
      track,
      raceNum,
      driver: driver || "all",
      exportDate: new Date().toISOString(),
      totalLaps: dataToExport.length,
    },
    data: dataToExport,
  };

  const json = JSON.stringify(exportData, null, 2);

  const driverSuffix = driver ? `_driver${driver}` : "_all_drivers";
  const filename = `${track}_race${raceNum}${driverSuffix}_data_${new Date().toISOString().split("T")[0]}.json`;

  downloadFile(json, filename, "application/json");
}

/**
 * Helper function to trigger file download
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export summary statistics as text file
 */
export function exportSummaryStats(
  lapData: LapData[],
  track: string,
  raceNum: number,
  driver: string
): void {
  const driverLaps = lapData.filter((lap) => String(lap.NUMBER) === driver);

  if (driverLaps.length === 0) {
    alert("No data for selected driver");
    return;
  }

  // Calculate statistics
  const lapTimes = driverLaps
    .map((lap) => lap.LAP_TIME)
    .filter((time) => time && time > 0);

  const bestLap = Math.min(...lapTimes);
  const avgLap =
    lapTimes.reduce((sum, time) => sum + time, 0) / lapTimes.length;
  const worstLap = Math.max(...lapTimes);

  const summary = `
GR Cup Analytics - Race Summary
================================

Track: ${track}
Race: ${raceNum}
Driver: #${driver}
Export Date: ${new Date().toLocaleString()}

Lap Statistics
--------------
Total Laps: ${driverLaps.length}
Best Lap: ${bestLap.toFixed(3)}s
Average Lap: ${avgLap.toFixed(3)}s
Worst Lap: ${worstLap.toFixed(3)}s
Consistency: ${((1 - (worstLap - bestLap) / avgLap) * 100).toFixed(1)}%

Lap Times
---------
${driverLaps
  .map(
    (lap, i) =>
      `Lap ${lap.LAP_NUMBER}: ${lap.LAP_TIME?.toFixed(3)}s${lap.is_pit_lap ? " (PIT)" : ""}`
  )
  .join("\n")}

Generated by GR Cup Analytics Platform
`;

  const filename = `${track}_race${raceNum}_driver${driver}_summary_${new Date().toISOString().split("T")[0]}.txt`;

  downloadFile(summary, filename, "text/plain");
}
