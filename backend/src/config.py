import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent
DATASET_DIR = BASE_DIR / "dataset"

API_HOST = "0.0.0.0"
API_PORT = 8000

CACHE_MAX_SIZE_MB = 500

TRACKS = [
    "barber",
    "COTA",
    "Road America",
    "Sebring",
    "Sonoma",
    "VIR"
]

SIMULATION_INTERVAL_SECONDS = 2.0

LOG_LEVEL = "INFO"
LOG_FILE = "backend.log"
