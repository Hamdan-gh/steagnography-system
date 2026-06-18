# Complete Deployment Guide - Vercel + Render

This guide will help you deploy your StegaGen Secure application with:
- **Frontend**: Vercel (Free tier)
- **Backend**: Render (Free tier)
- **Database & Storage**: Supabase (Free tier)

---

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] GitHub account
- [ ] Vercel account (sign up at https://vercel.com)
- [ ] Render account (sign up at https://render.com)
- [ ] Supabase account (sign up at https://supabase.com)
- [ ] Git installed on your computer
- [ ] All code committed to a GitHub repository

---

## Part 1: Supabase Setup (Database & Storage)

### Step 1: Create Supabase Project

1. Go to https://supabase.com and sign in
2. Click **"New Project"**
3. Fill in details:
   - **Name**: `stegagen-secure`
   - **Database Password**: (save this somewhere safe)
   - **Region**: Choose closest to your users
   - **Plan**: Free
4. Click **"Create new project"**
5. Wait 2-3 minutes for setup to complete

### Step 2: Set Up Database Schema

1. In your Supabase dashboard, go to **SQL Editor** (left sidebar)
2. Click **"New Query"**
3. Open the file `supabase-schema.sql` from your project
4. Copy the entire content and paste it into the SQL Editor
5. Click **"Run"** (or press Ctrl+Enter)
6. You should see "Success. No rows returned"

### Step 3: Create Storage Buckets

1. Go to **Storage** (left sidebar)
2. Click **"Create a new bucket"**
3. Create three buckets:

   **Bucket 1: images**
   - Name: `images`
   - Public: ✅ Yes
   - File size limit: 50 MB
   - Allowed MIME types: `image/png,image/jpeg,image/jpg`
   - Click "Create bucket"

   **Bucket 2: audio**
   - Name: `audio`
   - Public: ❌ No (Private)
   - File size limit: 50 MB
   - Allowed MIME types: `audio/wav,audio/mpeg,audio/mp3`
   - Click "Create bucket"

   **Bucket 3: stego-images**
   - Name: `stego-images`
   - Public: ❌ No (Private)
   - File size limit: 50 MB
   - Allowed MIME types: `image/png`
   - Click "Create bucket"

### Step 4: Get Supabase Credentials

1. Go to **Settings** → **API** (left sidebar)
2. Copy and save these values:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGc...
   ```
3. Keep these safe - you'll need them later!

### Step 5: Configure CORS (Important!)

1. In Settings → API
2. Scroll to **CORS Configuration**
3. Add these allowed origins:
   ```
   http://localhost:5173
   http://localhost:3000
   https://*.vercel.app
   https://your-custom-domain.com (if you have one)
   ```
4. Click **"Save"**

---

## Part 2: Backend Deployment (Render)

### Step 1: Prepare Your Code

1. Make sure your code is committed to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. Verify these files exist in `python-engine/` folder:
   - ✅ `Procfile`
   - ✅ `requirements.txt` (with gunicorn)
   - ✅ `render.yaml`
   - ✅ `.env.production`

### Step 2: Create Render Web Service

1. Go to https://render.com and sign in
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub account (if not already connected)
4. Select your repository
5. Configure the service:

   **Basic Settings:**
   - Name: `stegagen-api`
   - Region: Choose closest to your users
   - Branch: `main`
   - Root Directory: `python-engine`
   - Runtime: `Python 3`

   **Build & Deploy:**
   - Build Command: `pip install --upgrade pip && pip install -r requirements.txt`
   - Start Command: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 300`

   **Plan:**
   - Select **"Free"** (0 cost)

6. Click **"Advanced"** and add Environment Variables:

   | Key | Value |
   |-----|-------|
   | `PYTHON_VERSION` | `3.11.0` |
   | `FLASK_ENV` | `production` |
   | `FLASK_DEBUG` | `False` |
   | `MAX_CONTENT_LENGTH` | `209715200` |
   | `SECRET_KEY` | (generate random string: use https://randomkeygen.com/) |

7. Click **"Create Web Service"**

### Step 3: Wait for Deployment

1. Render will now build and deploy your backend
2. This takes 5-10 minutes the first time
3. Watch the logs for any errors
4. Once you see "Build succeeded" and "Deploy succeeded", you're ready!

### Step 4: Get Your Backend URL

1. On your Render dashboard, you'll see your service URL:
   ```
   https://stegagen-api.onrender.com
   ```
2. **Copy this URL** - you'll need it for Vercel!

### Step 5: Test Your Backend

1. Visit: `https://your-app.onrender.com/api/health`
2. You should see:
   ```json
   {
     "status": "healthy",
     "version": "1.0.0",
     "service": "StegaGen Processing Engine"
   }
   ```
3. ✅ Backend is working!

**Important Note about Render Free Tier:**
- Free services spin down after 15 minutes of inactivity
- First request after inactivity takes ~30-60 seconds to wake up
- This is normal and expected behavior

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend Configuration

1. Update your `.env.production` file with real values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   VITE_PROCESSING_ENGINE_URL=https://stegagen-api.onrender.com
   VITE_APP_NAME=StegaGen Secure
   VITE_APP_VERSION=1.0.0
   ```

2. **Important**: Do NOT commit this file with real credentials!
   Add to `.gitignore`:
   ```
   .env.production
   ```

### Step 2: Deploy to Vercel

**Method A: Using Vercel Website (Recommended)**

1. Go to https://vercel.com and sign in
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Add Environment Variables:
   
   Click **"Environment Variables"** and add:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `VITE_SUPABASE_ANON_KEY` | `eyJhbGc...` |
   | `VITE_PROCESSING_ENGINE_URL` | `https://stegagen-api.onrender.com` |
   | `VITE_APP_NAME` | `StegaGen Secure` |
   | `VITE_APP_VERSION` | `1.0.0` |

6. Click **"Deploy"**

**Method B: Using Vercel CLI**

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   vercel --prod
   ```

4. Follow prompts and add environment variables when asked

### Step 3: Wait for Deployment

1. Vercel will build your frontend (takes 2-3 minutes)
2. Watch the build logs for errors
3. Once complete, you'll get a URL like:
   ```
   https://stegagen-secure.vercel.app
   ```

### Step 4: Update Supabase CORS

1. Go back to Supabase → Settings → API
2. Add your Vercel URL to allowed origins:
   ```
   https://stegagen-secure.vercel.app
   ```
3. Save changes

---

## Part 4: Final Configuration & Testing

### Step 1: Update Backend CORS

1. Go to Render dashboard
2. Open your `stegagen-api` service
3. Go to **Environment** tab
4. Add new environment variable:
   
   | Key | Value |
   |-----|-------|
   | `ALLOWED_ORIGINS` | `https://your-app.vercel.app` |

5. Or update `python-engine/app.py` directly:
   ```python
   from flask_cors import CORS
   
   # Allow your Vercel domain
   CORS(app, origins=[
       "http://localhost:5173",
       "https://your-app.vercel.app"
   ])
   ```

6. Commit and push changes (Render will auto-deploy)

### Step 2: Test Complete Flow

Open your Vercel URL and test:

1. **Test 1: Registration**
   - [ ] Go to Sign Up page
   - [ ] Create new account
   - [ ] Check email for confirmation
   - [ ] Confirm email

2. **Test 2: Login**
   - [ ] Login with credentials
   - [ ] Should redirect to dashboard

3. **Test 3: File Upload**
   - [ ] Go to Embed page
   - [ ] Upload cover image (PNG/JPG)
   - [ ] Upload audio file (WAV/MP3)
   - [ ] Enter encryption key
   - [ ] Click "Embed Audio"
   - [ ] Wait for processing (may take 30-60s first time due to Render cold start)
   - [ ] Download stego image

4. **Test 4: Extraction**
   - [ ] Go to Extract page
   - [ ] Upload the stego image
   - [ ] Enter same encryption key
   - [ ] Click "Extract Audio"
   - [ ] Download extracted audio
   - [ ] Verify it matches original

5. **Test 5: History**
   - [ ] Go to History page
   - [ ] See your embedding/extraction records
   - [ ] View metrics

### Step 3: Mobile Testing

1. Open on phone browser
2. Test all features
3. Check responsive design

---

## 🎯 Deployment Checklist

### Pre-Deployment
- [x] Code committed to GitHub
- [x] `.env.production` created but NOT committed
- [x] `Procfile` exists in `python-engine/`
- [x] `gunicorn` added to `requirements.txt`
- [x] Supabase project created
- [x] Database schema executed
- [x] Storage buckets created

### Backend (Render)
- [ ] Render account created
- [ ] Web service deployed
- [ ] Environment variables configured
- [ ] Health endpoint working
- [ ] Backend URL copied

### Frontend (Vercel)
- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] Environment variables added
- [ ] Build successful
- [ ] Frontend URL obtained

### Final Configuration
- [ ] Supabase CORS updated with Vercel URL
- [ ] Backend CORS allows Vercel domain
- [ ] All features tested end-to-end
- [ ] Mobile responsiveness checked

---

## 📊 Service URLs Summary

After deployment, save these URLs:

```
Frontend (Vercel):  https://your-app.vercel.app
Backend (Render):   https://stegagen-api.onrender.com
Database (Supabase): https://xxxxx.supabase.co
```

---

## ⚡ Performance Notes

### Render Free Tier
- ✅ Free forever
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold start takes 30-60 seconds
- ✅ Auto-deploys on git push
- ✅ 750 hours/month free

### Vercel Free Tier
- ✅ 100 GB bandwidth/month
- ✅ Unlimited deployments
- ✅ Instant cache globally
- ✅ Auto-deploys on git push
- ✅ Free SSL certificate
- ✅ No cold starts

### Supabase Free Tier
- ✅ 500 MB database
- ✅ 1 GB file storage
- ✅ 50,000 monthly active users
- ✅ 2 GB bandwidth/month

---

## 🔧 Troubleshooting

### Issue 1: Backend Not Responding

**Symptoms**: Frontend shows "Network Error" or "Processing Engine Unavailable"

**Solutions**:
1. Check if backend URL is correct in Vercel environment variables
2. Visit backend health endpoint: `https://your-api.onrender.com/api/health`
3. If cold start, wait 30-60 seconds and retry
4. Check Render logs for errors

### Issue 2: CORS Errors

**Symptoms**: Browser console shows "CORS policy blocked"

**Solutions**:
1. Verify Vercel URL is added to Supabase CORS settings
2. Check backend allows Vercel domain in CORS
3. Clear browser cache
4. Wait 5 minutes for settings to propagate

### Issue 3: File Upload Fails

**Symptoms**: Upload starts but fails with error

**Solutions**:
1. Check file size (max 50MB)
2. Verify storage buckets exist in Supabase
3. Check Supabase RLS policies are correct
4. Ensure user is logged in

### Issue 4: Authentication Issues

**Symptoms**: Can't login or signup fails

**Solutions**:
1. Verify Supabase URL and anon key in Vercel
2. Check email confirmation is enabled in Supabase
3. Check Supabase Auth settings
4. Look for errors in browser console

### Issue 5: Build Fails on Vercel

**Symptoms**: Deployment fails during build

**Solutions**:
1. Check build logs for specific error
2. Verify all dependencies in `package.json`
3. Test build locally: `npm run build`
4. Ensure Node version compatibility

### Issue 6: Slow First Request

**Symptoms**: First embedding/extraction takes very long

**Solutions**:
1. This is normal for Render free tier (cold start)
2. Backend spins down after 15 min inactivity
3. First request wakes it up (30-60 seconds)
4. Subsequent requests are fast
5. Consider upgrading to paid tier if needed

---

## 🚀 Post-Deployment Optimization

### 1. Add Custom Domain (Optional)

**Vercel:**
1. Go to Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

**Render:**
1. Go to Settings → Custom Domain
2. Add domain
3. Update DNS records

### 2. Set Up Monitoring

**Uptime Monitoring** (Free):
- UptimeRobot: https://uptimerobot.com
- Pingdom: https://www.pingdom.com

**Error Tracking**:
```bash
npm install @sentry/react
```

### 3. Enable Analytics

Google Analytics:
1. Create GA4 property
2. Add tracking code to `index.html`

### 4. Improve Performance

- Enable Vercel Edge Functions
- Add service worker for offline support
- Implement image optimization
- Use Vercel Image Optimization

---

## 💰 Cost Breakdown

### Current Setup (All Free!)

| Service | Plan | Cost | Limits |
|---------|------|------|--------|
| Vercel | Free | $0/mo | 100GB bandwidth |
| Render | Free | $0/mo | 750 hours/mo |
| Supabase | Free | $0/mo | 500MB database |
| **Total** | | **$0/mo** | |

### If You Need to Upgrade

| Service | Paid Plan | Cost | Benefits |
|---------|-----------|------|----------|
| Vercel | Pro | $20/mo | More bandwidth, faster builds |
| Render | Starter | $7/mo | No cold starts, always on |
| Supabase | Pro | $25/mo | 8GB database, 100GB storage |

---

## 📝 Maintenance Tasks

### Weekly
- [ ] Check error logs
- [ ] Monitor usage statistics
- [ ] Review user feedback

### Monthly
- [ ] Update dependencies
- [ ] Check security advisories
- [ ] Review performance metrics
- [ ] Backup database

### Quarterly
- [ ] Security audit
- [ ] Performance optimization
- [ ] User experience review

---

## 🎉 Success!

Your StegaGen Secure application is now live!

- ✅ Globally distributed frontend
- ✅ Scalable backend API
- ✅ Secure database & storage
- ✅ SSL/HTTPS enabled
- ✅ Auto-deployments configured
- ✅ $0/month cost

**Share your app**: `https://your-app.vercel.app`

---

## 📞 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Project Issues**: Create issue on GitHub

---

## 🔄 Continuous Deployment

Every time you push to GitHub:
1. Vercel auto-deploys frontend (2-3 min)
2. Render auto-deploys backend (5-10 min)
3. No manual steps needed!

To deploy:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

That's it! 🚀
