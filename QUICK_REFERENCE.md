# CORS Fix - Quick Reference Card

## 🚨 EMERGENCY FIX (30 seconds)

```bash
python quick_diagnosis.py
```
Then do what it says!

---

## 📊 Error Messages → Solutions

| You See This | Do This |
|--------------|---------|
| `No 'Access-Control-Allow-Origin' header` | Wake server: open health endpoint |
| `Network Error` | Server sleeping - wait 60s |
| `ERR_FAILED` | Server down - check Render |
| `500 Internal Server Error` | Check Render logs |
| Request works in Postman but not browser | CORS issue - check env vars |

---

## 🔧 Essential Commands

```bash
# Diagnose issue (use this first!)
python quick_diagnosis.py

# Full test suite
python test_cors.py

# Test server health
curl https://stegagen-api.onrender.com/api/health

# Wake up sleeping server
# Just open this URL in browser:
https://stegagen-api.onrender.com/api/health

# Deploy fixes
git add .
git commit -m "fix: CORS"
git push origin main
```

---

## 📁 Which File Do I Need?

| I Want To... | Read This File |
|--------------|----------------|
| Fix it NOW | `quick_diagnosis.py` (run it) |
| Understand problem | `CORS_ISSUE_SUMMARY.md` |
| See decision tree | `CORS_FLOWCHART.md` |
| Deploy fixes | `DEPLOY_CORS_FIX.md` |
| Troubleshoot | `CORS_FIX_GUIDE.md` |
| Learn everything | `README_CORS_FIX.md` |
| Navigate docs | `START_HERE.md` |

---

## ⚡ 3-Step Fix

```
Step 1: python quick_diagnosis.py
        ↓
Step 2: Follow instructions
        ↓  
Step 3: Test from frontend
        ↓
      Done! ✅
```

---

## 🎯 Common Scenarios

### Scenario 1: First Request Fails
```
CAUSE: Server sleeping (Render free tier)
FIX: Open health endpoint, wait 60s
TIME: 2 minutes
```

### Scenario 2: All Requests Fail
```
CAUSE: CORS not configured
FIX: Check ALLOWED_ORIGINS on Render
TIME: 5 minutes
```

### Scenario 3: Works Sometimes
```
CAUSE: Cold start timing
FIX: Setup monitoring or add retry logic
TIME: 10 minutes
```

---

## 🔍 Diagnostic Checklist

Quick health check:
- [ ] Can you access: `https://stegagen-api.onrender.com/api/health`?
- [ ] Does it return: `{"status":"healthy"}`?
- [ ] Response time < 5 seconds?
- [ ] No CORS errors in browser console?

If any ✗ above:
- [ ] Run `python quick_diagnosis.py`
- [ ] Check Render dashboard
- [ ] Check environment variables
- [ ] Check deployment logs

---

## 🌐 Important URLs

```
API Health:
https://stegagen-api.onrender.com/api/health

Frontend:
https://steagnography-system.vercel.app

Render Dashboard:
https://dashboard.render.com

Vercel Dashboard:
https://vercel.com/dashboard
```

---

## ⚙️ Required Environment Variables

### On Render (Backend)
```
ALLOWED_ORIGINS=https://steagnography-system.vercel.app
MAX_CONTENT_LENGTH=209715200
FLASK_ENV=production
PYTHON_VERSION=3.11.9
```

### On Vercel (Frontend)
```
VITE_PROCESSING_ENGINE_URL=https://stegagen-api.onrender.com
VITE_SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

---

## 🚀 Deploy Checklist

Before deploying:
- [ ] Test locally first
- [ ] Run `python test_cors.py`
- [ ] Commit changes
- [ ] Push to GitHub

After deploying:
- [ ] Wait 5 minutes
- [ ] Run `python quick_diagnosis.py`
- [ ] Test from frontend
- [ ] Check Render logs

---

## 🆘 Quick Troubleshooting

```
Problem: Server not responding
Action: Check Render dashboard → Service status

Problem: CORS headers missing  
Action: Check ALLOWED_ORIGINS on Render

Problem: 500 error
Action: Check Render logs for Python errors

Problem: Works in Postman, not browser
Action: CORS issue - verify environment variables

Problem: First request always fails
Action: Setup UptimeRobot monitoring
```

---

## ⏱️ Expected Response Times

| Scenario | Time |
|----------|------|
| Server awake | < 2 seconds |
| Cold start | 30-60 seconds |
| First request after deploy | 60-90 seconds |
| Health check | < 1 second |

If slower: Check Render logs

---

## 📞 Support Checklist

Before asking for help, collect:
- [ ] Output: `python quick_diagnosis.py`
- [ ] Output: `python test_cors.py`
- [ ] Browser console errors (screenshot)
- [ ] Render logs (last 10 minutes)
- [ ] Environment variables (screenshot)

Then check:
- [ ] `CORS_FIX_GUIDE.md`
- [ ] `CORS_FLOWCHART.md`
- [ ] Render documentation

---

## 🎯 Success Indicators

You're good when:
- ✅ Health endpoint < 2 sec response
- ✅ No CORS errors in console
- ✅ Audio embed works
- ✅ Audio extract works
- ✅ `quick_diagnosis.py` all pass

---

## 💡 Pro Tips

1. **Bookmark health endpoint** - check it before testing
2. **Setup monitoring** - UptimeRobot is free
3. **Check logs first** - often shows exact issue
4. **Test locally** - before deploying
5. **Keep this card** - for quick reference

---

## 📚 File Tree

```
NAPARI/
├── START_HERE.md              ← Begin here
├── QUICK_REFERENCE.md         ← This file
├── CORS_ISSUE_SUMMARY.md      ← Overview
├── CORS_FLOWCHART.md          ← Decision tree
├── CORS_FIX_GUIDE.md          ← Troubleshooting
├── DEPLOY_CORS_FIX.md         ← Deploy guide
├── README_CORS_FIX.md         ← Complete ref
├── diagnose.bat               ← Windows tool
├── quick_diagnosis.py         ← Fast check
├── test_cors.py               ← Full tests
└── python-engine/
    └── app.py                 ← Enhanced CORS
```

---

## 🔄 Update Cycle

```
1. Make changes locally
2. Test: python test_cors.py
3. Commit: git commit -m "fix: ..."
4. Push: git push origin main
5. Wait 5 minutes (Render deploy)
6. Verify: python quick_diagnosis.py
7. Test from frontend
```

---

**Print this page and keep it handy!**

**First time?** Run: `python quick_diagnosis.py`

**Need more info?** Read: `START_HERE.md`
