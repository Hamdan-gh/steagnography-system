# ⚡ Quick Deploy Checklist

Use this as a quick reference while deploying.

---

## 🎯 Phase 1: Supabase (15 minutes)

1. **Create Project**
   - [ ] Go to https://supabase.com
   - [ ] New Project → name: `stegagen-secure`
   - [ ] Save database password

2. **Setup Database**
   - [ ] SQL Editor → New Query
   - [ ] Copy/paste `supabase-schema.sql`
   - [ ] Run query

3. **Create Buckets**
   - [ ] `images` (public, 50MB)
   - [ ] `audio` (private, 50MB)
   - [ ] `stego-images` (private, 50MB)

4. **Get Credentials**
   - [ ] Settings → API
   - [ ] Copy Project URL
   - [ ] Copy anon key

---

## 🔧 Phase 2: Render Backend (20 minutes)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Create Service**
   - [ ] https://render.com → New → Web Service
   - [ ] Connect GitHub repo
   - [ ] Name: `stegagen-api`
   - [ ] Root Directory: `python-engine`
   - [ ] Runtime: Python 3
   - [ ] Build: `pip install --upgrade pip && pip install -r requirements.txt`
   - [ ] Start: `gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 300`

3. **Add Environment Variables**
   ```
   PYTHON_VERSION = 3.11.0
   FLASK_ENV = production
   FLASK_DEBUG = False
   MAX_CONTENT_LENGTH = 209715200
   SECRET_KEY = [generate random string]
   ```

4. **Deploy & Test**
   - [ ] Click "Create Web Service"
   - [ ] Wait 5-10 minutes
   - [ ] Copy service URL
   - [ ] Test: `https://your-api.onrender.com/api/health`

---

## 🌐 Phase 3: Vercel Frontend (10 minutes)

1. **Deploy**
   - [ ] https://vercel.com → New Project
   - [ ] Import GitHub repo
   - [ ] Framework: Vite
   - [ ] Build: `npm run build`
   - [ ] Output: `dist`

2. **Add Environment Variables**
   ```
   VITE_SUPABASE_URL = [from Supabase]
   VITE_SUPABASE_ANON_KEY = [from Supabase]
   VITE_PROCESSING_ENGINE_URL = [from Render]
   VITE_APP_NAME = StegaGen Secure
   VITE_APP_VERSION = 1.0.0
   ```

3. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Wait 2-3 minutes
   - [ ] Copy Vercel URL

---

## ✅ Phase 4: Final Setup (5 minutes)

1. **Update CORS**
   - [ ] Supabase → Settings → API → CORS
   - [ ] Add Vercel URL
   - [ ] Save

2. **Test Everything**
   - [ ] Open Vercel URL
   - [ ] Sign up
   - [ ] Embed audio
   - [ ] Extract audio
   - [ ] Check history

---

## 🎉 Done!

**Your URLs:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://stegagen-api.onrender.com`
- Database: `https://xxxxx.supabase.co`

**Total Time**: ~50 minutes
**Total Cost**: $0

---

## 🚨 Common Issues

**Backend not responding?**
→ Wait 60 seconds (cold start on free tier)

**CORS error?**
→ Add Vercel URL to Supabase CORS settings

**Build failed?**
→ Check environment variables are correct

**Upload fails?**
→ Check storage buckets exist in Supabase

---

## 📱 Share Your App

```
🎵 StegaGen Secure - Hide audio in images!
🔗 https://your-app.vercel.app
```
