# Railway Deployment with S3 Dataset

## Overview

Your 2.5GB dataset is stored in S3, and Railway will download it on startup. This keeps your Git repo small and deployment fast.

---

## Prerequisites

✅ Dataset uploaded to S3 bucket: `s3://hackthetrack/dataset/`  
✅ S3 bucket configured for public read access  
✅ GitHub account  
✅ Railway account (free): https://railway.app

---

## Step 1: Verify S3 Bucket is Public

Your Railway instance needs to download from S3 without AWS credentials. Make sure your bucket allows public read:

```bash
# On your EC2 instance or local machine with AWS CLI
aws s3api put-bucket-policy --bucket hackthetrack --policy '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::hackthetrack/*"
    }
  ]
}'
```

Test public access:

```bash
curl https://hackthetrack.s3.amazonaws.com/dataset/COTA/2024_COTA_Race1.csv
# Should return CSV data, not access denied
```

---

## Step 2: Verify Local Setup

Make sure your code is ready:

```bash
cd HackTheTrack

# Check that dataset is in .gitignore (it should be)
grep "dataset/" .gitignore

# Verify backend files exist
ls backend/run.py
ls backend/download_dataset.py
ls backend/railway.json

# Test S3 download locally (optional)
cd backend
RAILWAY_ENVIRONMENT=true python run.py
# Should download dataset and start server
```

---

## Step 3: Push to GitHub

```bash
# From HackTheTrack directory
git add .
git commit -m "Railway deployment with S3 dataset download"
git push origin main
```

---

## Step 4: Deploy Backend to Railway

### Via Railway Dashboard (Recommended)

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your **HackTheTrack** repository
5. Railway will ask for the root directory:
   - Set **Root Directory**: `backend`
6. Click **"Deploy"**

### What Happens Next:

Railway will:

1. Detect `railway.json` configuration
2. Install Python dependencies from `requirements.txt`
3. Run `python run.py` (as specified in railway.json)
4. Detect `RAILWAY_ENVIRONMENT=true` environment variable
5. Execute `download_dataset_from_s3()` function
6. Download all files from `s3://hackthetrack/dataset/` to `backend/dataset/`
7. Start the FastAPI server on Railway's assigned port

**This will take 5-10 minutes** due to the 2.5GB download.

---

## Step 5: Get Your Railway URL

1. In Railway dashboard, click on your deployment
2. Go to **"Settings"** tab
3. Scroll to **"Domains"** section
4. Click **"Generate Domain"**
5. Copy the URL (e.g., `https://hackthetrack-production.up.railway.app`)

Test it:

```bash
curl https://YOUR_RAILWAY_URL/tracks
# Should return list of tracks
```

---

## Step 6: Deploy Frontend to Vercel

### Update API URL

```bash
cd frontend

# Create production environment file with your Railway URL
echo "VITE_API_URL=https://YOUR_RAILWAY_URL" > .env.production
```

### Deploy

```bash
# Install Vercel CLI if you haven't
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

Copy the Vercel URL (e.g., `https://hackthetrack.vercel.app`)

---

## Step 7: Update CORS Settings

Update `backend/src/api/main.py` to allow your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://hackthetrack.vercel.app",  # Your Vercel URL
        "https://*.vercel.app"  # Allow all Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push:

```bash
git add backend/src/api/main.py
git commit -m "Add Vercel domain to CORS"
git push
```

Railway will automatically redeploy (takes ~2 minutes, no dataset re-download needed).

---

## Verification Checklist

Test your deployment:

- [ ] Backend health check: `curl https://YOUR_RAILWAY_URL/`
- [ ] Tracks endpoint: `curl https://YOUR_RAILWAY_URL/tracks`
- [ ] Frontend loads at Vercel URL
- [ ] Can select tracks and view races
- [ ] Telemetry graphs load correctly
- [ ] Track maps display
- [ ] No CORS errors in browser console (F12)

---

## Monitoring & Logs

### Railway Logs

1. Go to Railway dashboard
2. Click on your project
3. Click **"Deployments"** tab
4. Click on latest deployment
5. View logs to see:
   - S3 download progress
   - Server startup
   - API requests

### Check Dataset Download

Look for these log messages:

```
Detected cloud environment, downloading dataset from S3...
Downloading dataset from s3://hackthetrack/dataset/
Downloading dataset/COTA/2024_COTA_Race1.csv -> dataset/COTA/2024_COTA_Race1.csv
...
Successfully downloaded 150 files from S3
```

---

## Troubleshooting

### Railway deployment fails with "No space left"

Railway free tier has 8GB disk space. Your dataset is 2.5GB, which should fit.

Check logs for actual error. If needed, reduce dataset size:

```bash
# On your local machine, create a smaller dataset
mkdir backend/dataset_small
cp -r backend/dataset/COTA backend/dataset_small/
cp -r backend/dataset/Sebring backend/dataset_small/
cp -r backend/dataset/Maps backend/dataset_small/

# Upload to S3
aws s3 sync backend/dataset_small/ s3://hackthetrack/dataset_small/

# Update download_dataset.py to use dataset_small
```

### S3 download fails with "Access Denied"

Your bucket isn't public. Run the bucket policy command from Step 1 again.

Test with curl:

```bash
curl https://hackthetrack.s3.amazonaws.com/dataset/COTA/2024_COTA_Race1.csv
```

### Frontend can't connect to backend

1. Check `.env.production` has correct Railway URL
2. Verify CORS settings in `backend/src/api/main.py`
3. Check browser console (F12) for errors
4. Test backend directly: `curl https://YOUR_RAILWAY_URL/tracks`

### Railway keeps restarting

Check logs for errors. Common issues:

- Python dependencies missing (check `requirements.txt`)
- Port binding issue (should use `$PORT` env var)
- Dataset download timeout (increase Railway timeout in settings)

### Dataset not downloading

Check Railway logs for:

```
Detected cloud environment, downloading dataset from S3...
```

If not present, verify:

- `RAILWAY_ENVIRONMENT=true` is set in `railway.json`
- `run.py` has the correct environment check
- `download_dataset.py` exists in backend directory

---

## Cost & Limits

| Resource          | Limit       | Your Usage          | Status |
| ----------------- | ----------- | ------------------- | ------ |
| Railway Disk      | 8GB         | 2.5GB dataset       | ✅ OK  |
| Railway Memory    | 8GB         | ~500MB              | ✅ OK  |
| Railway CPU       | Shared      | Low usage           | ✅ OK  |
| Railway Bandwidth | 100GB/month | ~10GB               | ✅ OK  |
| Vercel Bandwidth  | 100GB/month | ~5GB                | ✅ OK  |
| S3 Storage        | Pay per GB  | 2.5GB = $0.06/month | ✅ OK  |
| S3 Bandwidth      | Pay per GB  | ~10GB = $0.90/month | ✅ OK  |

**Total Monthly Cost**: ~$1 (mostly S3 bandwidth)

---

## Alternative: Use Railway Volumes (Persistent Storage)

If you want to avoid re-downloading on every deployment:

1. In Railway dashboard, go to your project
2. Click **"Variables"** tab
3. Add a **Volume**:
   - Mount path: `/app/dataset`
   - Size: 5GB
4. Update `download_dataset.py` to check if volume has data before downloading

This keeps the dataset between deployments but costs $0.25/GB/month.

---

## Quick Commands Summary

```bash
# 1. Verify S3 is public
curl https://hackthetrack.s3.amazonaws.com/dataset/COTA/2024_COTA_Race1.csv

# 2. Push to GitHub
git add .
git commit -m "Railway deployment ready"
git push

# 3. Deploy to Railway (via dashboard)
# - New Project → GitHub → HackTheTrack → Root: backend → Deploy

# 4. Get Railway URL and deploy frontend
cd frontend
echo "VITE_API_URL=https://YOUR_RAILWAY_URL" > .env.production
vercel --prod

# 5. Update CORS and redeploy
# Edit backend/src/api/main.py
git add backend/src/api/main.py
git commit -m "Add Vercel to CORS"
git push

# Done! 🎉
```

---

## What Judges Will See

**Live Demo**: https://hackthetrack.vercel.app

Features:

- ✅ All 6 tracks (full dataset from S3)
- ✅ All races and sessions
- ✅ Full telemetry visualization
- ✅ Strategy recommendations
- ✅ Driver comparison
- ✅ Data export
- ✅ Track maps

**No limitations** - full dataset available!

---

## Need Help?

- Railway docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- Check Railway logs for detailed error messages
- Test S3 access with curl before deploying

---

**Ready to deploy! Your 2.5GB dataset will be automatically downloaded on Railway startup. 🚀**
