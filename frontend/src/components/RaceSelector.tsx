import { useState, useEffect } from 'react';
import { raceApi } from '../services/api';
import type { AvailableRaces } from '../types/race.types';
import { useRace } from '../context/RaceContext';

export function RaceSelector() {
  const [races, setRaces] = useState<AvailableRaces | null>(null);
  const [loading, setLoading] = useState(true);
  const { state, dispatch } = useRace();

  useEffect(() => {
    loadRaces();
  }, []);

  const loadRaces = async () => {
    try {
      const data = await raceApi.getAvailableRaces();
      setRaces(data);
    } catch (error) {
      console.error('Failed to load races:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRaceSelect = (track: string, raceNum: number) => {
    dispatch({ type: 'SET_RACE', payload: { track, raceNum } });
  };

  if (loading) {
    return <div className="text-gray-400">Loading races...</div>;
  }

  if (!races) {
    return <div className="text-red-400">Failed to load races</div>;
  }

  return (
    <div className="bg-racing-gray p-4 rounded-lg">
      <h2 className="text-xl font-semibold mb-4">Select Race</h2>
      <div className="space-y-2">
        {Object.entries(races.tracks).map(([track, raceNums]) => (
          <div key={track} className="space-y-1">
            <div className="text-sm font-medium text-gray-300">{track}</div>
            <div className="flex gap-2">
              {raceNums.map((raceNum) => (
                <button
                  key={raceNum}
                  onClick={() => handleRaceSelect(track, raceNum)}
                  className={`px-4 py-2 rounded text-sm transition-colors ${
                    state.track === track && state.raceNum === raceNum
                      ? 'bg-racing-blue text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  Race {raceNum}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      {state.track && state.raceNum && (
        <div className="mt-4 p-3 bg-gray-800 rounded text-sm">
          <span className="text-gray-400">Selected: </span>
          <span className="text-white font-medium">
            {state.track} - Race {state.raceNum}
          </span>
        </div>
      )}
    </div>
  );
}
