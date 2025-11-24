# Railway Deployment Checklist

## Pre-Deployment (Do Once)

- [ ] **S3 Bucket is Public**

  ```bash
  curl https://hackthetrack.s3.amazonaws.com/dataset/COTA/2024_COTA_Race1.csv
  # Should return CSV data
  ```

- [ ] **Code is committed to GitHub**

  ```bash
  git add .
  git commit -m "Ready for Railway deployment"
  git push origin main
  ```

- [ ] **Backend files are correct**
  - [ ] `backend/run.py` - checks for RAILWAY_ENVIRONMENT
  - [ ] `backend/download_dataset.py` - downloads from S3
  - [ ] `backend/railway.json` - sets RAILWAY_ENVIRONMENT=true
  - [ ] `backend/requirements.txt` - includes boto3

---

## Railway Deployment (5-10 minutes)

- [ ] **Create Railway Project**

  1. Go to https://railway.app
  2. Click "New Project"
  3. Select "Deploy from GitHub repo"
  4. Choose HackTheTrack repository
  5. Set root directory: `backend`
  6. Click "Deploy"

- [ ] **Wait for Deployment**

  - Watch logs for: "Downloading dataset from S3..."
  - Should see: "Successfully downloaded X files from S3"
  - Should see: "Application startup complete"
  - Takes 5-10 minutes for 2.5GB download

- [ ] **Generate Domain**

  1. Go to Settings tab
  2. Scroll to Domains section
  3. Click "Generate Domain"
  4. Copy URL (e.g., `https://hackthetrack-production.up.railway.app`)

- [ ] **Test Backend**
  ```bash
  curl https://YOUR_RAILWAY_URL/
  curl https://YOUR_RAILWAY_URL/tracks
  # Should return JSON data
  ```

---

## Frontend Deployment (3 minutes)

- [ ] **Configure Frontend**

  ```bash
  cd frontend
  echo "VITE_API_URL=https://YOUR_RAILWAY_URL" > .env.production
  ```

- [ ] **Deploy to Vercel**

  ```bash
  vercel --prod
  # Copy the Vercel URL
  ```

- [ ] **Update CORS**
  - Edit `backend/src/api/main.py`
  - Add your Vercel URL to `allow_origins`
  - Commit and push (Railway auto-redeploys)

---

## Verification (2 minutes)

- [ ] **Backend Health**

  - [ ] `curl https://YOUR_RAILWAY_URL/` returns 200
  - [ ] `curl https://YOUR_RAILWAY_URL/tracks` returns track list

- [ ] **Frontend Works**
  - [ ] Open Vercel URL in browser
  - [ ] Can select tracks
  - [ ] Can view races
  - [ ] Telemetry graphs load
  - [ ] Track maps display
  - [ ] No CORS errors in console (F12)

---

## If Something Goes Wrong

### Railway logs show "Access Denied" from S3

→ Run the S3 bucket policy command from RAILWAY_S3_DEPLOYMENT.md

### Railway deployment fails

→ Check logs in Railway dashboard for specific error

### Frontend can't connect to backend

→ Verify `.env.production` has correct Railway URL
→ Check CORS settings in `backend/src/api/main.py`

### Dataset not downloading

→ Check Railway logs for "Detected cloud environment"
→ Verify `RAILWAY_ENVIRONMENT=true` in railway.json

---

## Quick Reference

**S3 Bucket**: `s3://hackthetrack/dataset/`  
**Railway URL**: https://YOUR_RAILWAY_URL  
**Vercel URL**: https://YOUR_VERCEL_URL

**Railway Dashboard**: https://railway.app/dashboard  
**Vercel Dashboard**: https://vercel.com/dashboard

---

## Total Time: ~15 minutes

1. Railway deployment: 5-10 min (mostly S3 download)
2. Frontend deployment: 3 min
3. Verification: 2 min

**You're ready to go! 🚀**
