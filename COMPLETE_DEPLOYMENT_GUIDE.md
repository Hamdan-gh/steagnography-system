# 🚀 Complete Deployment Guide

Deploy your entire StegaGen application (Frontend + Auth Server + Python Backend)

## 📋 What You're Deploying

1. **Frontend** (React) → Vercel
2. **Auth Server** (Node.js) → Render
3. **Python Backend** (Flask) → Render (already deployed?)
4. **Database** → Supabase (already setup)

---

## Part 1: Deploy Auth Server (Render.com)

### Step 1: Create GitHub Repository

```bash
cd server
git init
git add .
git commit -m "Initial commit: Auth server"
```

Create repo on GitHub: https://github.com/new
Name it: `stegagen-auth-server`

```bash
git remote add origin https://github.com/YOUR_USERNAME/stegagen-auth-server.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://render.com
2. Click **New +** → **Web Service**
3. Connect GitHub → Select `stegagen-auth-server`
4. Configure:
   ```
   Name: stegagen-auth
   Region: Oregon (US West)
   Branch: main
   Build Command: npm install
   Start Command: npm start
   Instance Type: Free
   ```

5. **Environment Variables** (click "Advanced"):
   ```
   NODE_ENV=production
   PORT=3001
   SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dnNpc2FvdnJ5ZnRkcmF1eGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYwNjk4MiwiZXhwIjoyMDk3MTgyOTgyfQ.xsr4SCoYcJ1Qu3jPH7aXbRm0QR1P4xu2i0zs7qjNzvw
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=gangduhamd@gmail.com
   EMAIL_PASSWORD=mefyemddmbnkxxpi
   EMAIL_FROM=StegaGen Secure <gangduhamd@gmail.com>
   FRONTEND_URL=https://your-frontend-url.vercel.app
   VERIFICATION_CODE_LENGTH=6
   VERIFICATION_CODE_EXPIRY=600000
   ```

6. Click **Create Web Service**

7. Wait 2-3 minutes, then copy your URL:
   ```
   https://stegagen-auth.onrender.com
   ```

---

## Part 2: Deploy Frontend (Vercel)

### Step 1: Update Environment Variables

Update `.env.production`:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dnNpc2FvdnJ5ZnRkcmF1eGRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE2MDY5ODIsImV4cCI6MjA5NzE4Mjk4Mn0.1c3nmP5FX02R00238zx8RCXQaoodAlZhsDP3IBdlyjc

# Auth Server (UPDATE WITH YOUR RENDER URL)
VITE_AUTH_SERVER_URL=https://stegagen-auth.onrender.com

# Python Processing Engine (your existing Render URL)
VITE_PROCESSING_ENGINE_URL=https://stegagen-api.onrender.com

# Application Settings
VITE_APP_NAME=StegaGen Secure
VITE_APP_VERSION=1.0.0
```

### Step 2: Push to GitHub (if not already)

```bash
git add .
git commit -m "Update: Added email verification system"
git push
```

### Step 3: Deploy on Vercel

#### Option A: Via Vercel Dashboard

1. Go to https://vercel.com
2. Click **Add New** → **Project**
3. Import your GitHub repository
4. Configure:
   - Framework: Vite
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Environment Variables**:
   Add all from `.env.production` above

6. Click **Deploy**

#### Option B: Via CLI

```bash
npm install -g vercel
vercel login
vercel --prod
```

### Step 4: Get Your Frontend URL

After deployment, copy your Vercel URL:
```
https://your-app.vercel.app
```

### Step 5: Update Auth Server CORS

Go back to Render dashboard:
1. Open your auth server service
2. Go to **Environment**
3. Edit `FRONTEND_URL` to your actual Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
4. Save (auto-redeploys)

---

## Part 3: Verify Python Backend

### Check if Already Deployed

If you already deployed your Python backend to Render, verify it's using the correct URL in frontend:

```env
VITE_PROCESSING_ENGINE_URL=https://stegagen-api.onrender.com
```

### If Not Deployed Yet

See your existing Python deployment docs or:

1. Create new Web Service on Render
2. Connect Python backend repo
3. Configure:
   ```
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

---

## 🧪 Testing Your Deployment

### 1. Test Auth Server

```bash
curl https://stegagen-auth.onrender.com/health
```

Should return:
```json
{"status":"ok","message":"Auth server is running"}
```

### 2. Test Frontend

1. Go to your Vercel URL
2. Try to sign up with a real email
3. Check email for verification code
4. Enter code and verify
5. Login with credentials

### 3. Test Full Flow

1. Login to app
2. Try to embed audio in image (tests Python backend)
3. Check if it works end-to-end

---

## 📊 Deployment Architecture

```
┌─────────────────────────────────────────────┐
│         User's Browser                      │
└──────────────┬──────────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────────┐
│    Frontend (Vercel)                        │
│    https://your-app.vercel.app             │
└──────┬──────────────────────┬───────────────┘
       │                      │
       ▼                      ▼
┌─────────────────┐   ┌────────────────────────┐
│  Auth Server    │   │  Python Backend        │
│  (Render)       │   │  (Render)              │
│  /api/auth/*    │   │  /api/*                │
└─────────┬───────┘   └────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│         Supabase Database                   │
│         + Authentication                    │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────┐
│         Gmail SMTP                          │
│         (Email Sending)                     │
└─────────────────────────────────────────────┘
```

---

## 🔧 Environment Variables Summary

### Frontend (Vercel)
```env
VITE_SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_AUTH_SERVER_URL=https://stegagen-auth.onrender.com
VITE_PROCESSING_ENGINE_URL=https://stegagen-api.onrender.com
VITE_APP_NAME=StegaGen Secure
VITE_APP_VERSION=1.0.0
```

### Auth Server (Render)
```env
NODE_ENV=production
PORT=3001
SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gangduhamd@gmail.com
EMAIL_PASSWORD=mefyemddmbnkxxpi
EMAIL_FROM=StegaGen Secure <gangduhamd@gmail.com>
FRONTEND_URL=https://your-app.vercel.app
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY=600000
```

### Python Backend (Render)
```env
FLASK_ENV=production
SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
SUPABASE_KEY=...
# Add other Python env vars
```

---

## 🐛 Common Issues

### "CORS Error"
- Update `FRONTEND_URL` in auth server to match actual Vercel URL
- Ensure URL includes `https://`

### "Cold Start Slow"
- Render free tier spins down after 15 mins
- First request takes 30-60 seconds
- Upgrade to paid tier for always-on

### "Email Not Sending"
- Check Gmail credentials in Render dashboard
- For production, switch to SendGrid (see below)

### "Auth Server Not Responding"
- Check Render logs for errors
- Verify all environment variables set
- Test health endpoint: `https://your-auth.onrender.com/health`

---

## 🚀 Production Improvements

### 1. Use SendGrid for Email (Recommended)

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

Benefits:
- 100,000 free emails/month
- Better deliverability
- No daily limits
- Email analytics

### 2. Add Custom Domain

**Frontend:**
1. Buy domain (e.g., stegagen.com)
2. Add to Vercel → Settings → Domains
3. Update DNS records

**Auth Server:**
1. In Render, go to Settings
2. Add custom domain
3. Update DNS CNAME

### 3. Enable Rate Limiting

Add to `server/server.js`:

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // 100 requests per window
});

app.use('/api/', limiter);
```

Install:
```bash
npm install express-rate-limit
```

### 4. Add Monitoring

**Render:**
- Built-in logs and metrics
- Uptime monitoring

**External:**
- Sentry for error tracking
- UptimeRobot for monitoring

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Test locally (frontend + auth server + python backend)
- [ ] Update environment variables
- [ ] Commit all changes to Git

### Auth Server
- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Deploy on Render
- [ ] Add all environment variables
- [ ] Test health endpoint
- [ ] Copy service URL

### Frontend
- [ ] Update `.env.production` with auth server URL
- [ ] Push changes to GitHub
- [ ] Deploy on Vercel
- [ ] Add environment variables
- [ ] Copy Vercel URL

### Post-Deployment
- [ ] Update `FRONTEND_URL` in auth server
- [ ] Test signup flow
- [ ] Test email verification
- [ ] Test login
- [ ] Test image processing (Python backend)
- [ ] Verify all features work

---

## 💰 Costs

### Free Tier (Good for testing/small projects)
- **Vercel:** Free (100 GB bandwidth/month)
- **Render:** Free (750 hours/month)
- **Supabase:** Free (500 MB database, 2 GB bandwidth)
- **Gmail SMTP:** Free (500 emails/day)

**Total: $0/month** 🎉

### Recommended Paid (For production)
- **Vercel Pro:** $20/month (better performance)
- **Render Starter:** $7/month (no cold starts)
- **SendGrid:** Free → $19.95/month (100k emails)

**Total: ~$27-47/month**

---

## ✅ You're Done!

Your complete application is now deployed:

- ✅ Frontend on Vercel
- ✅ Auth server on Render
- ✅ Python backend on Render
- ✅ Database on Supabase
- ✅ Email verification working

**Test it:** Go to your Vercel URL and try signing up!

---

**Need help?** Check the individual deployment guides:
- `server/DEPLOY_QUICK.md` - Auth server quick deploy
- `AUTH_SERVER_DEPLOYMENT.md` - Detailed auth server guide
