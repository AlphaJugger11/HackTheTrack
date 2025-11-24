"""
Entry point for running the GR Cup Analytics Platform backend.
Run this file from the backend directory: python run.py
"""
import uvicorn
import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / "src"))

if __name__ == "__main__":
    # Download dataset from S3 if running on Railway/cloud
    if os.getenv('RAILWAY_ENVIRONMENT') or os.getenv('AWS_EXECUTION_ENV') or os.getenv('EC2_INSTANCE'):
        print("Detected cloud environment, downloading dataset from S3...")
        from download_dataset import download_dataset_from_s3
        download_dataset_from_s3()
    
    # Use PORT from environment (Railway) or default to 8000
    port = int(os.getenv('PORT', 8000))
    
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=port,
        reload=False  # Disable reload in production
    )
