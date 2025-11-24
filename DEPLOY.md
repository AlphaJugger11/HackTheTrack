# Quick Deployment Guide

## TL;DR - Deploy in 10 Minutes

### Prerequisites

- GitHub account
- Railway account (free): https://railway.app
- Vercel account (free): https://vercel.com

---

## Step 1: Prepare Demo Dataset (2 minutes)

```bash
# Navigate to project
cd HackTheTrack

# Create demo dataset folder in backend
mkdir -p backend/dataset

# Copy 2 tracks for demo (adjust paths as needed)
cp -r "../Hack the Track/dataset/COTA" backend/dataset/
cp -r "../Hack the Track/dataset/Road America" backend/dataset/
cp -r "../Hack the Track/dataset/Maps" backend/dataset/

# Verify
ls backend/dataset
# Should show: COTA  Maps  Road America
```

---

## Step 2: Push to GitHub (2 minutes)

```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - GR Cup Analytics Platform"

# Create repo on GitHub, then:
git remote add origin https://github.com/AlphaJugger11/HackTheTrack.git
git branch -M main
git push -u origin main
```

---

## Step 3: Deploy Backend to Railway (3 minutes)

### Option A: Via Railway Dashboard (Easiest)

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose your HackTheTrack repository
5. Select the `backend` folder as root directory
6. Click "Deploy"
7. Wait for deployment (2-3 minutes)
8. Click "Settings" → "Generate Domain"
9. **Copy the domain URL** (e.g., `https://your-app.railway.app`)

### Option B: Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Deploy
cd backend
railway init
railway up

# Get domain
railway domain
# Copy the URL
```

---

## Step 4: Deploy Frontend to Vercel (3 minutes)

### Update API URL

```bash
cd frontend

# Create production environment file
echo "VITE_API_URL=https://your-app.railway.app" > .env.production

# Replace 'your-app.railway.app' with your actual Railway URL
```

### Deploy

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Copy the deployment URL
```

---

## Step 5: Update CORS (1 minute)

Update `backend/src/api/main.py` to include your Vercel URL:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://your-app.vercel.app"  # Add your Vercel URL
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push:

```bash
git add .
git commit -m "Update CORS for production"
git push
```

Railway will auto-deploy the update.

---

## Verification Checklist

- [ ] Backend is accessible at Railway URL
- [ ] Frontend is accessible at Vercel URL
- [ ] Can select COTA or Road America
- [ ] Can view race data
- [ ] Can see telemetry
- [ ] Can export data
- [ ] No CORS errors in browser console

---

## Troubleshooting

### Backend won't start on Railway

- Check logs in Railway dashboard
- Verify `requirements.txt` is correct
- Ensure `dataset` folder exists in backend

### Frontend can't connect to backend

- Verify `.env.production` has correct Railway URL
- Check CORS settings in `main.py`
- Look for errors in browser console (F12)

### Dataset not found

- Verify dataset folder structure:
  ```
  backend/
    dataset/
      COTA/
      Road America/
      Maps/
  ```

### Railway deployment fails

- Check if you're on free tier (500MB limit)
- Verify dataset size: `du -sh backend/dataset`
- Should be under 400MB

---

## Alternative: Just Backend on Railway

If you want judges to run frontend locally:

1. Deploy only backend to Railway
2. Update README with Railway URL
3. Judges run frontend locally with:
   ```bash
   cd frontend
   echo "VITE_API_URL=https://your-app.railway.app" > .env
   npm install
   npm run dev
   ```

---

## Cost Breakdown

| Service   | What             | Cost           |
| --------- | ---------------- | -------------- |
| Railway   | Backend hosting  | $0 (free tier) |
| Vercel    | Frontend hosting | $0 (free tier) |
| GitHub    | Code repository  | $0 (free)      |
| **Total** |                  | **$0**         |

---

## What Judges Will See

**Live Demo**: https://your-app.vercel.app

Features available:

- ✅ 2 tracks (COTA, Road America)
- ✅ All races for those tracks
- ✅ Full telemetry visualization
- ✅ Strategy recommendations
- ✅ Driver comparison
- ✅ Data export
- ✅ Track maps

**Note in README**:

> The live demo showcases 2 tracks due to free hosting limits.
> Full dataset with all 6 tracks is available in the repository.
> Clone and run locally for the complete experience.

---

## Quick Commands Summary

```bash
# 1. Prepare dataset
mkdir -p backend/dataset
cp -r "../Hack the Track/dataset/COTA" backend/dataset/
cp -r "../Hack the Track/dataset/Road America" backend/dataset/
cp -r "../Hack the Track/dataset/Maps" backend/dataset/

# 2. Push to GitHub
git add .
git commit -m "Ready for deployment"
git push

# 3. Deploy backend (Railway dashboard or CLI)
cd backend
railway init
railway up
railway domain  # Copy URL

# 4. Deploy frontend
cd ../frontend
echo "VITE_API_URL=https://YOUR_RAILWAY_URL" > .env.production
vercel --prod

# Done! 🎉
```

---

## Need Help?

- Railway docs: https://docs.railway.app
- Vercel docs: https://vercel.com/docs
- Check logs in respective dashboards
- Test locally first to ensure everything works

---

**You're ready to deploy! Good luck with the hackathon! 🏁**
