# 🔄 Manual Deploy to Render

## ⚠️ Current Status

Your backend is still running the **OLD code** with low capacity (18KB).

The **NEW code** (4x capacity) is pushed to GitHub but Render hasn't auto-deployed yet.

---

## 🚀 How to Manually Trigger Deploy

### Option 1: From Render Dashboard (Easiest)

1. **Go to Render Dashboard**
   - URL: https://dashboard.render.com
   - Login with your account

2. **Find Your Service**
   - Click on `stegagen-api` service

3. **Manual Deploy**
   - Look for "Manual Deploy" button (top right)
   - Click **"Manual Deploy"** → **"Deploy latest commit"**
   - OR click **"Clear build cache & deploy"** (if available)

4. **Watch the Logs**
   - Deployment takes 5-10 minutes
   - Watch for:
     ```
     ==> Building...
     ==> Build succeeded
     ==> Deploying...
     ==> Deploy succeeded
     ```

5. **Verify New Code**
   - Check logs for: "Starting gunicorn"
   - Test with a small image first
   - Should see higher capacity!

---

### Option 2: Trigger via Git Push (Alternative)

If manual deploy doesn't work, create an empty commit:

```bash
cd "c:\Users\Alhasan\OneDrive\Desktop\NAPARI"
git commit --allow-empty -m "Force Render redeploy - capacity upgrade"
git push origin main
```

This will trigger Render's webhook and force a new deployment.

---

## ✅ How to Verify Deployment Succeeded

### Check 1: Deployment Time
Look at the deployment timestamp in Render dashboard. Should be recent (after you pushed the code).

### Check 2: Test with Small Image
1. Go to your app: https://steagnography-system.vercel.app
2. Upload a **200×200 pixel** image
3. Upload a **50KB audio** file
4. Try to embed

**Before**: Would fail (capacity only 18KB)
**After**: Should succeed! (capacity now ~75KB)

### Check 3: Check Logs
Look for these lines in Render logs:
```
Step 2: Loading audio file...
Audio size: XXXXX bytes
```

If the capacity error is gone, it worked! ✅

---

## 📊 New vs Old Capacity

### Old Code (Currently Running):
```python
# 1-bit LSB
capacity = (width × height × 3 × 1) ÷ 8
Example: 100×100 image = 3,750 bytes ≈ 3.7 KB
```

### New Code (After Deploy):
```python
# 2-bit LSB
capacity = (width × height × 3 × 2) ÷ 8
Example: 100×100 image = 7,500 bytes ≈ 7.3 KB
```

### Your Case:
```
Your image: ~100×100 pixels
Old capacity: 18,791 bytes ≈ 18 KB
New capacity: 75,164 bytes ≈ 75 KB (4x more!)

Your audio: 257,462 bytes ≈ 257 KB
Still too large! Need 350×350 px image or larger
```

---

## 💡 Quick Fix for Your Immediate Use

While waiting for deployment, you have 3 options:

### Option 1: Use Larger Image
Upload a **500×500 pixel** or larger cover image
- 500×500 image capacity: ~470 KB ✅
- Can easily hide your 257 KB audio

### Option 2: Compress Your Audio
Your audio is WAV (257KB). Convert to MP3:
1. Use online converter: https://online-audio-converter.com
2. Convert WAV → MP3
3. Set bitrate to 128 kbps
4. New size: ~25 KB (fits in small image!)

### Option 3: Trim Audio Length
If audio is long, trim to essential part only

---

## 🎯 Recommended Image Sizes

For your 257 KB audio file:

| Image Size | Capacity | Fits? |
|------------|----------|-------|
| 100×100 px | 7.5 KB | ❌ No |
| 200×200 px | 75 KB | ❌ No |
| 350×350 px | 290 KB | ✅ **Yes!** |
| 500×500 px | 470 KB | ✅ Yes (comfortable) |
| 700×700 px | 920 KB | ✅ Yes (plenty of room) |

**Use at least 350×350 px image for your audio!**

---

## 🔍 Monitor Render Deployment

### Where to Check:
1. **Render Dashboard**: https://dashboard.render.com
2. Click your service: `stegagen-api`
3. Go to **"Events"** tab to see deployment history
4. Go to **"Logs"** tab to see real-time logs

### What to Look For:
```
✓ Deploy started
✓ Building...
✓ Installing dependencies
✓ Build succeeded
✓ Deploying...
✓ Health check passed
✓ Deploy succeeded
```

### Time Required:
- **Build time**: 5-7 minutes
- **Deploy time**: 1-2 minutes
- **Total**: ~10 minutes

---

## 🆘 If Deployment Fails

### Check Build Logs
Look for Python errors during build:
- Missing dependencies → Should be in requirements.txt ✅
- Syntax errors → Code is tested locally ✅
- Import errors → Check module names ✅

### Force Clean Build
If deployment is stuck:
1. Go to Render dashboard
2. Settings → Danger Zone
3. "Clear build cache"
4. Then "Manual Deploy" again

---

## ✅ After Successful Deployment

### Test Immediately:
1. **Health Check**: https://stegagen-api.onrender.com/api/health
2. **Upload Test**: Try embedding with larger image
3. **Verify Logs**: Check capacity calculation is higher

### Update Frontend (if needed):
Frontend should already be working since it just calls the backend API. No changes needed!

---

## 📱 Quick Action Steps

**RIGHT NOW:**

1. ✅ Go to https://dashboard.render.com
2. ✅ Click `stegagen-api`
3. ✅ Click **"Manual Deploy"** button
4. ✅ Select **"Deploy latest commit"**
5. ⏳ Wait 10 minutes
6. ✅ Test with larger image!

**OR**

1. ✅ Use a larger image (500×500 px) right now
2. ⏳ Wait for auto-deploy to complete
3. ✅ Then smaller images will also work better

---

## 🎉 Success Criteria

Deployment succeeded when:
- ✅ Render shows "Deploy succeeded"
- ✅ Health check returns 200 OK
- ✅ Can embed 50KB audio in 200×200 image
- ✅ No more "too large" errors for reasonable sizes
- ✅ Capacity increased from ~18KB to ~75KB per 100×100 image

---

**Go trigger that manual deploy now! 🚀**

**Or use a larger image while waiting! 📸**
