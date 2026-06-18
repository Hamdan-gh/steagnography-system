# Deploy CORS Fix - Step by Step

## Changes Made

1. **Enhanced CORS logging** in `app.py` to debug issues
2. **Created test script** (`test_cors.py`) to verify CORS configuration
3. **Created troubleshooting guide** (`CORS_FIX_GUIDE.md`)

## Deployment Steps

### Step 1: Test Locally First

```bash
# Navigate to python-engine directory
cd python-engine

# Install dependencies (if not already installed)
pip install -r requirements.txt

# Run the Flask app
python app.py
```

Keep this running and in another terminal:

```bash
# Test CORS locally (update test_cors.py to use http://localhost:5000)
python test_cors.py
```

### Step 2: Commit and Push Changes

```bash
# In the NAPARI root directory
git add python-engine/app.py
git add test_cors.py
git add CORS_FIX_GUIDE.md
git add DEPLOY_CORS_FIX.md

git commit -m "fix: Enhanced CORS configuration and added logging"

git push origin main
```

### Step 3: Deploy to Render

**Option A: Automatic Deploy (if connected to GitHub)**
- Render will automatically detect the push and redeploy
- Go to https://dashboard.render.com
- Watch the deployment logs

**Option B: Manual Deploy**
1. Go to https://dashboard.render.com
2. Select your `stegagen-api` service
3. Click **Manual Deploy** → **Deploy latest commit**
4. Wait for deployment to complete (~3-5 minutes)

### Step 4: Verify Environment Variables on Render

1. In Render dashboard, go to your service
2. Click **Environment** tab
3. Verify these variables exist:
   - `ALLOWED_ORIGINS` = `https://steagnography-system.vercel.app`
   - `MAX_CONTENT_LENGTH` = `209715200`
   - `FLASK_ENV` = `production`
   - `PYTHON_VERSION` = `3.11.9`

4. If missing, add them and click **Save Changes** (this will trigger a redeploy)

### Step 5: Test the Deployed API

**Wait 2-3 minutes after deployment completes, then:**

```bash
# Test the deployed API
python test_cors.py
```

**Or manually test:**

1. Open browser and visit: `https://stegagen-api.onrender.com/api/health`
   - Should return: `{"status":"healthy","version":"1.0.0","service":"StegaGen Processing Engine"}`

2. Test CORS with curl:
   ```bash
   curl -H "Origin: https://steagnography-system.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type" \
        -X OPTIONS \
        https://stegagen-api.onrender.com/api/embed -v
   ```
   
   Look for these headers in the response:
   - `Access-Control-Allow-Origin: https://steagnography-system.vercel.app`
   - `Access-Control-Allow-Methods: GET, POST, OPTIONS`

### Step 6: Test from Frontend

1. Open your frontend: `https://steagnography-system.vercel.app`
2. Try to embed audio in an image
3. Open browser DevTools → Console
4. Check for CORS errors

### Step 7: Check Render Logs

If still having issues:

1. Go to Render dashboard
2. Select your service
3. Click **Logs** tab
4. Look for:
   - "Request from origin: ..." messages (from our new logging)
   - "Response headers for ..." messages
   - Any error messages

## Common Issues & Solutions

### Issue 1: "Server is sleeping" or cold start
**Solution**: The free tier sleeps after 15 minutes. First request wakes it up but may timeout.
- Wait 30-60 seconds and try again
- Or use UptimeRobot to ping every 5 minutes

### Issue 2: CORS headers still missing
**Solution**: 
- Verify `ALLOWED_ORIGINS` environment variable on Render
- Check Render logs to see if origin is being logged
- Ensure latest code is deployed

### Issue 3: "Network Error" in frontend
**Solution**:
- Server might be starting up
- Check if `https://stegagen-api.onrender.com/api/health` responds
- Wait a minute and retry

### Issue 4: 500 Internal Server Error
**Solution**:
- Check Render logs for Python errors
- Might be missing dependencies
- Check memory/timeout limits

## Expected Results

After successful deployment:

✓ Health endpoint responds with 200 OK
✓ OPTIONS requests return CORS headers
✓ POST requests include `Access-Control-Allow-Origin` header
✓ Frontend can successfully make API requests
✓ No CORS errors in browser console

## Rollback Plan

If something goes wrong:

```bash
# Revert the changes
git revert HEAD

# Push the revert
git push origin main
```

Or in Render dashboard:
1. Go to **Events** tab
2. Find previous successful deployment
3. Click **Rollback to this version**

## Next Steps After Fix

Consider these improvements:

1. **Add retry logic** to frontend for handling cold starts
2. **Set up UptimeRobot** to keep service warm (free)
3. **Monitor API** with Render's built-in metrics
4. **Upgrade to paid plan** ($7/month) to eliminate cold starts

## Support

If you're still having issues after following these steps:
1. Share the output of `test_cors.py`
2. Share Render logs from the **Logs** tab
3. Share browser console errors with full stack trace
