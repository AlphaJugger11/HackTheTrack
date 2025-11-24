# 🚀 Deploy Your Project NOW - Step by Step

## What You Have

✅ 2.5GB dataset uploaded to S3: `s3://hackthetrack/dataset/`  
✅ Backend configured to download from S3 on Railway startup  
✅ Frontend ready to deploy to Vercel

---

## Step 1: Make S3 Bucket Public (1 minute)

On your EC2 instance or local machine with AWS CLI:

```bash
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

**Test it works:**

```bash
curl https://hackthetrack.s3.amazonaws.com/dataset/COTA/2024_COTA_Race1.csv
```

You should see CSV data, not "Access Denied".

---

## Step 2: Push to GitHub (1 minute)

```bash
cd HackTheTrack
git add .
git commit -m "Railway deployment with S3 dataset"
git push origin main
```

---

## Step 3: Deploy Backend to Railway (10 minutes)

### 3a. Create Railway Project

1. Go to **https://railway.app**
2. Sign in with GitHub
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Choose your **HackTheTrack** repository
6. When asked for root directory, enter: **`backend`**
7. Click **"Deploy"**

### 3b. Watch the Magic Happen

Railway will now:

- Install Python dependencies
- Run `python run.py`
- Detect `RAILWAY_ENVIRONMENT=true`
- Download 2.5GB dataset from S3 (takes 5-8 minutes)
- Start your FastAPI server

**Watch the logs** - you should see:

```
Detected cloud environment, downloading dataset from S3...
Downloading dataset from s3://hackthetrack/dataset/
Downloading dataset/COTA/2024_COTA_Race1.csv -> dataset/COTA/2024_COTA_Race1.csv
...
Successfully downloaded 150 files from S3
Application startup complete
```

### 3c. Get Your Railway URL

1. Click on your deployment in Railway
2. Go to **"Settings"** tab
3. Scroll to **"Domains"**
4. Click **"Generate Domain"**
5. **Copy the URL** (e.g., `https://hackthetrack-production.up.railway.app`)

### 3d. Test Your Backend

```bash
# Replace with your actual Railway URL
curl https://hackthetrack-production.up.railway.app/
curl https://hackthetrack-production.up.railway.app/tracks
```

Should return JSON data!

---

## Step 4: Deploy Frontend to Vercel (3 minutes)

### 4a. Configure Frontend

```bash
cd frontend

# Create production config with your Railway URL
echo "VITE_API_URL=https://hackthetrack-production.up.railway.app" > .env.production

# Replace with your actual Railway URL from Step 3c
```

### 4b. Deploy

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Login
vercel login

# Deploy to production
vercel --prod
```

**Copy the Vercel URL** (e.g., `https://hackthetrack.vercel.app`)

---

## Step 5: Update CORS (2 minutes)

Edit `backend/src/api/main.py` and update the CORS middleware:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "https://hackthetrack.vercel.app",  # Your Vercel URL
        "https://*.vercel.app"  # All Vercel preview deployments
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Commit and push:**

```bash
git add backend/src/api/main.py
git commit -m "Add Vercel domain to CORS"
git push
```

Railway will automatically redeploy (takes ~2 minutes, no dataset re-download).

---

## Step 6: Test Everything (2 minutes)

### Backend Test

```bash
curl https://YOUR_RAILWAY_URL/tracks
# Should return list of tracks
```

### Frontend Test

1. Open your Vercel URL in browser
2. Select a track (e.g., COTA)
3. Select a race
4. Check telemetry graphs load
5. Check track map displays
6. Open browser console (F12) - should be no CORS errors

---

## ✅ You're Done!

**Your Live URLs:**

- Backend: `https://YOUR_RAILWAY_URL`
- Frontend: `https://YOUR_VERCEL_URL`

**Share with judges:**

- Live demo: Your Vercel URL
- GitHub repo: https://github.com/AlphaJugger11/HackTheTrack

---

## Troubleshooting

### "Access Denied" from S3

→ Run the bucket policy command from Step 1 again

### Railway deployment fails

→ Check logs in Railway dashboard
→ Look for specific error messages

### Frontend can't connect

→ Verify `.env.production` has correct Railway URL
→ Check CORS settings in `main.py`
→ Look for errors in browser console (F12)

### Dataset not downloading

→ Check Railway logs for "Detected cloud environment"
→ Verify `RAILWAY_ENVIRONMENT=true` in `railway.json`

---

## Cost

**Total: ~$1/month**

- Railway: Free tier (8GB disk, 8GB RAM)
- Vercel: Free tier (100GB bandwidth)
- S3 Storage: $0.06/month (2.5GB)
- S3 Bandwidth: ~$0.90/month (10GB)

---

## Need Help?

Check these files:

- `RAILWAY_S3_DEPLOYMENT.md` - Detailed guide
- `DEPLOY_CHECKLIST.md` - Quick checklist
- Railway logs - Detailed error messages

---

**Total Time: ~15 minutes**

**Let's deploy! 🏁**
