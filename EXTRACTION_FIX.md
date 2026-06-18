# Audio Extraction Fix

## Problem
Users were unable to extract audio from uploaded stego images. The upload process was failing without clear error messages.

## Root Causes Identified

### 1. **Backend Connection Issues**
- Frontend trying to connect to Python backend on `http://localhost:5000`
- If backend not running, requests fail with network errors
- No clear indication to user that backend is offline

### 2. **Poor Error Handling**
- Generic error messages didn't help users understand what went wrong
- No distinction between:
  - Wrong encryption key
  - Invalid/non-stego image
  - Backend connection failure
  - Corrupted image data

### 3. **Missing User Feedback**
- No backend status indicator
- Insufficient console logging for debugging
- Error details not surfaced to user

## Solutions Implemented

### 1. Enhanced Frontend Error Handling (`ExtractPage.tsx`)
**Added:**
- Comprehensive error logging to console
- Specific error messages for different failure scenarios:
  - Network connection errors (backend offline)
  - Server errors (500)
  - Validation errors (wrong key, invalid image)
- Better error message display with longer toast duration
- Detailed console logging of requests and responses

### 2. Backend Health Check
**Added:**
- Automatic backend health check when page loads
- Visual status indicator showing:
  - 🟢 Green: Processing Server Online
  - 🔴 Red: Processing Server Offline
- Toast notification if backend is unreachable

### 3. Improved Backend Error Messages (`app.py`)
**Enhanced extraction endpoint with:**
- Better error categorization using `ValueError` for validation errors
- Specific error messages for common issues:
  - "This image does not contain hidden audio or was not created by this tool"
  - "Incorrect encryption key. Please use the same key used during embedding"
  - "The stego image appears to be corrupted or modified"
- Detailed logging throughout extraction process
- Proper cleanup on errors

### 4. Enhanced Logging (`extraction.service.ts`)
**Added:**
- Request logging (file name, size)
- Response logging (success/failure)
- Error propagation with full context
- Quieter success notifications (removed duplicate toasts)

## Files Modified

1. **src/pages/ExtractPage.tsx**
   - Added backend health check on mount
   - Enhanced error handling with specific messages
   - Added backend status indicator UI
   - Improved console logging

2. **src/services/extraction.service.ts**
   - Added comprehensive error handling
   - Enhanced logging throughout process
   - Better error propagation

3. **python-engine/app.py**
   - Improved `/api/extract` endpoint error handling
   - Added specific error messages for common failures
   - Enhanced logging with detailed process steps
   - Better resource cleanup on errors

## Testing Checklist

### Before Testing
- [ ] Ensure Python backend is running: `cd python-engine && python app.py`
- [ ] Backend should start on `http://localhost:5000`
- [ ] Check console for "Starting StegaGen Processing Engine" message

### Test Scenarios

#### 1. **Backend Offline Test**
- Stop the Python backend
- Go to Extract page
- Expected: Red "Processing Server Offline" indicator
- Expected: Toast notification about backend being unreachable

#### 2. **Successful Extraction Test**
- Start Python backend
- Go to Extract page
- Expected: Green "Processing Server Online" indicator
- Upload a valid stego image (created by the embed feature)
- Enter the correct encryption key
- Click "Extract Audio"
- Expected: Progress bar shows upload/processing
- Expected: Success message and audio player appears
- Expected: Audio can be downloaded

#### 3. **Wrong Encryption Key Test**
- Upload a valid stego image
- Enter an incorrect encryption key
- Click "Extract Audio"
- Expected: Error message "Incorrect encryption key..."

#### 4. **Invalid Image Test**
- Upload a regular image (not created by embed feature)
- Enter any encryption key
- Click "Extract Audio"
- Expected: Error message "This image does not contain hidden audio..."

#### 5. **Invalid File Format Test**
- Try to upload a non-image file
- Expected: File rejected before upload

## How to Start the Backend

### Option 1: Direct Python Command
```bash
cd python-engine
python app.py
```

### Option 2: Using Virtual Environment (Recommended)
```bash
cd python-engine
# Windows
venv\Scripts\activate
# Mac/Linux
source venv/bin/activate

python app.py
```

### Verify Backend is Running
- Open browser to `http://localhost:5000/api/health`
- Should see: `{"status":"healthy","version":"1.0.0","service":"StegaGen Processing Engine"}`

## Common Issues & Solutions

### Issue: "Cannot connect to processing server"
**Solution:** 
1. Check if Python backend is running on port 5000
2. Start backend: `cd python-engine && python app.py`
3. Verify at `http://localhost:5000/api/health`

### Issue: "This image does not contain hidden audio"
**Solution:** 
1. Ensure you're using an image created by the Embed feature
2. The image must be a PNG file with the magic header "STGA"
3. Don't use regular images or modified stego images

### Issue: "Incorrect encryption key"
**Solution:** 
1. Use the exact same encryption key used during embedding
2. Keys are case-sensitive
3. Must be 16-32 characters long

### Issue: Backend starts but requests fail
**Solution:** 
1. Check for port conflicts (another service using port 5000)
2. Check CORS configuration in `app.py`
3. Verify `.env` has correct `VITE_PROCESSING_ENGINE_URL=http://localhost:5000`

## Developer Notes

### Console Logging
The fix adds extensive console logging. Check browser console for:
- Backend health check results
- File upload details (name, size, type)
- Upload progress
- Response data
- Detailed error information

### Error Object Structure
```javascript
{
  message: string,
  response: {
    data: { error: string },
    status: number
  },
  code: string // 'ECONNREFUSED', 'ERR_NETWORK', etc.
}
```

### Backend Logging
Python backend now logs:
- Request start/end markers
- File details (name, size)
- Encryption key length
- Each processing step
- Success/failure messages
- Stack traces on errors

## Future Improvements

1. **Retry Logic**: Auto-retry failed requests
2. **Backend Auto-Start**: Detect and offer to start backend automatically
3. **Progress Detail**: Show which step is executing (upload, decrypt, extract, etc.)
4. **Error Recovery**: Suggest fixes based on error type
5. **Batch Processing**: Allow multiple extractions in queue
