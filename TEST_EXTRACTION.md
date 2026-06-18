# Quick Test Guide for Audio Extraction

## Prerequisites
1. Python backend running on port 5000
2. A stego image created using the Embed feature
3. The encryption key used during embedding

## Step-by-Step Test

### 1. Start the Backend
```bash
# Option A: Use the startup script (Windows)
start-backend.bat

# Option B: Manual start
cd python-engine
python app.py
```

**Expected Output:**
```
============================================
Starting StegaGen Processing Engine
Server: http://localhost:5000
============================================
```

### 2. Verify Backend Health
Open browser: `http://localhost:5000/api/health`

**Expected Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "service": "StegaGen Processing Engine"
}
```

### 3. Test in Browser

#### Navigate to Extract Page
1. Log in to your account
2. Go to "Extract" page from sidebar
3. Look for status indicator at top:
   - 🟢 **"Processing Server Online"** = Backend is ready
   - 🔴 **"Processing Server Offline"** = Backend not connected

#### Upload and Extract
1. Click or drag a stego image (PNG created by Embed feature)
2. Enter the encryption key (must match the one used during embedding)
3. Click "Extract Audio" button
4. Watch progress bar:
   - 0-30%: Uploading image
   - 30-90%: Decrypting and extracting
   - 90-100%: Finalizing
5. On success:
   - Success message appears
   - Audio player shows up
   - Download button available

### 4. Common Test Cases

#### Test Case 1: Valid Extraction
- **Input:** Stego PNG from Embed page + correct key
- **Expected:** ✅ Success, audio plays and downloads

#### Test Case 2: Wrong Key
- **Input:** Stego PNG + incorrect encryption key
- **Expected:** ❌ Error: "Incorrect encryption key..."

#### Test Case 3: Regular Image
- **Input:** Normal image (not stego) + any key
- **Expected:** ❌ Error: "This image does not contain hidden audio..."

#### Test Case 4: Backend Offline
- **Input:** Stop backend, try to extract
- **Expected:** ❌ Error: "Cannot connect to processing server..."

#### Test Case 5: Invalid File Type
- **Input:** Try to upload a text file or audio file
- **Expected:** ❌ File rejected before upload

### 5. Check Console Logs

#### Browser Console (F12)
Look for:
```
Backend is online
Extraction Request: { fileName, fileSize, fileType, keyLength }
Upload progress: 50
Extraction response: { audio_name, audio_size, ... }
```

#### Python Backend Console
Look for:
```
============================================
STARTING EXTRACTION REQUEST
============================================
Saving uploaded image: stego_1234567890.png
File size: 2.45MB
Encryption key length: 24 characters
Starting extraction process...
Step 1: Loading stego image...
Step 2: Extracting embedded payload from image...
Step 3: Parsing encrypted data...
Step 4: Decrypting audio data...
Step 5: Saving extracted audio...
Extraction completed in 1.23 seconds
============================================
EXTRACTION REQUEST COMPLETED
============================================
```

## Troubleshooting

### Backend Won't Start

**Check Port 5000:**
```bash
# Windows
netstat -ano | findstr :5000

# If something is using port 5000, kill it or change port in .env
```

**Check Python Dependencies:**
```bash
cd python-engine
pip install -r requirements.txt
```

### Upload Fails Immediately

**Check File Size:**
- Max image size: 10MB
- If larger, compress image or increase limit in `constants/index.ts`

**Check File Type:**
- Must be PNG, JPG, or JPEG
- Check file extension matches actual file type

### Extraction Fails

**Check Image Source:**
- Image must be created by this tool's Embed feature
- Must contain magic header "STGA"
- Must not be edited/modified after embedding

**Check Encryption Key:**
- Exact same key used during embedding
- Case-sensitive
- 16-32 characters
- No extra spaces

### Backend Connected but Extraction Fails

**Check Logs:**
1. Browser console (F12) for frontend errors
2. Python terminal for backend errors
3. Look for specific error messages

**Common Backend Errors:**
- `ValueError: No embedded audio found` → Not a stego image
- `ValueError: Decryption failed` → Wrong encryption key
- `ValueError: Corrupted stego image` → Image was modified

## API Testing with curl

Test extraction endpoint directly:

```bash
# Test health
curl http://localhost:5000/api/health

# Test extraction (replace paths)
curl -X POST http://localhost:5000/api/extract \
  -F "stego_image=@path/to/stego.png" \
  -F "encryption_key=your-encryption-key-here"
```

## Expected Response Format

### Success Response (200)
```json
{
  "audio_url": "/api/download/extracted_1234567890.wav",
  "audio_base64": "UklGRiQAAABXQVZFZm10...",
  "audio_name": "extracted_1234567890.wav",
  "audio_size": 123456,
  "original_size": 123456,
  "execution_time": 1.23
}
```

### Error Response (400/500)
```json
{
  "error": "Incorrect encryption key. Please use the same key used during embedding."
}
```

## Success Indicators

### Frontend
- ✅ Green "Processing Server Online" badge
- ✅ Upload progress bar animates smoothly
- ✅ Success toast notification
- ✅ Audio player appears with controls
- ✅ Download button works
- ✅ Console logs show detailed request/response

### Backend
- ✅ Server starts without errors
- ✅ Health endpoint returns 200
- ✅ Request logged with details
- ✅ All 5 extraction steps complete
- ✅ Execution time logged
- ✅ Cleanup successful

## Performance Benchmarks

**Typical Extraction Times:**
- Small audio (< 100KB): 0.5-1 second
- Medium audio (100KB-1MB): 1-3 seconds
- Large audio (1MB-5MB): 3-10 seconds

**Upload Times** (depends on network):
- Local: 10-100ms per MB
- Network: varies by connection speed

If extraction takes significantly longer, check:
- System resources (CPU, RAM)
- Image size (very large images slow down processing)
- Audio size (larger audio takes longer)
