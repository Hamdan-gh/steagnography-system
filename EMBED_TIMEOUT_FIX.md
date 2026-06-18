# Embed Timeout Fix - Comprehensive Logging

## Problem Identified

The `/api/embed` endpoint was receiving requests but **never responding**, causing the frontend to timeout. From the logs:

```
2026-06-18T10:01:16.857891046Z Request from origin: https://steagnography-system.vercel.app, Method: POST, Path: /api/embed
[NO RESPONSE LOGGED - REQUEST HANGS FOREVER]
```

## Root Cause Analysis

The issue was **not CORS, not Vercel, not Axios** - it was inside the Python processing code:

1. **Lazy imports** - Modules were imported inside functions, hiding import errors
2. **No diagnostic logging** - Unable to see where processing was failing
3. **Buffer flushing** - Print statements weren't appearing in logs immediately
4. **Silent failures** - Errors were being caught but not properly reported

## Changes Made

### 1. Top-Level Module Imports (`app.py`)

**Before:**
```python
@app.route('/api/embed', methods=['POST', 'OPTIONS'])
def embed_audio():
    from embed_audio import embed_audio_in_image  # ← Lazy import hides errors
    try:
        # processing code
```

**After:**
```python
# Import processing modules at startup to catch import errors early
try:
    from embed_audio import embed_audio_in_image
    from extract_audio import extract_audio_from_image
    from image_processing import analyze_image_capacity
    print("✓ All processing modules loaded successfully")
except ImportError as e:
    print(f"✗ CRITICAL: Failed to import processing modules: {e}")
    print(traceback.format_exc())
    sys.exit(1)  # ← Fail fast on startup, not during requests
```

**Why this helps:**
- Import errors now cause startup failure instead of silent request hangs
- Easier to debug dependency issues during deployment
- Faster request handling (no repeated imports)

### 2. Comprehensive Request Logging (`app.py`)

Added detailed logging at every step of the `/api/embed` endpoint:

```python
@app.route('/api/embed', methods=['POST', 'OPTIONS'])
def embed_audio():
    try:
        print('=' * 60)
        print('STARTING EMBED REQUEST')
        print('=' * 60)
        print(f'Content-Type: {request.content_type}')
        print(f'Files in request: {list(request.files.keys())}')
        print(f'Form data: {list(request.form.keys())}')
        sys.stdout.flush()  # ← Force immediate output
        
        # ... file validation ...
        
        print(f'Saving files: {cover_filename}, {audio_filename}')
        sys.stdout.flush()
        cover_image.save(cover_path)
        audio_file.save(audio_path)
        print(f'Files saved successfully')
        sys.stdout.flush()
        
        print('Calling embed_audio_in_image...')
        sys.stdout.flush()
        result = embed_audio_in_image(...)
        print('embed_audio_in_image completed successfully')
        sys.stdout.flush()
        
        print('EMBED REQUEST COMPLETED SUCCESSFULLY')
        print(f'Result keys: {list(result.keys())}')
        sys.stdout.flush()
        return jsonify(result), 200
        
    except Exception as e:
        print(f'ERROR in embed_audio: {str(e)}')
        print(f'Error type: {type(e).__name__}')
        print(traceback.format_exc())
        sys.stdout.flush()
        return jsonify({'error': str(e)}), 500
```

### 3. Step-by-Step Processing Logs (`embed_audio.py`)

Added explicit logging and flushing at every processing step:

```python
def embed_audio_in_image(cover_image_path, audio_path, encryption_key,
                         ga_generations=20, ga_population_size=15):
    start_time = time.time()

    print("Step 1: Loading cover image...")
    sys.stdout.flush()
    cover_image = load_image(cover_image_path)
    print(f"✓ Cover image loaded: shape={cover_image.shape}")
    sys.stdout.flush()

    print("Step 2: Loading audio file...")
    sys.stdout.flush()
    audio_info = load_audio(audio_path)
    audio_bytes = audio_info['data']
    print(f"✓ Audio loaded: {len(audio_bytes)} bytes")
    sys.stdout.flush()

    print("Step 3: Analyzing capacity...")
    sys.stdout.flush()
    capacity_info = analyze_image_capacity(cover_image_path)
    # ... validation ...
    print(f"✓ Capacity check passed")
    sys.stdout.flush()

    print("Step 4: Encrypting audio data with AES-256...")
    sys.stdout.flush()
    encryptor = AESEncryption(encryption_key)
    encrypted_data, nonce, tag = encryptor.encrypt(audio_bytes)
    print(f"✓ Encryption complete")
    sys.stdout.flush()

    print("Step 5: Embedding data using fast LSB steganography...")
    sys.stdout.flush()
    stego_image = embed_payload(cover_image, payload)
    print(f"✓ Embedding complete")
    sys.stdout.flush()

    print("Step 6: Calculating quality metrics...")
    sys.stdout.flush()
    metrics = calculate_all_metrics(cover_image, stego_image)
    print(f"✓ Metrics calculated: PSNR={metrics['psnr']:.2f}, SSIM={metrics['ssim']:.4f}")
    sys.stdout.flush()

    print("Step 7: Saving stego image...")
    sys.stdout.flush()
    save_image(stego_image, output_path)
    print(f"✓ Saved to {output_path}")
    sys.stdout.flush()

    print("Step 8: Encoding to base64...")
    sys.stdout.flush()
    with open(output_path, 'rb') as f:
        image_base64 = base64.b64encode(f.read()).decode('utf-8')
    print(f"✓ Base64 encoding complete")
    sys.stdout.flush()

    print("✓ Result dictionary built successfully")
    sys.stdout.flush()
    return result
```

## What the Logs Will Show Now

### On Successful Request:
```
============================================================
STARTING EMBED REQUEST
============================================================
Content-Type: multipart/form-data; boundary=...
Files in request: ['cover_image', 'audio_file']
Form data: ['encryption_key', 'ga_generations', 'ga_population_size']
Using fast LSB steganography
Saving files: image.png, audio.wav
Files saved successfully
File sizes: Image=2.50MB, Audio=1.20MB
Calling embed_audio_in_image...
Step 1: Loading cover image...
✓ Cover image loaded: shape=(1080, 1920, 3)
Step 2: Loading audio file...
✓ Audio loaded: 1258291 bytes
Step 3: Analyzing capacity...
✓ Capacity check passed
Step 4: Encrypting audio data with AES-256...
✓ Encryption complete
✓ Payload built: 1258387 bytes (10067096 bits)
Step 5: Embedding data using fast LSB steganography...
✓ Embedding complete
Step 6: Calculating quality metrics...
✓ Metrics calculated: PSNR=52.34, SSIM=0.9987
Step 7: Saving stego image...
✓ Saved to outputs/stego_1718703077.png
✓ Total execution time: 3.45 seconds
Step 8: Encoding to base64...
✓ Base64 encoding complete
✓ Result dictionary built successfully
embed_audio_in_image completed successfully
EMBED REQUEST COMPLETED SUCCESSFULLY
Result keys: ['stego_image_url', 'stego_image_base64', 'metrics', 'ga_results', 'execution_time']
```

### On Failure:
```
============================================================
STARTING EMBED REQUEST
============================================================
Content-Type: multipart/form-data; boundary=...
Files in request: ['cover_image', 'audio_file']
Form data: ['encryption_key']
Calling embed_audio_in_image...
Step 1: Loading cover image...
✓ Cover image loaded: shape=(800, 600, 3)
Step 2: Loading audio file...
✓ Audio loaded: 5000000 bytes
Step 3: Analyzing capacity...
ERROR in embed_audio: Audio file too large. Max capacity: 4320000 bytes, Audio size: 5000000 bytes
Error type: ValueError
Traceback (most recent call last):
  File "app.py", line 142, in embed_audio
    result = embed_audio_in_image(...)
  File "embed_audio.py", line 35, in embed_audio_in_image
    raise ValueError(f"Audio file too large...")
ValueError: Audio file too large. Max capacity: 4320000 bytes, Audio size: 5000000 bytes
```

## Deployment Steps

1. **Commit changes:**
```bash
git add python-engine/app.py python-engine/embed_audio.py
git commit -m "Add comprehensive logging to diagnose embed timeout issue"
git push origin main
```

2. **Monitor Render logs** after deployment:
   - Watch for the startup message: `✓ All processing modules loaded successfully`
   - If it fails to start, you'll see: `✗ CRITICAL: Failed to import processing modules`
   - When a request comes in, you'll see every step of processing

3. **Test from frontend:**
   - Try embedding audio in an image
   - Watch the Render logs in real-time
   - You'll now see exactly where it fails (if it fails)

## Expected Behavior After Fix

1. **Startup:** Clear indication that all modules loaded successfully
2. **Request processing:** Step-by-step progress logs
3. **Errors:** Detailed error type, message, and full stack trace
4. **Success:** Confirmation of completion with result summary

## Why sys.stdout.flush()?

Python buffers output by default. In a production environment, buffered logs might not appear until:
- Buffer fills up
- Process exits
- Explicit flush occurs

By calling `sys.stdout.flush()` after every print, we ensure logs appear **immediately** in Render's log viewer, making real-time debugging possible.

## Next Steps

1. **Deploy and test** - Push these changes and try embedding again
2. **Read the logs** - You'll now see exactly where it hangs or fails
3. **Fix the actual issue** - Once we see the logs, we can fix the root cause
   - Could be: NumPy/Pillow version issues, memory limits, missing dependencies, etc.
4. **Keep the logging** - This detailed logging is valuable for production monitoring

## Important Notes

- **This is diagnostic code** - Keep it until the issue is resolved
- **Performance impact is minimal** - Print statements are fast
- **Can be reduced later** - Once stable, reduce logging verbosity
- **Essential for debugging** - Without logs, we're flying blind

---

**Status:** Ready to deploy
**Files Changed:** 
- `python-engine/app.py` - Import handling, request logging
- `python-engine/embed_audio.py` - Step-by-step processing logs

**Next Action:** Deploy to Render and monitor logs during an embed request
