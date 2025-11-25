"""
Download dataset from S3 on startup
"""
import os
import boto3
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

S3_BUCKET = "hackthetrack"
S3_PREFIX = "dataset/"
LOCAL_DATASET_DIR = Path("dataset")

def download_dataset_from_s3():
    """Download dataset from S3 if not already present."""
    
    # Check if dataset already exists
    if LOCAL_DATASET_DIR.exists() and len(list(LOCAL_DATASET_DIR.glob("**/*.csv"))) > 0:
        logger.info("Dataset already exists locally, skipping download")
        return
    
    logger.info(f"Downloading dataset from s3://{S3_BUCKET}/{S3_PREFIX}")
    
    # Create local directory
    LOCAL_DATASET_DIR.mkdir(parents=True, exist_ok=True)
    
    # Use direct HTTP downloads instead of boto3 to avoid permission issues
    import requests
    
    # Define the file structure (tracks and their files)
    tracks = {
        "COTA": ["2024_COTA_Race1.csv", "2024_COTA_Race2.csv"],
        "Sebring": ["2024_Sebring_Race1.csv", "2024_Sebring_Race2.csv"],
        "Road America": ["2024_Road_America_Race1.csv", "2024_Road_America_Race2.csv"],
        "VIR": ["2024_VIR_Race1.csv", "2024_VIR_Race2.csv"],
        "Sonoma": ["2024_Sonoma_Race1.csv", "2024_Sonoma_Race2.csv"],
        "barber": ["2024_barber_Race1.csv", "2024_barber_Race2.csv"],
        "Maps": [
            "Barber_Circuit_Map.pdf",
            "COTA_Circuit_Map.pdf",
            "Road_America_Map.pdf",
            "Sebring_Track_Sector_Map.pdf",
            "Sonoma_Map.pdf",
            "VIR_map.pdf"
        ]
    }
    
    try:
        file_count = 0
        base_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{S3_PREFIX}"
        
        for track, files in tracks.items():
            track_dir = LOCAL_DATASET_DIR / track
            track_dir.mkdir(parents=True, exist_ok=True)
            
            for filename in files:
                # Construct S3 URL
                file_url = f"{base_url}{track}/{filename}"
                local_file = track_dir / filename
                
                logger.info(f"Downloading {file_url} -> {local_file}")
                
                # Download file
                response = requests.get(file_url, stream=True)
                if response.status_code == 200:
                    with open(local_file, 'wb') as f:
                        for chunk in response.iter_content(chunk_size=8192):
                            f.write(chunk)
                    file_count += 1
                else:
                    logger.warning(f"Failed to download {file_url}: HTTP {response.status_code}")
        
        logger.info(f"Successfully downloaded {file_count} files from S3")
        
    except Exception as e:
        logger.error(f"Error downloading dataset from S3: {e}")
        raise

if __name__ == "__main__":
    download_dataset_from_s3()
