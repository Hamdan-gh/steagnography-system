# 🚨 Emergency 502 Fix Guide

## Current Issue
```
Access to XMLHttpRequest at 'https://stegagen-api.onrender.com/api/embed' 
has been blocked by CORS policy: No 'Access-Control-Allow-Origin' header 
is present on the requested resource.

POST https://stegagen-api.onrender.com/api/embed net::ERR_FAILED 502 (Bad Gateway)
```

## Root Cause
**The backend is DOWN (502 Bad Gateway)** - When the backend crashes or is offline, it can't send CORS headers, causing the CORS error. The CORS error is a **symptom**, not the cause.

---

## 🔍 Step 1: Check if Backend is Actually Running

Open in browser:
```
https://stegagen-api.onrender.com/api/health
```

### Expected Response (Good):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "StegaGen Processing Engine"
}
```

### If You Get:
- ❌ **502 Bad Gateway** → Backend crashed or not deployed
- ❌ **503 Service Unavailable** → Backend spinning up (wait 30-60 seconds)
- ❌ **Timeout** → Backend not responding
- ✅ **JSON response** → Backend is up (different issue)

---

## 🚀 Step 2: Force Render Redeploy

### Option A: Via Render Dashboard (Recommended)
1. Go to: https://dashboard.render.com
2. Click on **stegagen-api** service
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait 3-5 minutes for deployment
5. Check logs for errors

### Option B: Via Git Push (If no changes)
```bash
# Empty commit to trigger redeploy
git commit --allow-empty -m "redeploy: Force Render redeploy to fix 502"
git push origin main
```

### Option C: Restart Service
1. Go to: https://dashboard.render.com
2. Click on **stegagen-api**
3. Click **Settings** → **Suspend Web Service**
4. Wait 30 seconds
5. Click **Resume Web Service**

---

## 📊 Step 3: Check Render Logs

1. Go to: https://dashboard.render.com/web/srv-xxxx (your service)
2. Click **Logs** tab
3. Look for errors:

### Good Logs:
```
✓ All processing modules loaded successfully
Starting StegaGen Processing Engine
Server: http://0.0.0.0:5000
[INFO] Listening at: http://0.0.0.0:10000
```

### Bad Logs (Common Issues):
```
❌ CRITICAL: Failed to import processing modules
   → Fix: Check requirements.txt has all dependencies

❌ ModuleNotFoundError: No module named 'embed_audio'
   → Fix: Ensure all .py files are in git

❌ Out of memory
   → Fix: Reduce worker count or upgrade plan

❌ Application timeout
   → Fix: Already done (increased to 900s)

❌ Worker boot timeout
   → Fix: Increase build time or check dependencies
```

---

## 🔧 Step 4: Verify Render Configuration

Check these settings in Render Dashboard:

### Build Command:
```bash
pip install --upgrade pip && pip install -r requirements.txt
```

### Start Command:
```bash
gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --threads 4 --timeout 900 --graceful-timeout 180 --keep-alive 75 --log-level info --worker-class gthread --max-requests 100 --max-requests-jitter 10
```

### Environment Variables:
- ✅ `PYTHON_VERSION` = `3.11.9`
- ✅ `FLASK_ENV` = `production`
- ✅ `MAX_CONTENT_LENGTH` = `209715200`
- ✅ `ALLOWED_ORIGINS` = `https://steagnography-system.vercel.app`

### Health Check:
- ✅ Path: `/api/health`

---

## 🐛 Step 5: Common 502 Causes & Fixes

### Cause 1: Free Tier Spin-Down
**Symptom**: First request takes 30-60 seconds, then works  
**Why**: Render free tier sleeps after 15 minutes of inactivity  
**Fix**: 
- Wait 60 seconds after first request
- OR upgrade to Render Starter ($7/month - always on)

### Cause 2: Out of Memory
**Symptom**: Works for small files, crashes on large files  
**Why**: Processing 20MB images requires significant RAM  
**Fix**: 
```yaml
# In render.yaml, reduce workers
workers: 1  # Instead of 2
threads: 2  # Instead of 4
```

### Cause 3: Worker Timeout
**Symptom**: Backend stops responding mid-request  
**Why**: Worker crashes during processing  
**Check logs for**: `worker timeout` or `SIGKILL`  
**Fix**: Already applied (900s timeout)

### Cause 4: Import Errors
**Symptom**: 502 immediately on any request  
**Why**: Python modules missing or broken  
**Check**: Render build logs for import errors  
**Fix**: Ensure all modules in requirements.txt

### Cause 5: Port Binding Issue
**Symptom**: Build succeeds, but service won't start  
**Why**: App not binding to correct port  
**Check**: Start command uses `$PORT` variable  
**Fix**: Use `--bind 0.0.0.0:$PORT`

---

## 🩹 Quick Fix: Temporarily Lower Requirements

If backend keeps crashing, edit `python-engine/render.yaml`:

```yaml
startCommand: gunicorn app:app --bind 0.0.0.0:$PORT --workers 1 --threads 2 --timeout 600 --log-level debug
```

Then:
```bash
git add python-engine/render.yaml
git commit -m "fix: Reduce workers to prevent OOM on free tier"
git push origin main
```

---

## 🧪 Step 6: Test Backend Directly

### Test 1: Health Check
```bash
curl https://stegagen-api.onrender.com/api/health
```

Expected: `{"status":"healthy",...}`

### Test 2: CORS Headers
```bash
curl -H "Origin: https://steagnography-system.vercel.app" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://stegagen-api.onrender.com/api/embed \
     -v
```

Look for:
```
< Access-Control-Allow-Origin: https://steagnography-system.vercel.app
< Access-Control-Allow-Methods: GET, POST, OPTIONS
```

### Test 3: Upload Small File (via curl)
```bash
curl -X POST https://stegagen-api.onrender.com/api/embed \
  -F "cover_image=@test_image.png" \
  -F "audio_file=@test_audio.wav" \
  -F "encryption_key=test123" \
  -H "Origin: https://steagnography-system.vercel.app"
```

---

## 🎯 Most Likely Issue: Free Tier Spin-Down

**Your backend is probably asleep!**

Render free tier:
- ✅ 750 hours/month free
- ⏰ Spins down after 15 minutes idle
- 🐌 Takes 30-60 seconds to wake up on first request

**Solution 1: Wait**
- Try request again in 60 seconds
- Backend should be awake by then

**Solution 2: Keep-Alive Ping**
Set up a cron job to ping every 10 minutes:
```bash
# Use cron-job.org or similar
GET https://stegagen-api.onrender.com/api/health
Every 10 minutes
```

**Solution 3: Upgrade** ($7/month)
- Render Starter plan
- Always-on (no spin-down)
- Faster instance

---

## 📝 Checklist

Run through these in order:

- [ ] 1. Check https://stegagen-api.onrender.com/api/health in browser
- [ ] 2. If 502/503, wait 60 seconds and try again
- [ ] 3. Still down? Check Render logs for errors
- [ ] 4. Still down? Force redeploy from Render dashboard
- [ ] 5. Still down? Check Render build logs
- [ ] 6. Still down? Reduce workers to 1 and redeploy
- [ ] 7. Working? Try upload again from frontend

---

## 🆘 If Nothing Works

### Nuclear Option: Recreate Service

1. **Export Current Settings**:
   - Go to Render dashboard
   - Copy all environment variables
   - Copy start command

2. **Delete Service**:
   - Settings → Delete Web Service

3. **Create New Service**:
   - Connect GitHub repo
   - Root directory: `python-engine`
   - Build command: `pip install -r requirements.txt`
   - Start command: `gunicorn app:app --bind 0.0.0.0:$PORT`
   - Add environment variables

4. **Wait for Deploy**:
   - 5-10 minutes
   - Check logs

---

## 📞 Get Help

**Render Status**: https://status.render.com  
**Render Support**: https://render.com/support  
**Community**: https://community.render.com  

---

## Summary

The CORS error is NOT the problem - it's a symptom of the backend being down (502).

**Most likely cause**: Free tier spin-down (wait 60 seconds)  
**Second most likely**: Out of memory (reduce workers)  
**Third most likely**: Import error (check logs)  

**Next step**: Open https://stegagen-api.onrender.com/api/health and tell me what you see!
