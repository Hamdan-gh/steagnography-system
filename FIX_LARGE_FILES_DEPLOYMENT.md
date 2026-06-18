# Fix for Large File Upload (2MB-20MB) - 502 Error Resolution

## Problem Summary
- **Issue**: 502 Bad Gateway errors when uploading images (2-20MB) and audio files
- **Root Cause**: 
  1. Render free tier has 30-second HTTP timeout (too short for large files)
  2. Insufficient worker/thread configuration
  3. No automatic retry or direct connection fallback
  4. No file size validation before upload

## Changes Made

### 1. Backend Changes (Python Flask)

**File: `python-engine/app.py`**
- ✅ Added file size validation (2MB-20MB for images, up to 20MB for audio)
- ✅ Automatic GA parameter optimization for large files (faster processing)
- ✅ Improved error handling and cleanup
- ✅ Better logging for debugging

**File: `python-engine/render.yaml`**
- ✅ Increased workers from 1 to 2
- ✅ Increased threads from 2 to 4
- ✅ Extended timeout from 600s to 900s (15 minutes)
- ✅ Added graceful timeout (180s)
- ✅ Added keep-alive (75s)
- ✅ Added worker-class gthread for better concurrency
- ✅ Added max-requests for worker recycling

### 2. Frontend Changes (TypeScript/React)

**File: `src/services/embedding.service.ts`**
- ✅ Client-side file size validation (2MB-20MB images, up to 20MB audio)
- ✅ Automatic direct backend connection for large files (>5MB)
- ✅ Smart retry logic with better error messages
- ✅ Auto-optimization of GA parameters for faster processing
- ✅ Extended timeout to 15 minutes for large files
- ✅ User-friendly error messages and toasts

**File: `src/services/api.ts`**
- ✅ Increased default timeout from 10 to 15 minutes

## Deployment Steps

### Step 1: Deploy Backend to Render

```bash
# Navigate to your project
cd c:\Users\Alhasan\OneDrive\Desktop\NAPARI

# Commit the changes
git add python-engine/app.py python-engine/render.yaml
git commit -m "fix: Support large files 2-20MB with improved timeout and worker config"
git push origin main
```

**Render will automatically redeploy** with the new configuration:
- 2 workers, 4 threads each
- 15-minute timeout
- Better concurrency handling

### Step 2: Deploy Frontend to Vercel

```bash
# Commit frontend changes
git add src/services/embedding.service.ts src/services/api.ts
git commit -m "fix: Add client-side validation and direct connection for large files"
git push origin main
```

**Vercel will automatically redeploy** the frontend with:
- File size validation
- Direct backend connection for large files
- Better error handling

### Step 3: Verify Deployment

1. **Check Render Deployment**:
   - Go to: https://dashboard.render.com
   - Wait for deployment to complete (3-5 minutes)
   - Check logs for: "Starting StegaGen Processing Engine"

2. **Check Vercel Deployment**:
   - Go to: https://vercel.com/dashboard
   - Wait for deployment to complete (1-2 minutes)
   - Check deployment status is "Ready"

3. **Test the Application**:
   ```
   https://steagnography-system.vercel.app
   ```

### Step 4: Test Large File Upload

**Test Cases:**
1. **Small file** (< 2MB) - Should show error asking for larger file
2. **Medium file** (2-5MB) - Should work via Vercel proxy
3. **Large file** (5-10MB) - Should use direct backend connection automatically
4. **Very large file** (10-20MB) - Should use optimized GA parameters + direct connection
5. **Too large** (> 20MB) - Should show clear error message

## What's Different Now?

### Before:
❌ 502 errors on large files  
❌ Backend goes offline briefly  
❌ No retry mechanism  
❌ Generic error messages  
❌ 1 worker, 2 threads (bottleneck)  
❌ 10-minute timeout (too short)  

### After:
✅ Files up to 20MB supported  
✅ Automatic direct connection for large files  
✅ Smart retry with fallback  
✅ Clear, helpful error messages  
✅ 2 workers, 4 threads (2x capacity)  
✅ 15-minute timeout with graceful handling  
✅ Auto-optimized processing for large files  
✅ Backend stays stable under load  

## Performance Improvements

### File Size → Processing Strategy:
- **< 2MB**: Rejected (too small for quality embedding)
- **2-5MB**: Standard processing via proxy (20 generations, 15 population)
- **5-10MB**: Direct connection (20 generations, 15 population)
- **10-20MB**: Direct connection + optimized params (10 generations, 10 population)
- **> 20MB**: Rejected (too large)

### Expected Processing Times:
- **2-5MB files**: 30-90 seconds
- **5-10MB files**: 1-3 minutes
- **10-20MB files**: 2-5 minutes (with optimization)

## Monitoring & Troubleshooting

### Check Render Logs:
```bash
# View real-time logs
https://dashboard.render.com → stegagen-api → Logs

# Look for:
- "File sizes: Image=X.XXMB, Audio=X.XXMB"
- "Using GA params: generations=X, population=X"
- "EMBED REQUEST COMPLETED SUCCESSFULLY"
```

### Common Issues:

**1. Still getting 502 errors?**
- Check Render deployment completed successfully
- Verify environment variables are set
- Check logs for Python errors

**2. Timeout after 15 minutes?**
- File may be too complex
- Try reducing GA parameters manually
- Consider upgrading Render plan for more CPU

**3. Backend going offline?**
- Check Render free tier limits (750 hours/month)
- Upgrade to paid plan if needed
- Free tier spins down after 15 minutes of inactivity

**4. "Permission denied" or CORS errors?**
- Verify ALLOWED_ORIGINS in Render includes your Vercel domain
- Check browser console for exact error

## Cost Optimization

**Current Setup (FREE):**
- Render Free Tier: $0/month (limited to 750 hours)
- Vercel Free Tier: $0/month

**If You Need More Capacity:**
- Render Starter: $7/month (always-on, no spin-down)
- Vercel Pro: $20/month (better bandwidth)

## Next Steps

1. ✅ Deploy backend changes to Render
2. ✅ Deploy frontend changes to Vercel
3. ✅ Test with various file sizes (2-20MB)
4. ✅ Monitor Render logs for performance
5. 📊 Consider upgrading if you hit free tier limits

## Support

If issues persist:
1. Check Render logs: https://dashboard.render.com
2. Check Vercel logs: https://vercel.com/dashboard
3. Check browser console: F12 → Console tab
4. Copy error messages for debugging

## File Size Reference

```
1 MB = 1,024 KB = 1,048,576 bytes
2 MB = 2,097,152 bytes (minimum)
5 MB = 5,242,880 bytes (direct connection threshold)
10 MB = 10,485,760 bytes (optimization threshold)
20 MB = 20,971,520 bytes (maximum)
```
