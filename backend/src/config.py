import os
from pathlib import Path

# Detect deployment environment
IS_DEPLOYED = os.getenv('RAILWAY_ENVIRONMENT') or os.getenv('RENDER') or os.getenv('FLY_APP_NAME') or os.getenv('AWS_EXECUTION_ENV') or os.getenv('EC2_INSTANCE')

if IS_DEPLOYED:
    # Deployment - dataset in backend/dataset folder (downloaded from S3)
    BASE_DIR = Path(__file__).resolve().parent.parent
    DATASET_DIR = BASE_DIR / "dataset"
    TRACKS = ["Sebring"]  # Only Sebring uploaded to S3
    print(f"Running in DEPLOYMENT mode")
    print(f"BASE_DIR: {BASE_DIR}")
else:
    # Local development - full dataset
    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
    DATASET_DIR = BASE_DIR / "Hack the Track" / "dataset"
    TRACKS = [
        "barber",
        "COTA",
        "Road America",
        "Sebring",
        "Sonoma",
        "VIR"
    ]
    print(f"Running in LOCAL mode")
    print(f"BASE_DIR: {BASE_DIR}")

# Verify dataset directory exists
if DATASET_DIR.exists():
    print(f"Dataset directory found: {DATASET_DIR}")
    print(f"Available tracks: {os.listdir(DATASET_DIR)}")
else:
    print(f"WARNING: Dataset directory not found at {DATASET_DIR}")

API_HOST = "0.0.0.0"
API_PORT = int(os.getenv('PORT', 8000))  # Use PORT env var for deployment
CACHE_MAX_SIZE_MB = 500  # Optimized for 8GB RAM systems

SIMULATION_INTERVAL_SECONDS = 2.0

LOG_LEVEL = "INFO"
LOG_FILE = "backend.log"
