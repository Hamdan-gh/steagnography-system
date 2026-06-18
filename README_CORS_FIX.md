# CORS Issue Fix - Complete Package

## 🚨 Quick Start

**Having CORS errors?** Run this immediately:

### Windows:
```bash
diagnose.bat
```

### Mac/Linux:
```bash
python quick_diagnosis.py
```

This will tell you exactly what's wrong in 30 seconds.

---

## 📋 What's Included

This package contains everything needed to diagnose and fix CORS issues:

### Diagnostic Tools
1. **`diagnose.bat`** (Windows) - Double-click to run diagnosis
2. **`quick_diagnosis.py`** - Fast status check (30 seconds)
3. **`test_cors.py`** - Comprehensive CORS test suite

### Documentation
4. **`CORS_ISSUE_SUMMARY.md`** - Complete overview (READ THIS FIRST)
5. **`CORS_FIX_GUIDE.md`** - Detailed troubleshooting guide
6. **`DEPLOY_CORS_FIX.md`** - Step-by-step deployment instructions

### Code Fixes
7. **`python-engine/app.py`** - Enhanced with CORS logging
8. **`python-engine/requirements.txt`** - Updated dependencies

---

## 🎯 The Problem

```
CORS policy: No 'Access-Control-Allow-Origin' header is present
```

### Root Cause
Your Render free tier API **goes to sleep** after 15 minutes of inactivity. When your frontend tries to access it:
1. Request hits sleeping server
2. Server starts waking up (30-60 seconds)
3. Request times out before server is ready
4. Browser shows CORS error (even though CORS is configured correctly!)

---

## ✅ The Solution

### Immediate Fix (30 seconds)
1. Open browser: `https://stegagen-api.onrender.com/api/health`
2. Wait 60 seconds for server to wake up
3. Try your frontend again

### Short-term Fix (5 minutes)
Deploy the enhanced code with better logging:
```bash
git add .
git commit -m "fix: Enhanced CORS with diagnostics"
git push origin main
```

### Long-term Fix (Free)
Use [UptimeRobot](https://uptimerobot.com) to ping your API every 5 minutes:
- Keeps server awake 24/7
- Free forever
- Setup takes 2 minutes

---

## 🔍 Diagnosis Tools

### Tool 1: Quick Diagnosis (Use This First)
```bash
python quick_diagnosis.py
```
**Output**: ✓ or ✗ for each test + specific actions to take

**When to use**: Every time you have a CORS error

### Tool 2: Comprehensive Tests
```bash
python test_cors.py
```
**Output**: Detailed CORS configuration report

**When to use**: After deploying fixes, to verify everything works

### Tool 3: Windows Batch Script
```bash
diagnose.bat
```
**What it does**: Installs dependencies + runs quick diagnosis

**When to use**: If you prefer double-clicking vs command line

---

## 📖 Documentation Guide

### Start Here
**`CORS_ISSUE_SUMMARY.md`** - Complete overview
- What's the problem?
- What did we fix?
- What should you do next?

### Troubleshooting
**`CORS_FIX_GUIDE.md`** - When things go wrong
- Detailed error explanations
- Step-by-step solutions
- Testing procedures
- Alternative hosting options

### Deployment
**`DEPLOY_CORS_FIX.md`** - How to deploy fixes
- Local testing instructions
- Git commit/push commands
- Render deployment steps
- Verification procedures
- Rollback plan

---

## 🚀 Step-by-Step Workflow

### For Developers

```bash
# 1. Diagnose the issue
python quick_diagnosis.py

# 2. If server is sleeping:
#    Open https://stegagen-api.onrender.com/api/health in browser
#    Wait 60 seconds

# 3. If CORS is misconfigured:
#    Check Render environment variables
#    Verify ALLOWED_ORIGINS=https://steagnography-system.vercel.app

# 4. Deploy enhanced code
git add .
git commit -m "fix: Enhanced CORS configuration"
git push origin main

# 5. Wait for Render to deploy (3-5 minutes)

# 6. Test again
python test_cors.py

# 7. Test from frontend
#    Open https://steagnography-system.vercel.app
#    Try embedding audio
```

### For Non-Developers

1. **Double-click** `diagnose.bat` (Windows) or run `python quick_diagnosis.py` (Mac/Linux)
2. **Read the output** - it tells you exactly what's wrong
3. **If "Server is sleeping"**: 
   - Open `https://stegagen-api.onrender.com/api/health` in your browser
   - Wait 1 minute
   - Try your app again
4. **If "CORS missing"**: Contact your developer with the diagnosis output

---

## 🎯 Expected Results

### Before Fix
```
✗ CORS policy: No 'Access-Control-Allow-Origin' header
✗ Network Error
✗ ERR_FAILED
```

### After Fix
```
✓ Server is ONLINE and responding
✓ CORS is configured
✓ Allowed Origin: https://steagnography-system.vercel.app
✓ POST requests work correctly
```

---

## 🔧 Configuration Check

### Render Environment Variables
Go to [Render Dashboard](https://dashboard.render.com) → Your Service → Environment

Should have:
```
ALLOWED_ORIGINS=https://steagnography-system.vercel.app
MAX_CONTENT_LENGTH=209715200
FLASK_ENV=production
PYTHON_VERSION=3.11.9
```

### Vercel Environment Variables
Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Should have:
```
VITE_PROCESSING_ENGINE_URL=https://stegagen-api.onrender.com
VITE_SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 🆘 Troubleshooting

### Issue: "Server is sleeping"
**Solution**: 
- Set up UptimeRobot to ping every 5 minutes (free)
- Or upgrade Render to paid plan ($7/month)
- Or add retry logic to frontend

### Issue: "CORS headers missing"
**Solution**:
- Check `ALLOWED_ORIGINS` on Render
- Verify latest code is deployed
- Check Render logs for errors

### Issue: "Cannot connect to server"
**Solution**:
- Check Render service status
- Verify domain is correct
- Check if deployment succeeded

### Issue: "500 Internal Server Error"
**Solution**:
- Check Render logs
- Look for Python errors
- Verify all dependencies installed

---

## 📊 Monitoring

### Check Server Health
```bash
curl https://stegagen-api.onrender.com/api/health
```

### Check CORS Configuration
```bash
curl -H "Origin: https://steagnography-system.vercel.app" \
     -X OPTIONS \
     https://stegagen-api.onrender.com/api/embed -v
```

### View Render Logs
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Select your service
3. Click **Logs** tab
4. Look for "Request from origin: ..." messages

---

## 💡 Best Practices

### For Development
- Run `quick_diagnosis.py` before starting work
- Check server health endpoint first
- Use detailed test suite after changes

### For Production
- Set up monitoring (UptimeRobot)
- Enable Render email notifications
- Check logs regularly
- Consider upgrading to paid plan

### For Testing
- Test locally before deploying
- Use provided test scripts
- Verify environment variables
- Check both frontend and backend logs

---

## 📞 Support

If you're still having issues after trying everything:

1. Run and save output:
   ```bash
   python quick_diagnosis.py > diagnosis_output.txt
   python test_cors.py > test_output.txt
   ```

2. Collect:
   - Browser console errors (screenshot)
   - Render logs (last 10 minutes)
   - Environment variables (screenshot, hide sensitive values)

3. Check:
   - `CORS_FIX_GUIDE.md` for detailed solutions
   - `DEPLOY_CORS_FIX.md` for deployment help
   - Render documentation: https://render.com/docs

---

## 📚 Additional Resources

- [CORS Explained](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [Render Documentation](https://render.com/docs)
- [Flask CORS Guide](https://flask-cors.readthedocs.io/)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)

---

## ✨ Quick Reference

| Problem | Command | Fix |
|---------|---------|-----|
| CORS error | `python quick_diagnosis.py` | Wake server + deploy |
| Server sleeping | Open health endpoint | Wait 60s + retry |
| Need details | `python test_cors.py` | Check output |
| Deploy fixes | `git push origin main` | Wait 5 min |
| Monitor | UptimeRobot | Ping every 5 min |

---

## 🎉 Success Checklist

- [ ] Ran `quick_diagnosis.py` - all tests pass
- [ ] Health endpoint responds in < 2 seconds
- [ ] No CORS errors in browser console
- [ ] Audio embedding works from frontend
- [ ] Audio extraction works correctly
- [ ] Set up monitoring (UptimeRobot)
- [ ] Documented any issues encountered

---

**Need help?** Start with `CORS_ISSUE_SUMMARY.md` for complete overview.

**Ready to fix?** Run `diagnose.bat` or `python quick_diagnosis.py` right now!
