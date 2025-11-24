# Environment Variables Setup

This document explains all environment variables used in the project.

---

## Backend Environment Variables

### Location: `backend/.env`

Copy from example:

```bash
cd backend
cp .env.example .env
```

### Variables:

| Variable                | Description          | Default                                       | Required                 |
| ----------------------- | -------------------- | --------------------------------------------- | ------------------------ |
| `PORT`                  | Server port          | `8000`                                        | No                       |
| `HOST`                  | Server host          | `0.0.0.0`                                     | No                       |
| `ENVIRONMENT`           | Environment mode     | `development`                                 | No                       |
| `S3_BUCKET`             | S3 bucket name       | `hackthetrack`                                | Yes (for S3)             |
| `S3_REGION`             | S3 region            | `us-east-1`                                   | Yes (for S3)             |
| `S3_PREFIX`             | S3 prefix path       | `dataset/`                                    | Yes (for S3)             |
| `AWS_ACCESS_KEY_ID`     | AWS access key       | -                                             | No (if bucket is public) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key       | -                                             | No (if bucket is public) |
| `LOG_LEVEL`             | Logging level        | `INFO`                                        | No                       |
| `LOG_FILE`              | Log file path        | `backend.log`                                 | No                       |
| `CORS_ORIGINS`          | Allowed CORS origins | `http://localhost:5173,http://localhost:5174` | No                       |
| `CACHE_ENABLED`         | Enable caching       | `true`                                        | No                       |
| `CACHE_MAX_SIZE`        | Max cache size       | `100`                                         | No                       |
| `DATASET_DIR`           | Dataset directory    | `dataset`                                     | No                       |

### Railway-Specific Variables

These are automatically set by Railway:

| Variable              | Description                  | Set By  |
| --------------------- | ---------------------------- | ------- |
| `RAILWAY_ENVIRONMENT` | Indicates Railway deployment | Railway |
| `PORT`                | Dynamic port assignment      | Railway |

---

## Frontend Environment Variables

### Location: `frontend/.env`

Copy from example:

```bash
cd frontend
cp .env.example .env
```

### Variables:

| Variable       | Description     | Default                 | Required |
| -------------- | --------------- | ----------------------- | -------- |
| `VITE_API_URL` | Backend API URL | `http://localhost:8000` | Yes      |

### Environment-Specific Files:

- **`.env`** - Local development (git-ignored)
- **`.env.example`** - Template (committed to git)
- **`.env.production`** - Production build (git-ignored)
- **`.env.production.example`** - Production template (committed to git)

---

## Setup Instructions

### Local Development

1. **Backend Setup:**

   ```bash
   cd backend
   cp .env.example .env
   # Edit .env if needed (defaults work for local dev)
   ```

2. **Frontend Setup:**

   ```bash
   cd frontend
   cp .env.example .env
   # Default VITE_API_URL=http://localhost:8000 works for local dev
   ```

3. **Run:**

   ```bash
   # Terminal 1 - Backend
   cd backend
   python run.py

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

---

### Production Deployment

#### Railway Backend

Railway automatically sets:

- `RAILWAY_ENVIRONMENT=true` (triggers S3 download)
- `PORT` (dynamic port assignment)

No manual .env file needed on Railway. Variables are set in `railway.json` or Railway dashboard.

#### Vercel Frontend

Create `.env.production`:

```bash
cd frontend
echo "VITE_API_URL=https://your-railway-url.railway.app" > .env.production
vercel --prod
```

Or set in Vercel dashboard:

1. Go to project settings
2. Environment Variables
3. Add `VITE_API_URL` = `https://your-railway-url.railway.app`

---

## Security Notes

### What to Commit:

✅ `.env.example` files (templates with no secrets)  
✅ `railway.json` (no secrets, just config)

### What NOT to Commit:

❌ `.env` files (contain actual values)  
❌ `.env.production` files (contain production URLs)  
❌ `.env.local` files (local overrides)  
❌ Any file with AWS credentials

### AWS Credentials:

For this project, the S3 bucket is **public**, so no AWS credentials are needed.

If you need private bucket access:

1. Create IAM user with S3 read permissions
2. Add to Railway environment variables (not in code!)
3. Never commit credentials to git

---

## Troubleshooting

### Backend can't find dataset

**Problem:** `Dataset not found` error

**Solution:**

- Check `DATASET_DIR` in `.env`
- Verify dataset exists at `backend/dataset/`
- For Railway: Check logs for S3 download success

### Frontend can't connect to backend

**Problem:** CORS errors or connection refused

**Solution:**

- Verify `VITE_API_URL` in `.env` or `.env.production`
- Check backend is running
- Verify CORS origins in `backend/src/api/main.py`

### Railway deployment fails

**Problem:** Environment variables not set

**Solution:**

- Check `railway.json` has `RAILWAY_ENVIRONMENT=true`
- Verify S3 bucket is public
- Check Railway logs for specific errors

---

## Environment Variable Priority

### Backend (Python)

1. System environment variables (highest priority)
2. `.env` file
3. Default values in code (lowest priority)

### Frontend (Vite)

1. `.env.production` (for production builds)
2. `.env.local` (for local overrides)
3. `.env` (for development)
4. `.env.example` (template only, not loaded)

---

## Quick Reference

### Local Development

```bash
# Backend
cd backend
cp .env.example .env
python run.py

# Frontend
cd frontend
cp .env.example .env
npm run dev
```

### Production Deployment

```bash
# Backend - Railway (automatic)
# Just push to GitHub, Railway handles it

# Frontend - Vercel
cd frontend
echo "VITE_API_URL=https://YOUR_RAILWAY_URL" > .env.production
vercel --prod
```

---

## Need Help?

- Check `.env.example` files for templates
- See `DEPLOY_NOW.md` for deployment guide
- See `RAILWAY_S3_DEPLOYMENT.md` for Railway-specific setup
