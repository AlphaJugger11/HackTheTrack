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
    
    # Initialize S3 client with anonymous access (for public buckets)
    from botocore import UNSIGNED
    from botocore.config import Config
    s3 = boto3.client('s3', region_name='us-east-1', config=Config(signature_version=UNSIGNED))
    
    try:
        # List all objects in the bucket
        paginator = s3.get_paginator('list_objects_v2')
        pages = paginator.paginate(Bucket=S3_BUCKET, Prefix=S3_PREFIX)
        
        file_count = 0
        for page in pages:
            if 'Contents' not in page:
                continue
                
            for obj in page['Contents']:
                s3_key = obj['Key']
                
                # Skip if it's just a folder marker
                if s3_key.endswith('/'):
                    continue
                
                # Calculate local path
                relative_path = s3_key[len(S3_PREFIX):]  # Remove 'dataset/' prefix
                local_file = LOCAL_DATASET_DIR / relative_path
                
                # Create parent directories
                local_file.parent.mkdir(parents=True, exist_ok=True)
                
                # Download file
                logger.info(f"Downloading {s3_key} -> {local_file}")
                s3.download_file(S3_BUCKET, s3_key, str(local_file))
                file_count += 1
        
        logger.info(f"Successfully downloaded {file_count} files from S3")
        
    except Exception as e:
        logger.error(f"Error downloading dataset from S3: {e}")
        raise

if __name__ == "__main__":
    download_dataset_from_s3()
