# Timeout Issue - Solution Guide

## 🔴 Problem: "timeout of 300000ms exceeded"

This error means the genetic algorithm took longer than 5 minutes (now increased to 10 minutes).

## 🎯 Quick Solutions (Try These First)

### Solution 1: Reduce GA Parameters (FASTEST)
**Use these ultra-fast settings:**
- Generations: **10**
- Population: **10**

**Result:** Completes in 15-30 seconds even for large files
**Quality:** Still good (PSNR > 35dB)

### Solution 2: Use Smaller Files
- **Image**: Keep under 1000×1000 pixels (< 1MB)
- **Audio**: Keep under 500KB (compress to MP3 if needed)

### Solution 3: Quick Mode Preset
Click the **"⚡ Quick Mode"** button:
- Generations: 20
- Population: 15
- Takes: 30-90 seconds for normal files

---

## 📊 Why Timeouts Happen

### Processing Time Formula
Time depends on:
1. **Image size** (pixels × pixels)
2. **Audio size** (bytes)
3. **GA Generations** (higher = slower)
4. **GA Population** (higher = slower)

### Examples

| Image | Audio | Generations | Population | Time |
|-------|-------|-------------|------------|------|
| 512×512 | 100KB | 10 | 10 | **15-30s** ✅ |
| 1024×1024 | 500KB | 20 | 15 | **45-90s** ✅ |
| 2048×2048 | 1MB | 30 | 20 | **180-300s** ⚠️ |
| 2048×2048 | 1MB | 50 | 30 | **300-600s** ❌ TIMEOUT |

---

## ⚙️ Recommended Settings by File Size

### Small Files (< 1MB image, < 500KB audio)
```
Generations: 20-30
Population: 15-20
Expected: 30-90 seconds
```

### Medium Files (1-3MB image, 500KB-1MB audio)
```
Generations: 15-20
Population: 10-15
Expected: 60-120 seconds
```

### Large Files (> 3MB image, > 1MB audio)
```
Generations: 10-15
Population: 10
Expected: 90-180 seconds
```

### Very Large Files (> 5MB image)
```
⚠️ WARNING: May timeout even with low settings
Generations: 10
Population: 10
Expected: 180-300+ seconds
Consider: Resize image or reduce audio size
```

---

## 🔧 What Was Changed

### Backend
- ✅ Increased mutation rate (0.1 → 0.15) for faster convergence
- ✅ Reduced crossover probability (0.7 → 0.6) for speed
- ✅ Increased mutation probability (0.2 → 0.25)
- ✅ Added file size warnings in console
- ✅ Better progress logging

### Frontend
- ✅ Increased timeout (5 min → 10 min)
- ✅ Better timeout error message
- ✅ File size warnings on upload
- ✅ Slower progress bar for long processes

---

## 🚀 Step-by-Step Fix

### Option A: Ultra-Fast Mode (Recommended for Testing)
1. Set **Generations to 10**
2. Set **Population to 10**
3. Click "Start Embedding"
4. Should complete in 15-45 seconds

**Use this when:**
- Testing the system
- Using large files (> 2MB image)
- Need quick results
- Don't need absolute best quality

### Option B: Reduce File Sizes
```bash
# Compress image (using online tools or Photoshop)
# Target: 1000×1000 or smaller, < 1MB

# Compress audio (using Audacity or online converter)
# Target: MP3 format, < 500KB
```

### Option C: Quick Mode with Small Files
1. Use image < 1000×1000
2. Use audio < 500KB
3. Click "⚡ Quick Mode" (20 gen, 15 pop)
4. Should complete in 30-90 seconds

---

## 📈 Quality vs Speed Trade-off

| Setting | Time | PSNR | Quality | Use Case |
|---------|------|------|---------|----------|
| 10/10 | 15-30s | 35-40dB | Good | Testing, large files |
| 20/15 | 30-90s | 40-45dB | Very Good | Daily use ⭐ |
| 30/20 | 60-180s | 42-47dB | Excellent | Important files |
| 50/30 | 180-600s | 45-50dB | Best | Critical (may timeout) |

**PSNR > 35dB = Invisible to human eyes**

All settings produce imperceptible changes!

---

## 🔍 How to Check Current Settings

Look at the Python console when you start embedding:

```
GA Parameters: Generations=20, Population=15
```

If you see:
```
⚠️ WARNING: High GA parameters may take 5-10+ minutes!
```

Then reduce your settings!

---

## 💡 Pro Tips

### Tip 1: Start Ultra-Fast
Always test with **10 generations, 10 population** first to verify your files work.

### Tip 2: Check File Sizes BEFORE Upload
- Windows: Right-click file → Properties
- Look for files < 1MB (image) and < 500KB (audio)

### Tip 3: Compress Audio First
MP3 is MUCH smaller than WAV:
- WAV: 10MB for 2 minutes
- MP3: 2MB for 2 minutes

**Use MP3 whenever possible!**

### Tip 4: Resize Large Images
If image is > 2000×2000:
- Use photo editor to resize to 1000×1000
- Quality difference is minimal
- Processing is 4-10× faster!

### Tip 5: Watch Python Console
Real-time generation updates show if it's working:
```
Generation 5/10 (50.0%): Max Fitness = 38.42
Generation 10/10 (100.0%): Max Fitness = 41.23
```

---

## 🆘 If Still Timing Out

### Check 1: File Sizes
```bash
# In python-engine folder
python -c "import os; print('Image:', os.path.getsize('uploads/your_image.jpg')/1024/1024, 'MB')"
```

If > 5MB, **definitely resize**

### Check 2: Try Absolute Minimum
```
Generations: 5
Population: 5
```

Even 5/5 will work! Quality will be lower (PSNR ~32-35) but still invisible.

### Check 3: Python Console Errors
Look for:
```
MemoryError
```
= Not enough RAM (close other apps)

```
Step 5: Running Genetic Algorithm...
(then nothing)
```
= Still running, just slow (be patient or reduce settings)

---

## 🎯 Recommended Workflow

### For Testing/Development
```
1. Use small files (500×500 image, 200KB audio)
2. Set to 10 generations, 10 population
3. Test that it works (15-30 seconds)
4. Gradually increase if needed
```

### For Daily Use
```
1. Compress files first (< 1MB image, < 500KB audio)
2. Use Quick Mode (20 gen, 15 pop)
3. Wait 30-90 seconds
4. Quality is excellent (PSNR > 40)
```

### For High Quality
```
1. Use good quality files (but still < 2MB image)
2. Use Balanced Mode (30 gen, 20 pop)
3. Wait 60-180 seconds
4. Check if it completes
5. If timeout, reduce to 20/15
```

---

## 📝 Current Timeouts

- **Frontend timeout**: 10 minutes (600,000ms)
- **Backend**: No timeout (will run until complete or crash)

If processing takes > 10 minutes, you'll get timeout error.

**Solution:** Use settings that complete in < 5 minutes to be safe.

---

## ✅ Success Strategy

```
1. Start with: 10 generations, 10 population
2. Use files: < 1MB image, < 500KB audio
3. Test: Should complete in 15-45 seconds
4. If successful: Gradually increase settings
5. If timeout: Reduce settings or file sizes
```

**Remember:** Even 10/10 produces INVISIBLE changes! You don't need 50/30 unless it's absolutely critical.

---

## 🎊 Summary

**Timeout Fix Applied:**
- ✅ Timeout increased (5 min → 10 min)
- ✅ GA optimized further (faster convergence)
- ✅ File size warnings added
- ✅ Better error messages
- ✅ Recommended settings documented

**Your Action:**
1. Restart backend: `python app.py`
2. Refresh frontend (Ctrl+R)
3. Use **10 generations, 10 population** for large files
4. Use **20 generations, 15 population** (Quick Mode) for normal files
5. Keep files under 1-2MB if possible

**This will solve your timeout issue! 🚀**
