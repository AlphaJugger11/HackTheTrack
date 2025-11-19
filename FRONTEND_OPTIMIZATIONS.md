# Frontend Performance Optimizations

## Quick Wins (Copy-Paste Ready)

### 1. Add React.memo to Charts

```typescript
// In LapTimeChart.tsx
import React from "react";

export const LapTimeChart = React.memo(
  ({ lapData, selectedDriver }) => {
    // ... existing code
  },
  (prevProps, nextProps) => {
    return (
      prevProps.selectedDriver === nextProps.selectedDriver &&
      prevProps.lapData === nextProps.lapData
    );
  }
);

// In SectorComparisonChart.tsx
export const SectorComparisonChart = React.memo(
  ({ track, raceNum, driver }) => {
    // ... existing code
  },
  (prevProps, nextProps) => {
    return (
      prevProps.track === nextProps.track &&
      prevProps.raceNum === nextProps.raceNum &&
      prevProps.driver === nextProps.driver
    );
  }
);

// In TelemetryDashboard.tsx
export const TelemetryDashboard = React.memo(
  ({ track, raceNum, driver, currentLap }) => {
    // ... existing code
  },
  (prevProps, nextProps) => {
    return (
      prevProps.track === nextProps.track &&
      prevProps.raceNum === nextProps.raceNum &&
      prevProps.driver === nextProps.driver &&
      prevProps.currentLap === nextProps.currentLap
    );
  }
);
```

### 2. Add useMemo for Calculations

```typescript
// In Dashboard.tsx
import { useMemo } from "react";

// Replace this:
const maxLap = Math.max(...lapData.map((l) => l.LAP_NUMBER || 0));

// With this:
const maxLap = useMemo(() => {
  if (lapData.length === 0) return 0;
  return Math.max(...lapData.map((l) => l.LAP_NUMBER || 0));
}, [lapData]);

// For driver list
const uniqueDrivers = useMemo(() => {
  return [...new Set(lapData.map((l) => l.NUMBER))];
}, [lapData]);
```

### 3. Add Loading Skeletons

```typescript
// Create LoadingSkeleton.tsx
export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="h-8 bg-gray-700 rounded w-1/4"></div>
      <div className="h-64 bg-gray-700 rounded"></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="h-32 bg-gray-700 rounded"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
        <div className="h-32 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}

// Use in Dashboard.tsx
{
  loading ? <LoadingSkeleton /> : <LapTimeChart data={lapData} />;
}
```

### 4. Add Error Boundary

```typescript
// Create ErrorBoundary.tsx
import React, { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="bg-red-900 text-white p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-2">Something went wrong</h2>
            <p className="text-sm text-gray-300 mb-4">
              {this.state.error?.message || "An unexpected error occurred"}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-700 hover:bg-red-600 rounded"
            >
              Reload Page
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

// Use in App.tsx
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
```

### 5. Debounce Race Data Loading

```typescript
// In Dashboard.tsx
import { useCallback, useEffect, useRef } from "react";

const loadRaceData = useCallback(async () => {
  if (!state.track || !state.raceNum) return;

  try {
    setLoading(true);
    const [laps, driverList] = await Promise.all([
      raceApi.getLapData(state.track, state.raceNum),
      raceApi.getDrivers(state.track, state.raceNum),
    ]);

    setLapData(laps);
    setDrivers(driverList);
  } catch (error) {
    console.error("Failed to load race data:", error);
  } finally {
    setLoading(false);
  }
}, [state.track, state.raceNum]);

// Debounce the loading
const timeoutRef = useRef<NodeJS.Timeout>();

useEffect(() => {
  if (timeoutRef.current) {
    clearTimeout(timeoutRef.current);
  }

  timeoutRef.current = setTimeout(() => {
    loadRaceData();
  }, 300);

  return () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };
}, [loadRaceData]);
```

### 6. Add Keyboard Shortcuts

```typescript
// In Dashboard.tsx
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (!state.selectedDriver) return;

    const maxLap = Math.max(...lapData.map((l) => l.LAP_NUMBER || 0));

    switch (e.key) {
      case "ArrowLeft":
        if (state.currentLap > 1) {
          dispatch({ type: "SET_CURRENT_LAP", payload: state.currentLap - 1 });
        }
        break;
      case "ArrowRight":
        if (state.currentLap < maxLap) {
          dispatch({ type: "SET_CURRENT_LAP", payload: state.currentLap + 1 });
        }
        break;
      case "Home":
        dispatch({ type: "SET_CURRENT_LAP", payload: 1 });
        break;
      case "End":
        dispatch({ type: "SET_CURRENT_LAP", payload: maxLap });
        break;
    }
  };

  window.addEventListener("keydown", handleKeyPress);
  return () => window.removeEventListener("keydown", handleKeyPress);
}, [state.selectedDriver, state.currentLap, lapData, dispatch]);
```

### 7. Add Tooltips

```typescript
// Create Tooltip.tsx
import { ReactNode, useState } from "react";

interface TooltipProps {
  content: string;
  children: ReactNode;
}

export function Tooltip({ content, children }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-10 px-3 py-2 text-sm text-white bg-gray-900 rounded-lg shadow-lg -top-10 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {content}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
}

// Use in Dashboard.tsx
<Tooltip content="Select a driver to view detailed analytics">
  <div className="text-gray-400">Drivers</div>
</Tooltip>;
```

## Performance Checklist

- [ ] Add React.memo to all chart components
- [ ] Add useMemo for expensive calculations
- [ ] Add loading skeletons
- [ ] Add error boundaries
- [ ] Debounce API calls
- [ ] Add keyboard shortcuts
- [ ] Add tooltips for better UX
- [ ] Lazy load components with React.lazy()
- [ ] Add virtual scrolling for large lists
- [ ] Optimize Plotly.js config (disable animations for large datasets)

## Plotly.js Optimization

```typescript
// In chart components
const config = {
  responsive: true,
  displayModeBar: false, // Hide toolbar for cleaner look
  staticPlot: false, // Allow interactions
};

const layout = {
  ...existingLayout,
  hovermode: "closest",
  dragmode: false, // Disable drag for better performance
  // Disable animations for large datasets
  transition: { duration: 0 },
};
```

## Bundle Size Optimization

```typescript
// In vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          plotly: ["plotly.js"],
          vendor: ["react", "react-dom"],
        },
      },
    },
  },
});
```

## Estimated Impact

- React.memo: 30-50% reduction in re-renders
- useMemo: 20-30% faster calculations
- Debouncing: 50% fewer API calls
- Loading skeletons: Better perceived performance
- Error boundaries: Prevent full app crashes

Apply these optimizations incrementally and test after each change!
