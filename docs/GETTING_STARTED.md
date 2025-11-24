# Getting Started - GR Cup Analytics Platform

## Quick Start

This document provides a quick reference for starting development.

## Project Structure

```
Hack the Track/
├── backend/          # Python FastAPI backend
├── frontend/         # React TypeScript frontend
├── dataset/          # Race data (already present)
├── docs/             # Documentation
└── .kiro/specs/      # Project specifications
```

## Development Workflow

1. **Start Backend:**

   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   uvicorn src.api.main:app --reload
   ```

2. **Start Frontend:**

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

3. **Access Application:**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Docs: http://localhost:8000/docs

## Implementation Order

Follow tasks in `.kiro/specs/gr-cup-analytics-platform/tasks.md` sequentially.

Current task: **Task 1 - Set up project structure and core backend infrastructure**

## Key Reminders

- Document all data cleaning decisions in `docs/data_preprocessing_decisions.md`
- Add inline comments explaining WHY for data processing choices
- Test each component before moving to next task
- No emoji in code
- Keep code minimal and focused

## Hackathon Submission

- **Category:** Real-Time Analytics + Driver Training & Insights
- **Datasets:** All 6 tracks (Barber, COTA, Road America, Sebring, Sonoma, VIR)
- **Demo:** 3-minute video showcasing real-time simulation and insights
