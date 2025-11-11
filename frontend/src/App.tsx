import { RaceProvider } from './context/RaceContext'
import { Dashboard } from './components/Dashboard'

function App() {
  return (
    <RaceProvider>
      <Dashboard />
    </RaceProvider>
  )
}

export default App
