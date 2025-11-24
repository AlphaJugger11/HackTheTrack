# Deployment Guide - Free Services with Large Dataset

## Challenge: Dataset Size

The "Hack the Track" dataset is likely several GB, which exceeds free tier limits. Here are practical solutions:

---

## Strategy 1: GitHub + Railway (Recommended) ⭐

### Why This Works

- Railway gives 500MB storage + 5GB bandwidth/month (free)
- GitHub can host the dataset separately
- Use Git LFS for large files

### Step-by-Step Deployment

#### 1. Prepare Dataset for GitHub LFS

```bash
# Install Git LFS
git lfs install

# Track large CSV files
cd "Hack the Track/dataset"
git lfs track "*.csv"
git lfs track "*.pdf"
git add .gitattributes
```

#### 2. Deploy Backend to Railway

**A. Create Railway Account**

- Go to https://railway.app
- Sign up with GitHub (free)

**B. Prepare Backend for Railway**

Create `railway.json` in backend folder:

```json
{
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "uvicorn src.api.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

Update `backend/src/config.py`:

```python
import os
from pathlib import Path

# Check if running on Railway
if os.getenv('RAILWAY_ENVIRONMENT'):
    # Railway deployment - dataset in repo
    BASE_DIR = Path(__file__).resolve().parent.parent.parent
    DATASET_DIR = BASE_DIR / "dataset"
else:
    # Local development
    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
    DATASET_DIR = BASE_DIR / "Hack the Track" / "dataset"

API_HOST = "0.0.0.0"
API_PORT = int(os.getenv('PORT', 8000))
```

**C. Deploy to Railway**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
cd HackTheTrack/backend
railway init

# Deploy
railway up
```

**D. Get Backend URL**

```bash
railway domain
# Copy the URL (e.g., https://your-app.railway.app)
```

#### 3. Deploy Frontend to Vercel

**A. Update Frontend API URL**

Create `frontend/.env.production`:

```env
VITE_API_URL=https://your-app.railway.app
```

Update `frontend/src/services/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
```

**B. Deploy to Vercel**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd HackTheTrack/frontend
vercel --prod
```

---

## Strategy 2: Render (Alternative)

### Free Tier: 750 hours/month, 512MB RAM

#### Deploy Backend to Render

**A. Create `render.yaml`**

```yaml
services:
  - type: web
    name: gr-cup-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn src.api.main:app --host 0.0.0.0 --port $PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11.0
```

**B. Deploy**

1. Go to https://render.com
2. Connect GitHub repository
3. Select backend folder
4. Deploy

---

## Strategy 3: Dataset on Cloud Storage (Best for Large Data)

### Use Google Drive + Direct Links

#### 1. Upload Dataset to Google Drive

```bash
# Compress dataset first
cd "Hack the Track"
zip -r dataset.zip dataset/
```

Upload `dataset.zip` to Google Drive and make it public.

#### 2. Modify Backend to Download Dataset on Startup

Create `backend/src/data_loader.py`:

```python
import os
import requests
import zipfile
from pathlib import Path

def download_dataset():
    """Download dataset from Google Drive if not present."""
    dataset_dir = Path("dataset")

    if dataset_dir.exists():
        print("Dataset already exists")
        return

    print("Downloading dataset...")

    # Google Drive direct download link
    file_id = "YOUR_FILE_ID"  # Get from share link
    url = f"https://drive.google.com/uc?export=download&id={file_id}"

    # Download
    response = requests.get(url, stream=True)
    with open("dataset.zip", "wb") as f:
        for chunk in response.iter_content(chunk_size=8192):
            f.write(chunk)

    # Extract
    print("Extracting dataset...")
    with zipfile.ZipFile("dataset.zip", "r") as zip_ref:
        zip_ref.extractall(".")

    # Cleanup
    os.remove("dataset.zip")
    print("Dataset ready!")

if __name__ == "__main__":
    download_dataset()
```

Update `backend/run.py`:

```python
from src.data_loader import download_dataset

# Download dataset if needed
download_dataset()

# Then start server
import uvicorn
from src.api.main import app

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

---

## Strategy 4: Subset of Data (Pragmatic Approach) 🎯

### For Demo Purposes Only

If deployment is just for judges to test, use a subset:

#### 1. Create Minimal Dataset

```bash
cd "Hack the Track/dataset"

# Keep only 2 tracks for demo
mkdir ../dataset_demo
cp -r COTA ../dataset_demo/
cp -r "Road America" ../dataset_demo/
cp -r Maps ../dataset_demo/
```

#### 2. Update Config for Demo

```python
# backend/src/config.py
TRACKS = [
    "COTA",
    "Road America"
]
```

#### 3. Add Note to README

```markdown
## Demo Deployment Note

The deployed version uses a subset of data (2 tracks) due to free tier limitations.
Full dataset with all 6 tracks is available in the GitHub repository.
```

---

## Strategy 5: Docker + Fly.io

### Free Tier: 3GB storage, 160GB bandwidth/month

#### 1. Create Dockerfile

`backend/Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Copy requirements
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application
COPY . .

# Copy dataset (if small enough)
COPY ../dataset ./dataset

EXPOSE 8000

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

#### 2. Deploy to Fly.io

```bash
# Install Fly CLI
curl -L https://fly.io/install.sh | sh

# Login
fly auth login

# Launch app
cd HackTheTrack/backend
fly launch

# Deploy
fly deploy
```

---

## Recommended Deployment Strategy

### For Hackathon Judges:

**Option A: Full Dataset (Best)**

1. Use Railway for backend (with Git LFS for dataset)
2. Use Vercel for frontend
3. Total cost: $0
4. Limitation: May hit bandwidth limits if many judges test

**Option B: Subset Dataset (Safest)**

1. Deploy with 2-3 tracks only
2. Use Railway + Vercel
3. Add note that full dataset is in repo
4. Total cost: $0
5. No bandwidth concerns

**Option C: Hybrid (Recommended)** ⭐

1. Deploy backend to Railway with subset (2 tracks)
2. Deploy frontend to Vercel
3. Include instructions for running locally with full dataset
4. Provide demo video showing all 6 tracks
5. Total cost: $0

---

## Implementation: Hybrid Approach

### Step 1: Create Demo Dataset

```bash
# Create deployment-ready subset
cd HackTheTrack
mkdir backend/dataset
cp -r "../Hack the Track/dataset/COTA" backend/dataset/
cp -r "../Hack the Track/dataset/Road America" backend/dataset/
cp -r "../Hack the Track/dataset/Maps" backend/dataset/
```

### Step 2: Update Config

`backend/src/config.py`:

```python
import os
from pathlib import Path

# Deployment vs Local
if os.getenv('RAILWAY_ENVIRONMENT') or os.getenv('RENDER'):
    # Deployment - dataset in backend folder
    BASE_DIR = Path(__file__).resolve().parent.parent
    DATASET_DIR = BASE_DIR / "dataset"
    TRACKS = ["COTA", "Road America"]  # Demo subset
else:
    # Local - full dataset
    BASE_DIR = Path(__file__).resolve().parent.parent.parent.parent.parent
    DATASET_DIR = BASE_DIR / "Hack the Track" / "dataset"
    TRACKS = ["barber", "COTA", "Road America", "Sebring", "Sonoma", "VIR"]

API_HOST = "0.0.0.0"
API_PORT = int(os.getenv('PORT', 8000))
```

### Step 3: Update .gitignore

```bash
# Don't commit full dataset
echo "Hack the Track/" >> .gitignore

# But do commit demo dataset
echo "!backend/dataset/" >> .gitignore
```

### Step 4: Deploy

```bash
# Backend to Railway
cd backend
railway init
railway up

# Frontend to Vercel
cd ../frontend
vercel --prod
```

### Step 5: Update README

Add this section:

```markdown
## Deployment Note

The live demo uses a subset of data (COTA and Road America) due to free hosting limitations.

**To experience the full platform with all 6 tracks:**

1. Clone this repository
2. Follow the Quick Start guide
3. Run locally with the complete dataset

The demo showcases all features and functionality - just with 2 tracks instead of 6.
```

---

## Cost Comparison

| Service | Storage   | Bandwidth | RAM   | Cost |
| ------- | --------- | --------- | ----- | ---- |
| Railway | 500MB     | 5GB/mo    | 512MB | Free |
| Render  | 512MB     | 100GB/mo  | 512MB | Free |
| Vercel  | Unlimited | 100GB/mo  | 1GB   | Free |
| Fly.io  | 3GB       | 160GB/mo  | 256MB | Free |

---

## Final Recommendation

### For Your Hackathon Submission:

1. **Deploy with 2-3 tracks** (COTA, Road America, Sebring)
2. **Use Railway (backend) + Vercel (frontend)**
3. **Add clear note in README** about full dataset in repo
4. **Create demo video showing all 6 tracks** running locally
5. **Provide detailed local setup instructions**

### Why This Works:

- ✅ Judges can test live deployment
- ✅ No bandwidth/storage concerns
- ✅ Completely free
- ✅ Shows all features work
- ✅ Full dataset available in repo for verification
- ✅ Demo video shows complete functionality

---

## Quick Deploy Commands

```bash
# 1. Create demo dataset
cd HackTheTrack
mkdir -p backend/dataset
cp -r "../Hack the Track/dataset/COTA" backend/dataset/
cp -r "../Hack the Track/dataset/Road America" backend/dataset/
cp -r "../Hack the Track/dataset/Maps" backend/dataset/

# 2. Update config (see above)

# 3. Deploy backend
cd backend
npm install -g @railway/cli
railway login
railway init
railway up
railway domain  # Get URL

# 4. Update frontend env
cd ../frontend
echo "VITE_API_URL=https://your-railway-url.railway.app" > .env.production

# 5. Deploy frontend
npm install -g vercel
vercel login
vercel --prod

# Done! 🎉
```

---

## Troubleshooting

### Railway deployment fails

- Check logs: `railway logs`
- Ensure requirements.txt is correct
- Verify dataset path in config.py

### Frontend can't connect to backend

- Check CORS settings in main.py
- Verify API URL in .env.production
- Check Railway domain is correct

### Dataset not found

- Verify dataset folder structure
- Check config.py paths
- Ensure dataset is committed to repo

---

**Need help? The hybrid approach (2-3 tracks deployed, full dataset in repo) is your best bet!** 🚀
