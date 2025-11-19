import { RaceProvider } from "./context/RaceContext";
import { Dashboard } from "./components/Dashboard";
import { ErrorBoundary } from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <RaceProvider>
        <Dashboard />
      </RaceProvider>
    </ErrorBoundary>
  );
}

export default App;
