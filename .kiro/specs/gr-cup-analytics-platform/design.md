# Design Document

## Overview

The GR Cup Real-Time Analytics Platform is a full-stack web application consisting of a Python FastAPI backend and a React TypeScript frontend. The system processes historical race data from CSV files to simulate real-time race conditions, providing interactive visualizations and strategic insights for drivers and race engineers.

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     User Browser                             │
│  ┌────────────────────────────────────────────────────────┐ │
│  │         React Frontend (localhost:5173)                │ │
│  │  - Dashboard UI                                        │ │
│  │  - Plotly.js Charts                                    │ │
│  │  - D3.js Track Map                                     │ │
│  │  - WebSocket Client                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ HTTP/WebSocket
                          ▼
┌─────────────────────────────────────────────────────────────┐
│         FastAPI Backend (localhost:8000)                     │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  API Layer (REST + WebSocket)                          │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Analytics Layer                                       │ │
│  │  - LapAnalyzer                                         │ │
│  │  - StrategyEngine                                      │ │
│  │  - PerformanceMetrics                                  │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Data Processing Layer                                 │ │
│  │  - DatasetManager                                      │ │
│  │  - DataCleaner                                         │ │
│  │  - DataCache                                           │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ File I/O
                          ▼
┌─────────────────────────────────────────────────────────────┐
│              Local Filesystem                                │
│  dataset/                                                    │
│  ├── barber/*.csv                                            │
│  ├── COTA/Race 1/*.csv                                       │
│  ├── Maps/*.pdf                                              │
│  └── ...                                                     │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack

**Backend:**

- FastAPI - Modern Python web framework
- Uvicorn - ASGI server
- Pandas - Data manipulation
- NumPy - Numerical computations
- SciPy - Statistical analysis

**Frontend:**

- React 18 with TypeScript
- Vite - Build tool and dev server
- Plotly.js - Interactive charts
- D3.js - Custom track visualization
- TailwindCSS - Styling
- Axios - HTTP client

## Components and Interfaces

### Backend Components

#### 1. Data Processing Layer

**DatasetManager**

- Responsibility: Load and index race data from CSV files
- Key Methods:
  - `get_available_races()` - List all tracks and races
  - `load_race_data(track, race_num)` - Load all data for a race
  - `load_lap_data(track, race_num)` - Load lap timing data
  - `load_telemetry_data(track, race_num, lap)` - Load telemetry for specific lap
  - `load_weather_data(track, race_num)` - Load weather conditions

**DataCleaner**

- Responsibility: Clean and validate race data
- Key Methods:
  - `clean_lap_data(df)` - Remove invalid laps, handle missing values
  - `clean_telemetry_data(df)` - Interpolate GPS, validate sensor ranges
  - `detect_pit_laps(df)` - Identify and flag pit stop laps
  - `detect_outliers(df)` - Identify anomalous data points
- Documentation: All cleaning decisions logged to `docs/data_preprocessing_decisions.md`

**DataCache**

- Responsibility: In-memory caching for performance
- Implementation: Python dictionary with LRU eviction
- Cache Keys: `{track}_{race}_{data_type}`
- Max Size: 500MB (configurable)

#### 2. Analytics Layer

**LapAnalyzer**

- Responsibility: Lap time and sector analysis
- Key Methods:
  - `calculate_sector_times(lap_data)` - Extract S1, S2, S3 times
  - `find_best_lap(driver_laps)` - Identify fastest lap
  - `calculate_lap_delta(current, reference)` - Time difference analysis
  - `calculate_consistency_score(laps)` - Standard deviation based metric

**StrategyEngine**

- Responsibility: Pit stop and tire strategy calculations
- Key Methods:
  - `calculate_pit_window(lap_data, current_lap)` - Optimal pit timing
  - `estimate_tire_degradation(lap_times)` - Lap time delta analysis
  - `predict_position_after_pit(current_pos, pit_time)` - Track position forecast
  - `calculate_fuel_consumption(telemetry)` - Fuel usage estimation
- Algorithm: Uses rolling average of lap time deltas to model tire wear

**PerformanceMetrics**

- Responsibility: Driver performance scoring
- Key Methods:
  - `calculate_pace_rating(driver_avg, field_avg)` - Relative pace metric
  - `calculate_improvement_rate(laps)` - Session progress trend
  - `calculate_racing_line_efficiency(telemetry)` - GPS-based analysis
  - `compare_drivers(driver1_data, driver2_data)` - Side-by-side comparison

#### 3. API Layer

**REST Endpoints**

- `GET /api/races` - List available races
- `GET /api/races/{track}/{race_num}` - Race metadata
- `GET /api/races/{track}/{race_num}/laps` - All lap data
- `GET /api/races/{track}/{race_num}/telemetry/{lap}` - Lap telemetry
- `GET /api/races/{track}/{race_num}/strategy` - Strategy recommendations
- `GET /api/races/{track}/{race_num}/drivers` - Driver list
- `GET /api/races/{track}/{race_num}/weather` - Weather data

**WebSocket Events**

- Client → Server: `start_simulation`, `pause_simulation`, `set_speed`, `jump_to_lap`
- Server → Client: `lap_update`, `position_change`, `pit_stop`, `flag_change`

### Frontend Components

#### Core React Components

**App.tsx**

- Root component managing global state
- React Context for race state management
- WebSocket connection initialization

**RaceStatusBar.tsx**

- Props: `currentLap`, `totalLaps`, `elapsedTime`, `flagStatus`
- Displays race progress and status
- Race progress bar visualization

**TimingTower.tsx**

- Props: `drivers`, `selectedDriver`, `onSelectDriver`
- Live leaderboard with positions and gaps
- Virtual scrolling for performance
- Click handler for driver selection

**TrackMap.tsx**

- Props: `trackName`, `telemetryData`, `selectedDriver`, `comparisonDriver`
- D3.js-based track visualization
- Layers:
  1. Base layer: Track map image from dataset/Maps
  2. GPS overlay: Racing lines from telemetry
  3. Car positions: Real-time vehicle locations
  4. Speed heatmap: Color-coded by velocity
- Interactive: Zoom, pan, hover tooltips

**StrategyPanel.tsx**

- Props: `strategyData`, `currentLap`
- Displays pit window recommendations
- Tire degradation visualization
- Fuel consumption estimates
- Predicted track position after pit

**PerformanceCharts.tsx**

- Props: `lapData`, `telemetryData`, `selectedLap`
- Tabbed interface:
  - Lap Times: Line chart with trend
  - Sector Comparison: Bar chart
  - Speed Trace: Area chart
  - Telemetry: Multi-line chart (throttle, brake, steering)
- Plotly.js for interactive charts

**TimelineControl.tsx**

- Props: `currentLap`, `totalLaps`, `keyMoments`, `onSeek`, `onPlayPause`
- Scrubber for race navigation
- Play/pause/speed controls
- Key moment markers (pit stops, fastest laps)
- Current lap indicator

## Data Models

### Backend Data Structures

**RaceMetadata**

```python
@dataclass
class RaceMetadata:
    track: str
    race_number: int
    date: str
    total_laps: int
    drivers: List[str]
    weather_conditions: Dict[str, float]
```

**LapData**

```python
@dataclass
class LapData:
    driver_number: str
    lap_number: int
    lap_time: float
    sector_1: float
    sector_2: float
    sector_3: float
    position: int
    gap_to_leader: float
    gap_to_ahead: float
    is_pit_lap: bool
```

**TelemetryData**

```python
@dataclass
class TelemetryPoint:
    timestamp: float
    lap: int
    distance: float
    speed: float
    gear: int
    throttle: float
    brake_front: float
    brake_rear: float
    steering_angle: float
    gps_lat: float
    gps_long: float
    accel_x: float
    accel_y: float
```

**StrategyRecommendation**

```python
@dataclass
class StrategyRecommendation:
    optimal_pit_lap: int
    pit_window_start: int
    pit_window_end: int
    tire_degradation_percent: float
    predicted_position_after_pit: int
    justification: str
```

### Frontend TypeScript Interfaces

**RaceState**

```typescript
interface RaceState {
  currentLap: number;
  totalLaps: number;
  selectedDriver: string | null;
  comparisonDriver: string | null;
  isPlaying: boolean;
  playbackSpeed: number;
  raceData: RaceData;
  telemetryData: TelemetryData[];
  strategyData: StrategyRecommendation | null;
}
```

**Driver**

```typescript
interface Driver {
  number: string;
  position: number;
  lastLapTime: number;
  gapToLeader: number;
  gapToAhead: number;
  bestLap: number;
  currentLap: number;
}
```

**TelemetryPoint**

```typescript
interface TelemetryPoint {
  timestamp: number;
  distance: number;
  speed: number;
  gear: number;
  throttle: number;
  brakeFront: number;
  brakeRear: number;
  steeringAngle: number;
  gpsLat: number;
  gpsLong: number;
}
```

## Key Algorithms

### 1. Lap Time Analysis Algorithm

**Purpose:** Calculate sector times and identify performance patterns

**Implementation:**

```python
def calculate_sector_times(lap_data: pd.DataFrame) -> pd.DataFrame:
    # Extract sector times from analysis data
    # S1, S2, S3 columns contain sector times
    # Calculate cumulative times and validate consistency

    sector_times = lap_data[['S1_SECONDS', 'S2_SECONDS', 'S3_SECONDS']].copy()

    # Validate: S1 + S2 + S3 should equal lap time (within tolerance)
    calculated_lap_time = sector_times.sum(axis=1)
    actual_lap_time = lap_data['LAP_TIME']

    # Flag inconsistent laps for review
    tolerance = 0.1  # 100ms tolerance
    inconsistent = abs(calculated_lap_time - actual_lap_time) > tolerance

    return sector_times, inconsistent
```

**Justification:** Direct extraction from dataset with validation ensures data integrity

### 2. Tire Degradation Estimation

**Purpose:** Model tire wear based on lap time deltas

**Algorithm:**

```python
def estimate_tire_degradation(lap_times: List[float],
                              pit_laps: List[int]) -> float:
    # Split laps into stints (between pit stops)
    stints = split_by_pit_stops(lap_times, pit_laps)

    degradation_rates = []
    for stint in stints:
        if len(stint) < 3:
            continue

        # Calculate lap-to-lap delta
        deltas = np.diff(stint)

        # Linear regression to find degradation rate
        x = np.arange(len(deltas))
        slope, _ = np.polyfit(x, deltas, 1)

        degradation_rates.append(slope)

    # Average degradation rate across stints
    avg_degradation = np.mean(degradation_rates)

    # Convert to percentage (relative to best lap)
    best_lap = min(lap_times)
    degradation_percent = (avg_degradation / best_lap) * 100

    return degradation_percent
```

**Justification:** Linear regression on lap time deltas captures tire wear trend while filtering out driver errors and traffic effects

### 3. Optimal Pit Window Calculation

**Purpose:** Determine best lap to pit based on tire degradation and track position

**Algorithm:**

```python
def calculate_pit_window(current_lap: int,
                        lap_times: List[float],
                        positions: List[int],
                        pit_loss_time: float = 25.0) -> Tuple[int, int]:
    # Estimate when tire degradation exceeds pit stop time loss
    degradation_rate = estimate_tire_degradation(lap_times, [])

    # Calculate cumulative time loss from tire wear
    cumulative_loss = []
    for lap in range(current_lap, len(lap_times)):
        laps_on_tires = lap - current_lap
        time_loss = laps_on_tires * degradation_rate
        cumulative_loss.append(time_loss)

    # Find when cumulative loss exceeds pit stop time
    pit_window_start = current_lap + np.argmax(
        np.array(cumulative_loss) > pit_loss_time
    )

    # Window extends 3-5 laps for strategic flexibility
    pit_window_end = pit_window_start + 5

    return pit_window_start, pit_window_end
```

**Justification:** Balances tire degradation cost against pit stop time loss to maximize race pace

### 4. Racing Line Generation from GPS

**Purpose:** Create track outline and racing line visualization from telemetry GPS data

**Algorithm:**

```python
def generate_racing_line(telemetry: pd.DataFrame) -> Dict:
    # Extract GPS coordinates
    gps_points = telemetry[['VBOX_Lat_Min', 'VBOX_Long_Minutes']].values

    # Convert to local coordinate system (meters)
    # Use first point as origin
    origin = gps_points[0]
    local_coords = gps_to_local(gps_points, origin)

    # Smooth the line using Savitzky-Golay filter
    from scipy.signal import savgol_filter
    window = 51  # Must be odd
    poly_order = 3

    x_smooth = savgol_filter(local_coords[:, 0], window, poly_order)
    y_smooth = savgol_filter(local_coords[:, 1], window, poly_order)

    # Extract speed for color mapping
    speeds = telemetry['Speed'].values

    return {
        'x': x_smooth,
        'y': y_smooth,
        'speed': speeds,
        'distance': telemetry['Laptrigger_lapdist_dls'].values
    }
```

**Justification:** Smoothing filter removes GPS noise while preserving racing line shape; local coordinate system simplifies visualization

### 5. Consistency Score Calculation

**Purpose:** Quantify driver consistency beyond average lap time

**Algorithm:**

```python
def calculate_consistency_score(lap_times: List[float],
                                pit_laps: List[int]) -> float:
    # Remove pit laps and outliers
    clean_laps = [lt for i, lt in enumerate(lap_times)
                  if i not in pit_laps]

    # Remove outliers using IQR method
    q1, q3 = np.percentile(clean_laps, [25, 75])
    iqr = q3 - q1
    lower_bound = q1 - 1.5 * iqr
    upper_bound = q3 + 1.5 * iqr

    filtered_laps = [lt for lt in clean_laps
                     if lower_bound <= lt <= upper_bound]

    # Calculate standard deviation
    std_dev = np.std(filtered_laps)
    mean_lap = np.mean(filtered_laps)

    # Convert to 0-100 score (lower std = higher score)
    # Normalize by mean to make it relative
    coefficient_of_variation = std_dev / mean_lap

    # Map to 0-100 scale (0.01 CV = 90 score, 0.05 CV = 50 score)
    score = max(0, min(100, 100 - (coefficient_of_variation * 1000)))

    return score
```

**Justification:** Coefficient of variation provides scale-independent consistency metric; outlier removal prevents single bad laps from skewing score

## Data Processing Strategy

### Data Cleaning Decisions

All data cleaning decisions will be documented in `docs/data_preprocessing_decisions.md` with the following structure:

**1. Missing GPS Coordinates**

- Method: Linear interpolation
- Justification: GPS data is continuous and spatial; interpolation maintains racing line accuracy
- Alternative Considered: Forward-fill would create unrealistic position jumps
- Impact: Maintains smooth visualization with estimated <1m position error

**2. Missing Telemetry Values (Speed, Throttle, Brake)**

- Method: Forward-fill for short gaps (<0.5s), drop for longer gaps
- Justification: Sensor values change gradually; forward-fill preserves trends for brief dropouts
- Alternative Considered: Interpolation could create unrealistic values during rapid changes
- Impact: Preserves 99% of telemetry data while avoiding false readings

**3. Invalid Lap Times (lap 32768 error)**

- Method: Exclude from analysis, use timestamp-based lap calculation
- Justification: Lap counter error is known issue; timestamps remain accurate
- Alternative Considered: Could not reliably correct lap numbers
- Impact: All laps retained with corrected lap numbers

**4. Outlier Lap Times**

- Method: Flag but retain laps >3 standard deviations from mean
- Justification: Outliers may represent legitimate incidents (spin, traffic); flagging allows user to investigate
- Alternative Considered: Automatic removal would lose valuable incident data
- Impact: Maintains data completeness while highlighting anomalies

**5. Missing Sector Times**

- Method: Calculate from lap time and available sectors
- Justification: If S1 and S2 exist, S3 = LapTime - S1 - S2
- Alternative Considered: Dropping incomplete laps loses valuable data
- Impact: Recovers sector data for 95% of laps with partial sector times

### Caching Strategy

**In-Memory Cache Structure:**

```python
cache = {
    'barber_1_metadata': RaceMetadata(...),
    'barber_1_laps': pd.DataFrame(...),
    'barber_1_telemetry_lap_5': pd.DataFrame(...),
    # ... more entries
}
```

**Cache Eviction Policy:**

- LRU (Least Recently Used)
- Max size: 500MB
- Priority: Metadata > Lap Data > Telemetry (telemetry evicted first)

**Cache Warming:**

- On startup, load metadata for all races
- Pre-load lap data for most recent race
- Telemetry loaded on-demand only

## Error Handling

### Backend Error Handling

**File Not Found:**

```python
try:
    df = pd.read_csv(file_path)
except FileNotFoundError:
    logger.error(f"Race data not found: {file_path}")
    raise HTTPException(status_code=404,
                       detail=f"Race data not available for {track} Race {race_num}")
```

**Data Validation Errors:**

```python
def validate_lap_data(df: pd.DataFrame) -> pd.DataFrame:
    required_columns = ['LAP_NUMBER', 'LAP_TIME', 'DRIVER_NUMBER']
    missing = [col for col in required_columns if col not in df.columns]

    if missing:
        raise ValueError(f"Missing required columns: {missing}")

    return df
```

**WebSocket Connection Errors:**

```python
async def handle_websocket_error(websocket: WebSocket, error: Exception):
    logger.error(f"WebSocket error: {error}")
    await websocket.send_json({
        'type': 'error',
        'message': str(error)
    })
    await websocket.close()
```

### Frontend Error Handling

**API Request Failures:**

```typescript
async function fetchRaceData(track: string, raceNum: number) {
  try {
    const response = await axios.get(`/api/races/${track}/${raceNum}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      showNotification("Race data not found", "error");
    } else {
      showNotification("Failed to load race data", "error");
    }
    throw error;
  }
}
```

**WebSocket Disconnection:**

```typescript
useEffect(() => {
  const ws = new WebSocket("ws://localhost:8000/ws");

  ws.onclose = () => {
    showNotification("Connection lost. Reconnecting...", "warning");
    setTimeout(() => connectWebSocket(), 3000);
  };

  ws.onerror = (error) => {
    console.error("WebSocket error:", error);
    showNotification("Real-time updates unavailable", "error");
  };
}, []);
```

**Missing Data Handling:**

```typescript
function renderTelemetry(data: TelemetryPoint[] | null) {
  if (!data || data.length === 0) {
    return <EmptyState message="No telemetry data available for this lap" />;
  }

  return <TelemetryChart data={data} />;
}
```

## Testing Strategy

### Backend Testing

**Unit Tests:**

- Test data cleaning functions with known inputs
- Test algorithm outputs (lap analysis, strategy calculations)
- Test data validation logic
- Mock file I/O for consistent test environment

**Integration Tests:**

- Test API endpoints with sample data
- Test WebSocket message flow
- Test caching behavior
- Test error handling paths

**Example Test:**

```python
def test_calculate_sector_times():
    # Arrange
    lap_data = pd.DataFrame({
        'S1_SECONDS': [25.5, 25.3],
        'S2_SECONDS': [30.2, 30.1],
        'S3_SECONDS': [28.8, 28.7],
        'LAP_TIME': [84.5, 84.1]
    })

    # Act
    sector_times, inconsistent = calculate_sector_times(lap_data)

    # Assert
    assert len(sector_times) == 2
    assert not inconsistent.any()
```

### Frontend Testing

**Component Tests:**

- Test component rendering with mock data
- Test user interactions (clicks, hovers)
- Test state updates
- Mock API calls and WebSocket connections

**Example Test:**

```typescript
describe("TimingTower", () => {
  it("should highlight selected driver", () => {
    const drivers = [
      { number: "42", position: 1, lastLapTime: 84.5 },
      { number: "17", position: 2, lastLapTime: 84.8 },
    ];

    const { getByText } = render(
      <TimingTower drivers={drivers} selectedDriver="42" />
    );

    const driver42 = getByText("42").closest("div");
    expect(driver42).toHaveClass("selected");
  });
});
```

**Manual Testing Focus:**

- Visual appearance and layout
- Chart interactivity and responsiveness
- Real-time update smoothness
- Track map visualization accuracy
- Timeline scrubbing performance

## Performance Considerations

### Backend Optimization

**Vectorized Operations:**

```python
# Instead of loops
lap_deltas = []
for i in range(1, len(lap_times)):
    lap_deltas.append(lap_times[i] - lap_times[i-1])

# Use vectorized operations
lap_deltas = np.diff(lap_times)
```

**Lazy Loading:**

- Load telemetry only when requested
- Filter by lap before loading into memory
- Use pandas chunking for large files

**Efficient Data Structures:**

- Use numpy arrays for numerical computations
- Use pandas DataFrames for tabular data
- Convert to native Python types only for JSON serialization

### Frontend Optimization

**React.memo for Expensive Components:**

```typescript
export const TrackMap = React.memo(
  ({ telemetryData, selectedDriver }) => {
    // Expensive D3 rendering
  },
  (prevProps, nextProps) => {
    return (
      prevProps.selectedDriver === nextProps.selectedDriver &&
      prevProps.telemetryData === nextProps.telemetryData
    );
  }
);
```

**useMemo for Calculations:**

```typescript
const sectorAnalysis = useMemo(() => {
  return calculateSectorStats(lapData);
}, [lapData]);
```

**Debounced Timeline Scrubbing:**

```typescript
const debouncedSeek = useMemo(
  () =>
    debounce((lap: number) => {
      fetchLapData(lap);
    }, 100),
  []
);
```

## Deployment and Setup

### Development Environment Setup

**Backend Setup:**

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000
```

**Frontend Setup:**

```bash
cd frontend
npm install
npm run dev
```

**Combined Startup Script:**

```bash
# start.sh (Linux/Mac) or start.bat (Windows)
#!/bin/bash
cd backend && uvicorn src.api.main:app --reload &
cd frontend && npm run dev &
wait
```

### Production Build

**Backend:**

- No build step required
- Run with: `uvicorn src.api.main:app --host 0.0.0.0 --port 8000`

**Frontend:**

```bash
cd frontend
npm run build
# Output: frontend/dist/
```

**Serve Frontend:**

- Option 1: Serve dist/ with any static file server
- Option 2: Serve from FastAPI backend

### Configuration Files

**backend/requirements.txt:**

```
fastapi==0.104.1
uvicorn[standard]==0.24.0
pandas==2.1.3
numpy==1.26.2
scipy==1.11.4
python-multipart==0.0.6
websockets==12.0
```

**frontend/package.json:**

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "plotly.js": "^2.27.0",
    "d3": "^7.8.5",
    "axios": "^1.6.2"
  },
  "devDependencies": {
    "@types/react": "^18.2.43",
    "@types/react-dom": "^18.2.17",
    "typescript": "^5.3.3",
    "vite": "^5.0.8",
    "tailwindcss": "^3.3.6"
  }
}
```

## Security Considerations

**CORS Configuration:**

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Input Validation:**

- Validate track names against known list
- Validate race numbers (1-2)
- Validate lap numbers against race total
- Sanitize file paths to prevent directory traversal

**Rate Limiting:**

- Not required for local deployment
- Consider for public deployment

## Track Map Integration

### Track Map Display Strategy

**Implementation Approach:**

1. Load track map PDF/image from `dataset/Maps/` folder
2. Convert PDF to image if necessary (using pdf2image library)
3. Display as base layer in D3.js SVG
4. Calibrate GPS coordinates to map image coordinates
5. Overlay racing lines on top of map

**Coordinate Calibration:**

```python
def calibrate_gps_to_map(gps_points: np.ndarray,
                         map_bounds: Dict) -> np.ndarray:
    # Map bounds from track map image
    # Format: {'lat_min': x, 'lat_max': y, 'long_min': z, 'long_max': w}

    # Normalize GPS to 0-1 range
    lat_norm = (gps_points[:, 0] - map_bounds['lat_min']) / \
               (map_bounds['lat_max'] - map_bounds['lat_min'])
    long_norm = (gps_points[:, 1] - map_bounds['long_min']) / \
                (map_bounds['long_max'] - map_bounds['long_min'])

    # Scale to map image dimensions
    map_width = 1000  # pixels
    map_height = 800  # pixels

    x_coords = long_norm * map_width
    y_coords = (1 - lat_norm) * map_height  # Invert Y for screen coords

    return np.column_stack([x_coords, y_coords])
```

**D3.js Track Map Component:**

```typescript
function TrackMap({ trackName, telemetryData }) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);

    // Load track map image
    svg
      .append("image")
      .attr("href", `/maps/${trackName}.png`)
      .attr("width", 1000)
      .attr("height", 800);

    // Overlay racing line
    const line = d3
      .line()
      .x((d) => d.x)
      .y((d) => d.y)
      .curve(d3.curveCatmullRom);

    // Color scale for speed
    const colorScale = d3
      .scaleSequential(d3.interpolateRdYlGn)
      .domain([minSpeed, maxSpeed]);

    // Draw racing line segments colored by speed
    svg
      .selectAll(".racing-line")
      .data(telemetryData)
      .enter()
      .append("circle")
      .attr("cx", (d) => d.x)
      .attr("cy", (d) => d.y)
      .attr("r", 2)
      .attr("fill", (d) => colorScale(d.speed));
  }, [trackName, telemetryData]);

  return <svg ref={svgRef} width={1000} height={800} />;
}
```

## Real-Time Simulation Implementation

### WebSocket Message Flow

**Client Initiates Simulation:**

```typescript
ws.send(
  JSON.stringify({
    type: "start_simulation",
    track: "barber",
    race: 1,
    speed: 2, // 2x playback speed
  })
);
```

**Server Streams Lap Updates:**

```python
async def simulate_race(websocket: WebSocket, track: str, race: int, speed: int):
    lap_data = load_lap_data(track, race)

    for lap in range(1, max_lap + 1):
        # Get all drivers' data for this lap
        lap_info = lap_data[lap_data['LAP_NUMBER'] == lap]

        # Send update
        await websocket.send_json({
            'type': 'lap_update',
            'lap': lap,
            'drivers': lap_info.to_dict('records')
        })

        # Wait based on playback speed
        await asyncio.sleep(2.0 / speed)  # 2 seconds per lap at 1x
```

**Client Updates UI:**

```typescript
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);

  if (message.type === "lap_update") {
    dispatch({
      type: "UPDATE_LAP",
      payload: {
        currentLap: message.lap,
        drivers: message.drivers,
      },
    });
  }
};
```

## Summary

This design provides a comprehensive blueprint for implementing the GR Cup Real-Time Analytics Platform. Key design decisions include:

1. **Local-first architecture** - All data processing happens locally without external dependencies
2. **Efficient data handling** - Lazy loading and caching minimize memory usage
3. **Documented data cleaning** - All preprocessing decisions justified and logged
4. **Modern tech stack** - FastAPI + React provides responsive, professional UI
5. **Track map integration** - Official maps with GPS overlay for context
6. **Real-time simulation** - WebSocket streaming creates engaging live experience
7. **Comprehensive analytics** - Lap analysis, strategy, and performance metrics
8. **Extensible design** - Modular components allow easy feature additions

The design balances hackathon time constraints with production-quality architecture, ensuring a polished demo while maintaining code quality.
