# Frontend Architecture - React Dashboard

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── RaceStatusBar.tsx
│   │   ├── TimingTower.tsx
│   │   ├── TrackMap.tsx
│   │   ├── StrategyPanel.tsx
│   │   ├── PerformanceCharts.tsx
│   │   └── TimelineControl.tsx
│   ├── hooks/
│   │   ├── useRaceData.ts
│   │   ├── useWebSocket.ts
│   │   └── useRaceSimulation.ts
│   ├── services/
│   │   ├── api.ts
│   │   └── websocket.ts
│   ├── types/
│   │   └── race.types.ts
│   ├── utils/
│   │   ├── calculations.ts
│   │   └── formatters.ts
│   ├── App.tsx
│   └── main.tsx
├── package.json
├── tsconfig.json
├── vite.config.ts
└── tailwind.config.js
```

## Core Components

### RaceStatusBar

- Display current lap, elapsed time, flag status
- Show race progress bar
- Indicate selected driver/car

### TimingTower

- Live position list with car numbers
- Gap to leader and gap to car ahead
- Last lap time for each driver
- Color-coded by class if applicable
- Click to select driver for detailed view

### TrackMap

- D3.js-based track outline from GPS data
- Plot car positions in real-time
- Overlay racing line colored by speed (heatmap)
- Show sector boundaries
- Interactive: click car to select, zoom/pan

### StrategyPanel

- Pit stop window recommendation
- Tire degradation estimate
- Fuel consumption projection
- Lap time delta vs. leader
- Predicted finish position

### PerformanceCharts

- Lap time chart with trend line
- Sector time comparison (current vs. best)
- Speed trace overlay
- Throttle/brake trace
- Tabbed interface to switch between views

### TimelineControl

- Scrubber to navigate through race
- Play/pause/speed controls
- Jump to key moments (pit stops, fastest lap, incidents)
- Current lap indicator

## State Management

Use React Context + useReducer for global state:

```typescript
interface RaceState {
  currentLap: number;
  selectedDriver: string | null;
  isPlaying: boolean;
  playbackSpeed: number;
  raceData: RaceData;
  telemetryData: TelemetryData[];
}
```

## Data Flow

1. Initial Load: Fetch race metadata and static data via REST API
2. Real-Time Simulation: WebSocket streams lap-by-lap updates
3. User Interaction: Timeline scrubbing fetches specific lap data
4. Component Updates: React re-renders only affected components

## Key Custom Hooks

### useRaceData

- Fetches initial race data
- Manages caching
- Handles loading and error states

### useWebSocket

- Establishes WebSocket connection
- Listens for real-time updates
- Reconnects on disconnect

### useRaceSimulation

- Controls playback (play/pause/speed)
- Manages current lap state
- Handles timeline scrubbing

## Styling Approach

### TailwindCSS Utilities

- Rapid styling with utility classes
- Consistent spacing and colors
- Responsive design built-in

### Color Palette (Racing Theme)

- Background: Dark gray/black (racing cockpit feel)
- Primary: Red (danger, slow, pit stop)
- Success: Green (fast, optimal, good performance)
- Warning: Yellow (caution, moderate)
- Accent: Blue (selected, interactive)
- Text: White/light gray (high contrast)

### Typography

- Monospace font for timing data (consistent width)
- Sans-serif for labels and descriptions
- Bold for emphasis on key metrics

## Performance Optimizations

### React.memo

- Memoize components that don't need frequent updates
- Prevent unnecessary re-renders

### useMemo and useCallback

- Cache expensive calculations
- Stabilize function references

### Virtual Scrolling

- For timing tower with many drivers
- Only render visible items

### Debouncing

- Timeline scrubbing updates
- Search/filter inputs

## API Integration

### REST Endpoints

- GET /api/races - List available races
- GET /api/races/:id - Race metadata
- GET /api/races/:id/laps - All lap data
- GET /api/races/:id/telemetry/:lap - Telemetry for specific lap
- GET /api/races/:id/strategy - Strategy recommendations

### WebSocket Events

- lap_update: New lap completed
- position_change: Driver position changed
- pit_stop: Pit stop occurred
- flag_change: Race flag status changed

## Development Workflow

1. Start backend API: `cd backend && uvicorn main:app --reload`
2. Start frontend dev server: `cd frontend && npm run dev`
3. Access at http://localhost:5173
4. Hot reload enabled for rapid iteration

## Build and Deployment

```bash
npm run build
```

Outputs optimized static files to `dist/` directory.

Serve with any static file server or integrate with backend.

## Testing Strategy

- Component testing with React Testing Library
- Focus on user interactions (click, hover, input)
- Mock API calls and WebSocket connections
- Visual regression testing for charts (optional)

## Accessibility Considerations

- Semantic HTML elements
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast color scheme
- Screen reader friendly (where practical)

## Browser Compatibility

Target modern browsers:

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

Use Vite's built-in polyfills for broader support if needed.
