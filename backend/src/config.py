import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
DATASET_DIR = BASE_DIR / "Hack the Track" / "dataset"
print(BASE_DIR)
API_HOST = "0.0.0.0"
API_PORT = 8000
print(os.listdir(DATASET_DIR))
CACHE_MAX_SIZE_MB = 500  # Optimized for 8GB RAM systems

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
