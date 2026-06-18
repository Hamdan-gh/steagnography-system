# Quick Deploy Guide - Large File Support

## 🚀 One-Command Deploy

```bash
# From project root
git add .
git commit -m "fix: Support 2-20MB files with optimized backend config"
git push origin main
```

That's it! Both Render and Vercel will auto-deploy.

---

## ✅ What Was Fixed

| Issue | Solution |
|-------|----------|
| 502 errors on large files | Increased timeout to 15 minutes |
| Backend going offline | Doubled workers (1→2) and threads (2→4) |
| No file size limits | Added 2MB-20MB validation |
| Slow processing on large files | Auto-optimized GA parameters |
| Poor error messages | User-friendly messages + retry logic |

---

## 📊 File Size Behavior

| File Size | Connection | GA Params | Expected Time |
|-----------|------------|-----------|---------------|
| < 2MB | ❌ Rejected | - | Instant error |
| 2-5MB | Via Vercel | Standard (20/15) | 30-90 sec |
| 5-10MB | Direct | Standard (20/15) | 1-3 min |
| 10-20MB | Direct | Optimized (10/10) | 2-5 min |
| > 20MB | ❌ Rejected | - | Instant error |

---

## 🔍 Verify Deployment

1. **Render**: https://dashboard.render.com (wait 3-5 min)
2. **Vercel**: https://vercel.com/dashboard (wait 1-2 min)
3. **Test**: https://steagnography-system.vercel.app

---

## 🧪 Test Checklist

- [ ] Upload 2MB file - Should work
- [ ] Upload 10MB file - Should work (with "optimized" toast)
- [ ] Upload 25MB file - Should show error
- [ ] Check no 502 errors in console

---

## 🆘 If Problems Persist

**502 Still Happening?**
```
1. Check Render logs for Python errors
2. Verify VITE_PROCESSING_ENGINE_URL is set
3. Try direct backend URL in browser: https://stegagen-api.onrender.com/api/health
```

**Timeout After 15 Minutes?**
```
File too complex - try:
- Smaller image
- Lower GA parameters (10 gen, 10 pop)
- Upgrade Render plan
```

**Backend Offline?**
```
Render free tier spins down after 15 min idle.
First request after idle takes 30-60 seconds to wake up.
Consider Render Starter ($7/mo) for always-on.
```

---

## 📈 Performance Monitoring

**Good Logs (Render):**
```
File sizes: Image=8.42MB, Audio=2.13MB
Using GA params: generations=10, population=10
EMBED REQUEST COMPLETED SUCCESSFULLY
```

**Bad Logs (Render):**
```
ERROR in embed_audio: ...
Timeout
Connection refused
```

---

## 💰 Current Cost: $0/month

**Limits:**
- Render: 750 hours/month
- Vercel: 100GB bandwidth

**Upgrade When:**
- Getting "spin down" delays
- Need faster processing
- Hitting bandwidth limits
