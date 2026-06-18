# Backend Health Check

## Pre-flight Checklist

### 1. Dependencies Installed
Run this to verify all packages are installed:
```bash
pip list | findstr "flask numpy pillow deap librosa"
```

Should show:
- Flask
- numpy
- Pillow
- deap
- librosa (or soundfile)

If missing, run:
```bash
pip install -r requirements.txt
```

### 2. Directory Structure
Verify these folders exist:
```bash
dir uploads
dir outputs
```

If missing, they'll be auto-created when running app.py

### 3. Test Embedding Works
```bash
python test_embedding.py
```

Expected output:
```
✓ Test image created
✓ Test audio created
Step 1: Loading cover image...
Step 2: Loading audio file...
Step 3: Encrypting audio data...
Step 4: Converting to bits...
Step 5: Running Genetic Algorithm...
Generation 1/10 (10.0%): Max Fitness = XX.XX
...
✓ EMBEDDING TEST PASSED!
PSNR: XX.XX dB
SSIM: X.XXXX
```

### 4. Start Server
```bash
python app.py
```

Expected output:
```
====================================================
Starting StegaGen Processing Engine
Server: http://localhost:5000
====================================================
 * Running on all addresses (0.0.0.0)
 * Running on http://127.0.0.1:5000
 * Running on http://192.168.x.x:5000
```

### 5. Test Health Endpoint
Open browser or use curl:
```bash
curl http://localhost:5000/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "StegaGen Processing Engine"
}
```

## During Processing

When you upload files from the frontend, you should see in the console:

```
====================================================
STARTING EMBED REQUEST
====================================================
GA Parameters: Generations=20, Population=15
Saving files: test_image.png, test_audio.mp3
Files saved successfully, starting embedding process...
Step 1: Loading cover image...
Step 2: Loading audio file...
Audio size: XXXXX bytes
Step 3: Encrypting audio data with AES-256...
Step 4: Converting to bits...
Data size: XXXXX bits
Step 5: Running Genetic Algorithm (Generations: 20, Population: 15)...
Creating initial population...
Evaluating initial population...
Starting evolution for 20 generations...
Generation 1/20 (5.0%): Max Fitness = XX.XX
Generation 5/20 (25.0%): Max Fitness = XX.XX
Generation 10/20 (50.0%): Max Fitness = XX.XX
Generation 15/20 (75.0%): Max Fitness = XX.XX
Generation 20/20 (100.0%): Max Fitness = XX.XX
Optimization complete! Best fitness: XX.XX
Step 6: Embedding data at optimized positions...
Step 7: Calculating quality metrics...
Embedding completed in XX.XX seconds
PSNR: XX.XX dB
SSIM: X.XXXX
Embedding completed successfully!
Cleaned up input files
====================================================
EMBED REQUEST COMPLETED
====================================================
```

## Troubleshooting

### Issue: Import errors
```
ModuleNotFoundError: No module named 'flask'
```
**Fix**: 
```bash
pip install -r requirements.txt
```

### Issue: Port already in use
```
OSError: [Errno 48] Address already in use
```
**Fix**: 
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in app.py
app.run(port=5001)
```

### Issue: Files not found
```
FileNotFoundError: [Errno 2] No such file or directory: 'uploads/...'
```
**Fix**: 
```bash
mkdir uploads
mkdir outputs
```

### Issue: Slow processing
- Normal for large images or high GA parameters
- Expected: 30-90 seconds for Quick Mode
- If > 5 minutes, reduce GA parameters

### Issue: Memory error
```
MemoryError
```
**Fix**:
- Use smaller images
- Reduce GA parameters (10 generations, 10 population)
- Close other applications

## Performance Benchmarks

Expected processing times on average hardware:

| Image Size | Audio | Generations | Population | Time |
|------------|-------|-------------|------------|------|
| 512×512    | 100KB | 20          | 15         | 30s  |
| 1024×1024  | 500KB | 20          | 15         | 60s  |
| 1024×1024  | 500KB | 50          | 30         | 180s |
| 2048×2048  | 1MB   | 30          | 20         | 120s |

## Success Indicators

✅ Server starts without errors
✅ Health endpoint returns 200 OK
✅ Test script passes
✅ Console shows progress logs during processing
✅ Stego image created in outputs/ folder
✅ PSNR > 35 dB
✅ SSIM > 0.90
✅ Processing completes in reasonable time

## All Good?

If all checks pass:
1. ✅ Backend is working correctly
2. ✅ Ready to accept frontend requests
3. ✅ Embedding will complete successfully
4. ✅ Downloads will work properly

Start the frontend and test the full flow! 🚀
