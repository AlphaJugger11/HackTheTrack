# 🚀 Local Setup Guide - GR Cup Analytics Platform

Complete guide to running the project on your local machine.

---

## 📋 Prerequisites

Before you begin, ensure you have:

- **Python 3.8+** (Check: `python --version`)
- **Node.js 16+** (Check: `node --version`)
- **npm or yarn** (Check: `npm --version`)
- **Git** (Check: `git --version`)
- **8GB+ RAM** recommended for optimal performance

---

## 📁 Dataset Structure

### Required Directory Structure

The project expects the dataset in this exact structure:

```
Hack the Track/
└── dataset/
    ├── barber/
    │   ├── 2024_barber_Race1.csv
    │   └── 2024_barber_Race2.csv
    ├── COTA/
    │   ├── 2024_COTA_Race1.csv
    │   └── 2024_COTA_Race2.csv
    ├── Road America/
    │   ├── 2024_Road_America_Race1.csv
    │   └── 2024_Road_America_Race2.csv
    ├── Sebring/
    │   ├── 2024_Sebring_Race1.csv
    │   └── 2024_Sebring_Race2.csv
    ├── Sonoma/
    │   ├── 2024_Sonoma_Race1.csv
    │   └── 2024_Sonoma_Race2.csv
    ├── VIR/
    │   ├── 2024_VIR_Race1.csv
    │   └── 2024_VIR_Race2.csv
    └── Maps/
        ├── Barber_Circuit_Map.pdf
        ├── COTA_Circuit_Map.pdf
        ├── Road_America_Map.pdf
        ├── Sebring_Track_Sector_Map.pdf
        ├── Sonoma_Map.pdf
        └── VIR_map.pdf
```

### Dataset Location Configuration

The dataset path is configured in **`backend/src/config.py`**:

```python
# Local development - full dataset
BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
DATASET_DIR = BASE_DIR / "Hack the Track" / "dataset"
```

**Important**: The code expects the dataset folder to be named **"Hack the Track"** and located **5 levels up** from `config.py`.

### If Your Dataset is in a Different Location

**Option 1: Move the Dataset** (Recommended)

```bash
# Place your dataset folder at the expected location
# From project root:
cd ../..
# Your structure should be:
# D:/Books/Hackathon/Hack the Track/dataset/
```

**Option 2: Modify config.py**

Edit `backend/src/config.py` and change the path:

```python
# Example: Dataset in project root
BASE_DIR = Path(__file__).resolve().parent.parent
DATASET_DIR = BASE_DIR / "dataset"

# Example: Absolute path
DATASET_DIR = Path("D:/path/to/your/dataset")
```

---

## 🔧 Installation Steps

### 1. Clone the Repository

```bash
git clone https://github.com/AlphaJugger11/HackTheTrack.git
cd HackTheTrack
```

### 2. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (recommended)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Verify installation
python -c "import fastapi; import pandas; print('Dependencies installed successfully!')"
```

### 3. Frontend Setup

```bash
# Navigate to frontend directory (from project root)
cd frontend

# Install dependencies
npm install

# Verify installation
npm list react
```

---

## ▶️ Running the Application

### Start Backend Server

```bash
# From backend directory
cd backend

# Activate virtual environment if not already active
# Windows:
venv\Scripts\activate

# Run the server
python run.py
```

**Expected Output:**

```
Running in LOCAL mode
BASE_DIR: D:\Books\Hackathon\HackTheTrackLowMem
Dataset directory found: D:\Books\Hackathon\Hack the Track\dataset
Available tracks: ['barber', 'COTA', 'Maps', 'Road America', 'Sebring', 'Sonoma', 'VIR']
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Backend URL**: http://localhost:8000

### Start Frontend Development Server

```bash
# From frontend directory (in a new terminal)
cd frontend

# Run development server
npm run dev
```

**Expected Output:**

```
VITE v5.0.8  ready in 1234 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
➜  press h to show help
```

**Frontend URL**: http://localhost:5173

---

## ✅ Verification Steps

### 1. Test Backend API

Open in browser or use curl:

```bash
# Health check
curl http://localhost:8000/

# Get available tracks
curl http://localhost:8000/api/races

# Get specific race data
curl http://localhost:8000/api/races/COTA/1
```

**Expected Response:**

```json
{
  "message": "GR Cup Analytics Platform API",
  "version": "1.0.0",
  "status": "running"
}
```

### 2. Test Frontend

1. Open http://localhost:5173 in your browser
2. You should see the GR Cup Analytics Platform dashboard
3. Select a track (e.g., COTA)
4. Select a race (Race 1 or Race 2)
5. Click on a driver number
6. Verify telemetry data loads

### 3. Check Dataset Loading

Look at the backend terminal output:

```
INFO:data_processing.dataset_manager:Found 2 races for Sebring
INFO:data_processing.dataset_manager:Loaded race results for Sebring Race 1
```

If you see warnings about missing files, check your dataset structure.

---

## 🔍 Troubleshooting

### Dataset Not Found

**Error:**

```
WARNING: Dataset directory not found at D:\Books\Hackathon\Hack the Track\dataset
```

**Solution:**

1. Verify dataset location matches the path in `config.py`
2. Check folder name is exactly "Hack the Track" (with space)
3. Ensure dataset folder contains track subfolders

### Port Already in Use

**Error:**

```
ERROR: [Errno 10048] error while attempting to bind on address ('0.0.0.0', 8000)
```

**Solution:**

```bash
# Windows - Kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or change port in backend/src/config.py
API_PORT = 8001
```

### Module Not Found

**Error:**

```
ModuleNotFoundError: No module named 'fastapi'
```

**Solution:**

```bash
# Ensure virtual environment is activated
cd backend
venv\Scripts\activate
pip install -r requirements.txt
```

### Frontend Won't Connect to Backend

**Error:** Black screen or "Network Error"

**Solution:**

1. Verify backend is running on port 8000
2. Check `frontend/.env` file:
   ```
   VITE_API_URL=http://localhost:8000
   ```
3. Restart frontend dev server

### CORS Errors

**Error:** "Access to fetch blocked by CORS policy"

**Solution:**
Check `backend/src/api/main.py` includes localhost:

```python
allow_origins=[
    "http://localhost:5173",
    "http://localhost:5174",
]
```

---

## 📊 Dataset Files Explained

### Race CSV Files

Each race CSV contains:

- **Lap Data**: Lap times, positions, gaps
- **Driver Info**: Car numbers, names
- **Timing**: Sector times, lap times
- **Status**: Pit stops, incidents

### Telemetry Data

High-frequency sensor data:

- **Speed**: GPS speed in km/h
- **Throttle**: 0-100% throttle position
- **Brake**: 0-100% brake pressure
- **G-Forces**: Lateral and longitudinal
- **Steering**: Steering angle
- **Gear**: Current gear

### Track Maps

PDF files converted to PNG for display:

- Circuit layout
- Sector divisions
- Key corners and features

---

## 🎯 Configuration Files

### Backend Configuration

**File**: `backend/src/config.py`

Key settings:

```python
DATASET_DIR = ...        # Dataset location
API_PORT = 8000          # Backend port
CACHE_MAX_SIZE_MB = 500  # Cache size
LOG_LEVEL = "INFO"       # Logging level
```

### Frontend Configuration

**File**: `frontend/.env`

```bash
VITE_API_URL=http://localhost:8000
```

**File**: `frontend/vite.config.ts`

```typescript
server: {
  port: 5173,
  host: true
}
```

---

## 🚀 Quick Start Commands

```bash
# Complete setup from scratch
git clone https://github.com/AlphaJugger11/HackTheTrack.git
cd HackTheTrack

# Backend
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py

# Frontend (new terminal)
cd frontend
npm install
npm run dev

# Open browser
start http://localhost:5173
```

---

## 📝 Environment Variables

### Backend

| Variable              | Default | Description          |
| --------------------- | ------- | -------------------- |
| `PORT`                | 8000    | API server port      |
| `RAILWAY_ENVIRONMENT` | -       | Deployment detection |
| `LOG_LEVEL`           | INFO    | Logging verbosity    |

### Frontend

| Variable       | Default               | Description     |
| -------------- | --------------------- | --------------- |
| `VITE_API_URL` | http://localhost:8000 | Backend API URL |

---

## 🎓 Next Steps

After successful setup:

1. **Explore the Dashboard**: Navigate through different tracks and races
2. **Analyze Telemetry**: View detailed sensor data for any lap
3. **Compare Drivers**: Use the comparison tool to benchmark performance
4. **Export Data**: Download race data in various formats
5. **Read Documentation**: Check other markdown files for deployment guides

---

## 📚 Additional Resources

- **Deployment Guide**: See `RAILWAY_S3_DEPLOYMENT.md`
- **Environment Setup**: See `ENV_SETUP.md`
- **Quick Start for Judges**: See `QUICK_START_JUDGES.md`
- **API Documentation**: Visit http://localhost:8000/docs when backend is running

---

## 💡 Tips

- **Use Chrome/Edge** for best performance
- **Keep both terminals open** (backend + frontend)
- **Check backend logs** for data loading status
- **Use browser DevTools** (F12) to debug issues
- **Dataset loads on first request** - first load may be slower

---

## ✅ Success Checklist

- [ ] Python 3.8+ installed
- [ ] Node.js 16+ installed
- [ ] Repository cloned
- [ ] Dataset in correct location
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Can access http://localhost:5173
- [ ] Can select track and view data
- [ ] Telemetry graphs loading

---

**Need Help?** Check the troubleshooting section or review the backend logs for specific error messages.

**Ready to Deploy?** See `RAILWAY_S3_DEPLOYMENT.md` for production deployment instructions.
