# Quick Start Guide for Judges

## 5-Minute Setup & Demo

### Prerequisites

- Python 3.8+ installed
- Node.js 16+ installed
- 5 minutes of your time

### Step 1: Clone Repository (30 seconds)

```bash
git clone [repository-url]
cd HackTheTrack
```

### Step 2: Start Backend (1 minute)

```bash
cd backend
pip install -r requirements.txt
python run.py
```

Backend will start on `http://localhost:8000`

### Step 3: Start Frontend (1 minute)

```bash
# In a new terminal
cd frontend
npm install
npm run dev
```

Frontend will start on `http://localhost:5173`

### Step 4: Open Application (5 seconds)

Open your browser to: `http://localhost:5173`

---

## Feature Walkthrough (3 minutes)

### 1. Select a Race (15 seconds)

- Click on any track (e.g., "COTA")
- Click on "Race 1" or "Race 2"
- Notice the race information panel updates

### 2. View Track Information (15 seconds)

- Scroll down to see track details
- View the official track map (extracted from PDF)
- See track characteristics

### 3. Explore Timing Tower (20 seconds)

- See live driver standings
- Notice position, lap time, and gaps
- Click on any driver to select them

### 4. Analyze Telemetry (30 seconds)

- With a driver selected, scroll to "Telemetry Analysis"
- View speed trace with actual elapsed time
- See driver inputs (throttle/brake)
- Examine G-forces and gear usage
- Check comprehensive statistics

### 5. Compare Lap Times (20 seconds)

- Scroll to "Lap Time Analysis"
- See all drivers' lap times
- Notice trend lines and performance

### 6. Review Strategy (20 seconds)

- Scroll to "Strategy Recommendations"
- See pit stop window suggestions
- View tire degradation estimates
- Read justification for recommendations

### 7. Compare Drivers (30 seconds)

- Click "Compare Drivers" button (top right)
- Select two drivers
- View head-to-head statistics
- See lap-by-lap delta chart

### 8. Export Data (20 seconds)

- Click "Export Data" button (top right)
- Choose format (CSV, JSON, or TXT)
- Download race data for analysis

### 9. Navigate Laps (20 seconds)

- Use arrow keys (← →) to navigate laps
- Use the timeline control at bottom
- Try Home/End keys for first/last lap

---

## Key Features to Evaluate

### Dataset Application (Check These)

- [x] Uses lap data from all 6 tracks
- [x] Processes high-frequency telemetry data
- [x] Integrates race results and standings
- [x] Displays official track maps
- [x] Novel data transformations (sector times, tire degradation)

### Design Quality (Check These)

- [x] Professional F1-style UI
- [x] Responsive and intuitive interface
- [x] Clean data visualizations
- [x] Proper error handling
- [x] Loading states and feedback

### Technical Implementation (Check These)

- [x] Modern tech stack (React + FastAPI)
- [x] Type-safe development (TypeScript)
- [x] Performance optimizations
- [x] Clean architecture
- [x] Comprehensive API

### Impact & Innovation (Check These)

- [x] Addresses multiple categories
- [x] Practical tools for racing teams
- [x] Extensible to other series
- [x] Unique feature combinations
- [x] Export capabilities

---

## Testing Different Tracks

Try these combinations to see variety:

1. **COTA - Race 1**: Large track with 20 turns
2. **Road America - Race 2**: Longest track (4.05 miles)
3. **Barber - Race 1**: Technical course with elevation
4. **Sebring - Race 2**: Historic bumpy track
5. **Sonoma - Race 1**: Tight technical circuit
6. **VIR - Race 2**: Fast flowing layout

---

## Common Questions

### Q: How do I navigate between laps?

**A**: Use arrow keys (← →) or the timeline control at the bottom of the page.

### Q: How do I compare drivers?

**A**: Click "Compare Drivers" button in the top right, then select two drivers.

### Q: How do I export data?

**A**: Click "Export Data" button in the top right, choose your format.

### Q: What if I see errors?

**A**: Ensure both backend (port 8000) and frontend (port 5173) are running.

### Q: How do I see telemetry?

**A**: Select a driver first, then scroll to "Telemetry Analysis" section.

---

## Performance Notes

- **First Load**: May take 2-3 seconds to warm cache
- **Subsequent Loads**: <500ms with 80%+ cache hit rate
- **Telemetry**: 1-2 seconds to load full lap data
- **Track Maps**: Converted from PDF to PNG on-the-fly

---

## Architecture Highlights

### Backend (Python)

- FastAPI for REST API
- Pandas/NumPy for data processing
- Intelligent caching system (256MB)
- PyMuPDF for track map conversion

### Frontend (React + TypeScript)

- 20+ optimized React components
- Plotly.js for interactive charts
- TailwindCSS for styling
- Comprehensive state management

### Data Processing

- Real-time sector time calculations
- Tire degradation modeling
- Strategy window optimization
- Performance metrics computation

---

## Troubleshooting

### Backend won't start

```bash
# Ensure Python 3.8+ is installed
python --version

# Install dependencies
pip install -r requirements.txt

# Run backend
python run.py
```

### Frontend won't start

```bash
# Ensure Node.js 16+ is installed
node --version

# Install dependencies
npm install

# Run frontend
npm run dev
```

### Port conflicts

- Backend uses port 8000
- Frontend uses port 5173
- Ensure these ports are available

---

## What Makes This Special

1. **Comprehensive**: Addresses 3 hackathon categories
2. **Professional**: Production-ready implementation
3. **Practical**: Real tools for racing teams
4. **Innovative**: Unique feature combinations
5. **Complete**: Full-stack with optimizations

---

## Contact

For questions or issues:

- Check README.md for detailed documentation
- Review SUBMISSION_CHECKLIST.md for features
- See STATUS.md for implementation details

---

**Thank you for judging! We hope you enjoy exploring the platform! 🏁**
