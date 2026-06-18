# CORS Issue Fix Guide

## Problem
CORS error when accessing `https://stegagen-api.onrender.com/api/embed` from `https://steagnography-system.vercel.app`

## Root Causes
1. **Render Free Tier Sleep**: Service goes to sleep after 15 minutes of inactivity
2. **Cold Start Failures**: First request after wake-up often fails
3. **Missing CORS Headers**: Server might not be responding with proper headers

## Immediate Solutions

### Option 1: Wake Up the Service (Quick Test)
1. Open browser and visit: `https://stegagen-api.onrender.com/api/health`
2. Wait 30-60 seconds for the service to wake up
3. Refresh your frontend and try again

### Option 2: Verify Render Environment Variables
1. Go to your Render dashboard: https://dashboard.render.com
2. Select your `stegagen-api` service
3. Go to **Environment** tab
4. Verify these variables exist:
   ```
   ALLOWED_ORIGINS=https://steagnography-system.vercel.app
   MAX_CONTENT_LENGTH=209715200
   FLASK_ENV=production
   PYTHON_VERSION=3.11.9
   ```
5. If missing, add them and **trigger a manual deploy**

### Option 3: Update Flask CORS to Handle Cold Starts Better

Add better error handling and logging to the Flask app.

### Option 4: Add Frontend Retry Logic

Since Render free tier has cold starts, add retry logic in your frontend:

```javascript
// In your API service
const embedWithRetry = async (formData, maxRetries = 3) => {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await axios.post('/api/embed', formData);
      return response;
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      
      // If it's a network error (cold start), wait and retry
      if (error.code === 'ERR_NETWORK') {
        console.log(`Retry ${i + 1}/${maxRetries} - waiting for server wake-up...`);
        await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
        continue;
      }
      throw error;
    }
  }
};
```

## Long-term Solutions

### Option A: Upgrade Render Plan ($7/month)
- No cold starts
- Always online
- Better performance

### Option B: Keep Service Warm (Free)
Use a service like [UptimeRobot](https://uptimerobot.com/) to ping your API every 5 minutes:
- Ping URL: `https://stegagen-api.onrender.com/api/health`
- Interval: Every 5 minutes
- This keeps the service warm and prevents sleep

### Option C: Use Different Hosting
Consider alternatives:
- **Railway**: Similar to Render but better free tier
- **Fly.io**: Good free tier, no cold starts
- **PythonAnywhere**: Free tier for Flask apps

## Testing Steps

1. **Test API Health**:
   ```bash
   curl https://stegagen-api.onrender.com/api/health
   ```
   Should return: `{"status":"healthy","version":"1.0.0"}`

2. **Test CORS**:
   ```bash
   curl -H "Origin: https://steagnography-system.vercel.app" \
        -H "Access-Control-Request-Method: POST" \
        -X OPTIONS \
        https://stegagen-api.onrender.com/api/embed -v
   ```
   Should see `Access-Control-Allow-Origin` header in response

3. **Check Render Logs**:
   - Go to Render dashboard
   - Select your service
   - Click **Logs** tab
   - Look for errors or cold start messages

## Current Status Check

Run these checks:

- [ ] Visit health endpoint and confirm service wakes up
- [ ] Check Render dashboard shows service as "Live"
- [ ] Verify environment variables are set
- [ ] Check Render logs for any errors
- [ ] Test CORS with curl command above
- [ ] Try the embed operation from frontend after service is warm

## If Still Not Working

Check Render logs and look for:
- Python errors during startup
- Missing dependencies
- Memory/timeout issues
- Port binding errors

Then update this file with the specific error message.
