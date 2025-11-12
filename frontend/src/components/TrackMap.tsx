import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { raceApi } from "../services/api";
import type { TelemetryPoint } from "../types/race.types";

interface TrackMapProps {
  track: string;
  raceNum: number;
  selectedDriver?: string | null;
  currentLap?: number;
}

export function TrackMap({
  track,
  raceNum,
  selectedDriver,
  currentLap = 1,
}: TrackMapProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [telemetry, setTelemetry] = useState<TelemetryPoint[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (selectedDriver && currentLap) {
      // Debounce telemetry loading when sliding through laps
      const timer = setTimeout(() => {
        loadTelemetry();
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [track, raceNum, selectedDriver, currentLap]);

  const loadTelemetry = async () => {
    if (!selectedDriver) return;

    try {
      setLoading(true);
      const data = await raceApi.getTelemetry(track, raceNum, currentLap, 20); // Increase sampling for faster load
      setTelemetry(data);
    } catch (error) {
      console.error("Failed to load telemetry:", error);
      setTelemetry([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!telemetry.length || !svgRef.current) return;

    drawTrackMap();
  }, [telemetry]);

  const drawTrackMap = () => {
    if (!svgRef.current || !telemetry.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const width = 800;
    const height = 600;
    const margin = { top: 40, right: 20, bottom: 40, left: 20 };

    // Extract coordinates - check all possible column name variations
    const lats = telemetry
      .map((d: any) => {
        return d.VBOX_Lat_Min || d["VBOX_Lat_Min"] || d.vbox_lat_min || 0;
      })
      .filter((v: number) => v !== 0);

    const longs = telemetry
      .map((d: any) => {
        return (
          d.VBOX_Long_Minutes ||
          d["VBOX_Long_Minutes"] ||
          d.vbox_long_minutes ||
          0
        );
      })
      .filter((v: number) => v !== 0);

    const speeds = telemetry
      .map((d: any) => {
        return d.Speed || d.speed || 0;
      })
      .filter((v: number) => v !== 0);

    console.log("Track Map Data:", {
      totalPoints: telemetry.length,
      validLats: lats.length,
      validLongs: longs.length,
      validSpeeds: speeds.length,
      samplePoint: telemetry[0],
    });

    // If no valid GPS data, show message
    if (lats.length === 0 || longs.length === 0) {
      svg
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .attr("fill", "#9ca3af")
        .style("font-size", "16px")
        .text("No GPS data available for this lap");
      return;
    }

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([d3.min(longs) || 0, d3.max(longs) || 1])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([d3.min(lats) || 0, d3.max(lats) || 1])
      .range([height - margin.bottom, margin.top]);

    // Color scale for speed
    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([d3.min(speeds) || 0, d3.max(speeds) || 200]);

    // Create line generator
    const line = d3
      .line<any>()
      .x((d) => xScale(d.VBOX_Long_Minutes || d["VBOX_Long_Minutes"] || 0))
      .y((d) => yScale(d.VBOX_Lat_Min || d["VBOX_Lat_Min"] || 0))
      .curve(d3.curveCatmullRom);

    // Draw track outline
    svg
      .append("path")
      .datum(telemetry)
      .attr("d", line)
      .attr("fill", "none")
      .attr("stroke", "#374151")
      .attr("stroke-width", 8)
      .attr("stroke-linecap", "round");

    // Draw speed-colored racing line
    for (let i = 0; i < telemetry.length - 1; i++) {
      const point1: any = telemetry[i];
      const point2: any = telemetry[i + 1];

      const long1 =
        point1.VBOX_Long_Minutes || point1["VBOX_Long_Minutes"] || 0;
      const lat1 = point1.VBOX_Lat_Min || point1["VBOX_Lat_Min"] || 0;
      const long2 =
        point2.VBOX_Long_Minutes || point2["VBOX_Long_Minutes"] || 0;
      const lat2 = point2.VBOX_Lat_Min || point2["VBOX_Lat_Min"] || 0;
      const speed1 = point1.Speed || point1.speed || 0;

      svg
        .append("line")
        .attr("x1", xScale(long1))
        .attr("y1", yScale(lat1))
        .attr("x2", xScale(long2))
        .attr("y2", yScale(lat2))
        .attr("stroke", colorScale(speed1))
        .attr("stroke-width", 4)
        .attr("stroke-linecap", "round");
    }

    // Add speed legend
    const legendWidth = 200;
    const legendHeight = 20;
    const legendX = width - legendWidth - margin.right - 20;
    const legendY = margin.top;

    const legendScale = d3
      .scaleLinear()
      .domain([d3.min(speeds) || 0, d3.max(speeds) || 200])
      .range([0, legendWidth]);

    const legendAxis = d3
      .axisBottom(legendScale)
      .ticks(5)
      .tickFormat((d) => `${d} km/h`);

    // Create gradient for legend
    const defs = svg.append("defs");
    const gradient = defs
      .append("linearGradient")
      .attr("id", "speed-gradient")
      .attr("x1", "0%")
      .attr("x2", "100%");

    gradient
      .selectAll("stop")
      .data(
        d3.range(0, 1.1, 0.1).map((t) => ({
          offset: `${t * 100}%`,
          color: colorScale(
            (d3.min(speeds) || 0) +
              t * ((d3.max(speeds) || 200) - (d3.min(speeds) || 0))
          ),
        }))
      )
      .enter()
      .append("stop")
      .attr("offset", (d) => d.offset)
      .attr("stop-color", (d) => d.color);

    // Draw legend rectangle
    svg
      .append("rect")
      .attr("x", legendX)
      .attr("y", legendY)
      .attr("width", legendWidth)
      .attr("height", legendHeight)
      .style("fill", "url(#speed-gradient)");

    // Draw legend axis
    svg
      .append("g")
      .attr("transform", `translate(${legendX}, ${legendY + legendHeight})`)
      .call(legendAxis)
      .attr("color", "#9ca3af")
      .selectAll("text")
      .attr("fill", "#9ca3af")
      .style("font-size", "10px");

    // Add title
    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top / 2)
      .attr("text-anchor", "middle")
      .attr("fill", "#ffffff")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${track} - Lap ${currentLap} - Driver #${selectedDriver}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-racing-gray rounded-lg">
        <div className="text-gray-400">Loading track map...</div>
      </div>
    );
  }

  if (!selectedDriver) {
    return (
      <div className="flex items-center justify-center h-96 bg-racing-gray rounded-lg">
        <div className="text-gray-400">Select a driver to view track map</div>
      </div>
    );
  }

  if (!telemetry.length) {
    return (
      <div className="flex items-center justify-center h-96 bg-racing-gray rounded-lg">
        <div className="text-gray-400">
          No telemetry data available for this lap
        </div>
      </div>
    );
  }

  return (
    <div className="bg-racing-gray p-6 rounded-lg">
      <svg
        ref={svgRef}
        width="100%"
        height="600"
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid meet"
      />
    </div>
  );
}
