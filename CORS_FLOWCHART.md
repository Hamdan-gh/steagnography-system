# CORS Issue - Decision Flowchart

```
┌─────────────────────────────────────────┐
│   Having CORS Errors in Browser?       │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Run: python quick_diagnosis.py        │
│   or double-click: diagnose.bat         │
└───────────────┬─────────────────────────┘
                │
                ▼
┌─────────────────────────────────────────┐
│   Does server respond to health check?  │
└───────┬─────────────────────┬───────────┘
        │                     │
       NO                    YES
        │                     │
        ▼                     ▼
┌──────────────────┐  ┌──────────────────────┐
│ Server Sleeping  │  │  Are CORS headers    │
│ or Crashed       │  │  present?            │
└────────┬─────────┘  └──────┬───────┬───────┘
         │                   │       │
         ▼                  YES     NO
┌──────────────────┐         │       │
│ Wake up server:  │         │       ▼
│                  │         │  ┌─────────────────────┐
│ 1. Open health   │         │  │ CORS Misconfigured  │
│    endpoint      │         │  └──────┬──────────────┘
│ 2. Wait 60s      │         │         │
│ 3. Try again     │         │         ▼
└────────┬─────────┘         │  ┌─────────────────────┐
         │                   │  │ Check Render:       │
         ▼                   │  │ • ALLOWED_ORIGINS   │
┌──────────────────┐         │  │ • Latest code       │
│ Still not        │         │  │ • Deployment logs   │
│ working?         │         │  └──────┬──────────────┘
└────────┬─────────┘         │         │
         │                   │         ▼
         ▼                   │  ┌─────────────────────┐
┌──────────────────┐         │  │ Deploy fixes:       │
│ Check Render:    │         │  │ git push origin main│
│ • Service status │         │  └──────┬──────────────┘
│ • Deploy logs    │         │         │
│ • Error messages │         │         │
└────────┬─────────┘         │         │
         │                   │         │
         └───────────────────┴─────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Test from frontend │
                  └──────────┬──────────┘
                             │
                             ▼
                  ┌─────────────────────┐
                  │  Working?           │
                  └──────┬──────┬───────┘
                        YES    NO
                         │      │
                         ▼      ▼
            ┌─────────────┐  ┌──────────────────┐
            │  ✅ FIXED!  │  │  Read detailed   │
            │             │  │  troubleshooting │
            │  Setup      │  │  in:             │
            │  monitoring │  │  CORS_FIX_GUIDE  │
            └─────────────┘  └──────────────────┘
```

## Decision Tree (Text Version)

### Step 1: Run Diagnosis
```
ACTION: python quick_diagnosis.py
```

### Step 2: Interpret Results

#### Result A: "Server TIMEOUT" or "Cannot connect"
```
PROBLEM: Server is sleeping or down
SOLUTION:
  1. Open https://stegagen-api.onrender.com/api/health in browser
  2. Wait 60 seconds
  3. Run diagnosis again
  
IF STILL DOWN:
  • Check Render dashboard - is service running?
  • Check recent deployments - did deploy fail?
  • Check Render logs - any error messages?
```

#### Result B: "CORS headers are MISSING"
```
PROBLEM: CORS not configured properly
SOLUTION:
  1. Check Render environment variables:
     • ALLOWED_ORIGINS should be: https://steagnography-system.vercel.app
  2. Verify latest code is deployed
  3. Check app.py has CORS configuration
  
DEPLOY FIX:
  git add .
  git commit -m "fix: CORS configuration"
  git push origin main
  
  Wait 5 minutes for deployment
  Run diagnosis again
```

#### Result C: "CORS is configured" but frontend still fails
```
PROBLEM: Timing issue (cold start)
SOLUTION:
  • Frontend needs retry logic
  • Or setup UptimeRobot monitoring
  • Or upgrade Render plan
  
SEE: CORS_FIX_GUIDE.md → "Frontend Retry Logic"
```

#### Result D: All tests pass
```
PROBLEM: Issue is elsewhere
CHECK:
  • Browser console - exact error message?
  • Frontend code - correct API URL?
  • Vercel env vars - VITE_PROCESSING_ENGINE_URL set?
  • Network tab - what's the actual request/response?
```

## Quick Command Reference

```bash
# Diagnose issue
python quick_diagnosis.py

# Detailed tests
python test_cors.py

# Test server health
curl https://stegagen-api.onrender.com/api/health

# Test CORS
curl -H "Origin: https://steagnography-system.vercel.app" \
     -X OPTIONS \
     https://stegagen-api.onrender.com/api/embed -v

# Deploy fixes
git add .
git commit -m "fix: CORS"
git push origin main
```

## Common Paths Through Flowchart

### Path 1: Typical Cold Start (90% of cases)
```
1. Run diagnosis → Server TIMEOUT
2. Open health endpoint → Wait 60s
3. Run diagnosis again → All pass ✅
4. Frontend works!
```

### Path 2: CORS Not Configured
```
1. Run diagnosis → CORS headers missing
2. Check Render env vars → Not set
3. Add ALLOWED_ORIGINS variable
4. Redeploy from Render dashboard
5. Run diagnosis → All pass ✅
```

### Path 3: Old Code Deployed
```
1. Run diagnosis → CORS headers missing
2. Check Render env vars → Correct
3. Check Render deployment → Old commit
4. Deploy: git push origin main
5. Wait 5 minutes
6. Run diagnosis → All pass ✅
```

### Path 4: Everything Passes But Still Fails
```
1. Run diagnosis → All pass ✅
2. Frontend still fails
3. Check browser console → Network error
4. Problem: Cold start timing
5. Solution: Add retry logic OR setup monitoring
```

## Time Estimates

| Scenario | Time to Fix |
|----------|-------------|
| Server sleeping | 2 minutes |
| Missing env vars | 5 minutes |
| Deploy new code | 8 minutes |
| Setup monitoring | 10 minutes |
| Frontend retry logic | 15 minutes |

## Priority Actions

### 🔴 Critical (Do First)
1. Run `python quick_diagnosis.py`
2. Open health endpoint if server sleeping
3. Check ALLOWED_ORIGINS on Render

### 🟡 Important (Do Soon)
1. Deploy enhanced code with logging
2. Test from frontend
3. Verify all working

### 🟢 Recommended (Do Later)
1. Setup UptimeRobot monitoring
2. Add frontend retry logic
3. Document any custom solutions

## Need More Help?

| Question | Read This |
|----------|-----------|
| What's the overall problem? | `CORS_ISSUE_SUMMARY.md` |
| How do I fix it? | `CORS_FIX_GUIDE.md` |
| How do I deploy? | `DEPLOY_CORS_FIX.md` |
| What tools are available? | `README_CORS_FIX.md` |
| Still stuck? | Run `python test_cors.py` and share output |
