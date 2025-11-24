import { memo } from "react";

interface TrackInfoProps {
  track: string;
  raceNum: number;
}

const trackDetails: Record<
  string,
  {
    fullName: string;
    location: string;
    length: string;
    turns: number;
    description: string;
  }
> = {
  barber: {
    fullName: "Barber Motorsports Park",
    location: "Birmingham, Alabama",
    length: "2.38 miles (3.83 km)",
    turns: 17,
    description:
      "A challenging road course with significant elevation changes and technical corners.",
  },
  COTA: {
    fullName: "Circuit of The Americas",
    location: "Austin, Texas",
    length: "3.41 miles (5.49 km)",
    turns: 20,
    description:
      "Modern F1-grade facility with dramatic elevation changes and high-speed sections.",
  },
  "Road America": {
    fullName: "Road America",
    location: "Elkhart Lake, Wisconsin",
    length: "4.05 miles (6.52 km)",
    turns: 14,
    description:
      "One of America's longest and fastest road courses with sweeping corners.",
  },
  Sebring: {
    fullName: "Sebring International Raceway",
    location: "Sebring, Florida",
    length: "3.74 miles (6.02 km)",
    turns: 17,
    description:
      "Historic track known for its bumpy surface and challenging layout.",
  },
  Sonoma: {
    fullName: "Sonoma Raceway",
    location: "Sonoma, California",
    length: "2.52 miles (4.06 km)",
    turns: 12,
    description:
      "Technical road course with significant elevation changes and tight corners.",
  },
  VIR: {
    fullName: "Virginia International Raceway",
    location: "Alton, Virginia",
    length: "3.27 miles (5.26 km)",
    turns: 17,
    description:
      "Fast and flowing circuit with elevation changes and challenging corners.",
  },
};

export const TrackInfo = memo(
  function TrackInfo({ track, raceNum }: TrackInfoProps) {
    const info = trackDetails[track];

    if (!info) {
      return (
        <div className="bg-racing-gray p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Track Information</h3>
          <div className="text-gray-400">Track information not available</div>
        </div>
      );
    }

    return (
      <div className="bg-racing-gray p-6 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Track Information</h3>
          <div className="text-sm text-gray-400">Race {raceNum}</div>
        </div>

        <div className="space-y-4">
          {/* Track Details */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-lg font-bold text-racing-yellow mb-3">
              {info.fullName}
            </h4>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-400">Location</div>
                <div className="text-sm text-white">{info.location}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Track Length</div>
                <div className="text-sm text-white">{info.length}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Number of Turns</div>
                <div className="text-sm text-white">{info.turns}</div>
              </div>
              <div>
                <div className="text-xs text-gray-400">Configuration</div>
                <div className="text-sm text-white">Full Course</div>
              </div>
            </div>

            <div className="border-t border-gray-700 pt-3">
              <div className="text-xs text-gray-400 mb-1">Description</div>
              <div className="text-sm text-gray-300">{info.description}</div>
            </div>
          </div>

          {/* Track Map */}
          <div className="bg-gray-800 p-6 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">
              Track Layout
            </h4>
            <div className="bg-gray-900 rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center p-4">
              <img
                src={`http://localhost:8000/api/maps/${track}`}
                alt={`${info.fullName} Track Map`}
                className="max-w-full max-h-[600px] h-auto rounded"
              />
            </div>
          </div>

          {/* Track Characteristics */}
          <div className="bg-gray-800 p-4 rounded-lg">
            <h4 className="text-sm font-semibold text-gray-400 mb-3">
              Track Characteristics
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gray-900 rounded">
                <div className="text-xs text-gray-400 mb-1">Type</div>
                <div className="text-sm font-semibold text-white">
                  Road Course
                </div>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded">
                <div className="text-xs text-gray-400 mb-1">Direction</div>
                <div className="text-sm font-semibold text-white">
                  Clockwise
                </div>
              </div>
              <div className="text-center p-3 bg-gray-900 rounded">
                <div className="text-xs text-gray-400 mb-1">Surface</div>
                <div className="text-sm font-semibold text-white">Asphalt</div>
              </div>
            </div>
          </div>

          {/* Analysis Tips */}
          <div className="bg-blue-900 bg-opacity-30 border border-blue-700 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <div className="text-sm font-semibold text-blue-300 mb-1">
                  Analysis Tip
                </div>
                <div className="text-xs text-blue-200">
                  Use the telemetry data to identify braking points and
                  acceleration zones. Compare sector times to find areas for
                  improvement.
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
      prevProps.raceNum === nextProps.raceNum
    );
  }
);
