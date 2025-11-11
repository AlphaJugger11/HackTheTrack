import { useState, useEffect } from 'react'
import { raceApi } from './services/api'
import type { AvailableRaces } from './types/race.types'

function App() {
  const [races, setRaces] = useState<AvailableRaces | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadRaces()
  }, [])

  const loadRaces = async () => {
    try {
      setLoading(true)
      const data = await raceApi.getAvailableRaces()
      setRaces(data)
      setError(null)
    } catch (err) {
      setError('Failed to load races. Make sure backend is running.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-racing-dark text-white">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-4">GR Cup Analytics Platform</h1>
        <p className="text-gray-400">Real-time race analytics and strategy platform</p>
        
        <div className="mt-8 p-6 bg-racing-gray rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Backend Connection</h2>
          
          {loading && <p className="text-yellow-400">Loading races...</p>}
          
          {error && (
            <div className="text-red-400">
              <p>{error}</p>
              <button 
                onClick={loadRaces}
                className="mt-2 px-4 py-2 bg-racing-blue rounded hover:bg-blue-600"
              >
                Retry
              </button>
            </div>
          )}
          
          {races && (
            <div>
              <p className="text-green-400 mb-4">Connected to backend!</p>
              <div className="space-y-2">
                <p className="text-gray-300">Available Tracks: {Object.keys(races.tracks).length}</p>
                <p className="text-gray-300">Total Races: {races.total_races}</p>
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Tracks:</h3>
                  <ul className="list-disc list-inside text-gray-400">
                    {Object.entries(races.tracks).map(([track, raceNums]) => (
                      <li key={track}>
                        {track}: {raceNums.length} races
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 p-4 bg-racing-gray rounded-lg text-sm text-gray-400">
          <p>Frontend: http://localhost:5173</p>
          <p>Backend: http://localhost:8000</p>
          <p>Status: Services initialized and ready</p>
        </div>
      </div>
    </div>
  )
}

export default App
