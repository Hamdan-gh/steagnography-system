# Upload Issue Troubleshooting Guide

## Quick Diagnosis

### Step 1: Test with Simple HTML Page
I've created a test page to isolate the issue:

1. Open `test-upload.html` in your browser
2. Try to upload an image (drag-drop or click)
3. Check if file selection works

**If test page works:**
- ✅ File upload works in your browser
- Problem is in the React app
- Continue to Step 2

**If test page doesn't work:**
- ❌ Browser or file system issue
- Try different browser
- Check file permissions
- Check antivirus/security software

### Step 2: Test in React App

1. Start the app: `npm run dev`
2. Go to Extract page
3. Open browser console (F12)
4. Try to upload using:
   - Drag and drop
   - Click to browse (main upload area)
   - Manual file picker (below the main area)

**Check console for:**
```
FileUpload - Accepted types: [...]
Files dropped: [File]
File selected: {...}
Validation result: {valid: true}
```

### Step 3: Try Manual File Picker

On the Extract page, I've added a **fallback file input**:
- Look for "Or use file picker:"
- It's a standard HTML file input
- Should work even if drag-drop doesn't

## Detailed Solutions

### Solution 1: Use Manual File Picker ⭐ RECOMMENDED
The most reliable method:

1. Scroll down on the Extract page
2. Find "Or use file picker:"
3. Click "Choose File" button
4. Select your stego image
5. Should see green checkmark with filename

**This bypasses any react-dropzone issues.**

### Solution 2: Check File Type
Make sure your file is actually an image:

**Windows:**
1. Right-click file → Properties
2. Check "Type of file"
3. Should say "PNG Image" or "JPEG Image"

**If it says something else:**
1. Open in image editor (Paint, GIMP)
2. Save As → PNG
3. Try uploading the new file

### Solution 3: Check File Size
Max size is 10MB:

**Windows:**
1. Right-click file → Properties
2. Check "Size"
3. Must be less than 10MB (10,485,760 bytes)

**If too large:**
1. Open in image editor
2. Resize or compress
3. Save and try again

### Solution 4: Clear Browser Data
Sometimes cached data causes issues:

1. Press `Ctrl+Shift+Delete`
2. Clear "Cached images and files"
3. Reload page (`Ctrl+F5`)
4. Try upload again

### Solution 5: Try Different Browser
Test in multiple browsers:
- Chrome
- Firefox  
- Edge
- Brave

If works in one but not another, it's a browser-specific issue.

### Solution 6: Check Browser Console
Essential for debugging:

1. Press `F12`
2. Go to "Console" tab
3. Try to upload
4. Look for error messages

**Common errors:**
- `File type not supported` → Wrong file format
- `File too large` → Reduce file size
- `Network error` → Backend not running
- Nothing → File not being selected (use manual picker)

## Testing Checklist

Run through this list:

- [ ] Backend is running (`http://localhost:5000/api/health`)
- [ ] Backend status shows green on Extract page
- [ ] File is PNG, JPG, or JPEG
- [ ] File is less than 10MB
- [ ] Browser console open (F12)
- [ ] Tried drag-and-drop
- [ ] Tried click to browse
- [ ] Tried manual file picker
- [ ] Cleared browser cache
- [ ] Tried different file
- [ ] Tried test-upload.html page

## Expected Behavior

### Successful Upload:
1. **Select file** (any method)
2. **Console shows:**
   ```
   FileUpload - Accepted types: ["image/png", "image/jpeg", "image/jpg"]
   Files dropped: [File]
   File selected: {name: "...", type: "...", size: ...}
   Validation result: {valid: true}
   ```
3. **UI shows:**
   - Green checkmark: "✓ Image loaded: filename.png (2.5 MB)"
   - File card with remove button
   - Extract button enabled

4. **Can now extract:**
   - Enter encryption key
   - Click "Extract Audio"
   - Progress bar appears
   - Audio extracts successfully

## Common Issues & Fixes

### "Nothing happens when I select file"

**Cause:** File not being selected at all

**Fix:**
1. Try manual file picker (guaranteed to work)
2. Check console for errors
3. Try different browser
4. Try test-upload.html to isolate issue

### "File is rejected"

**Cause:** Validation failure

**Fix:**
1. Check file type (must be image)
2. Check file size (must be < 10MB)
3. Check console for specific error
4. Re-save image in correct format

### "Upload works but extraction fails"

**Cause:** Different issue (not upload)

**Fix:**
1. Check backend is running (green badge)
2. Enter valid encryption key (16-32 chars)
3. Use stego image from Embed page
4. Check console for API errors

### "Drag and drop doesn't work"

**Cause:** React-dropzone or browser issue

**Fix:**
1. **Use manual file picker instead** ⭐
2. Try clicking the upload area
3. Try different browser
4. Check if any browser extensions interfere

## Test Cases

### Test 1: Valid Stego Image
**File:** PNG from Embed page  
**Expected:** ✅ Uploads and extracts successfully

### Test 2: Regular PNG
**File:** Any regular PNG image  
**Expected:** ✅ Uploads but extraction fails with "No embedded audio found"

### Test 3: Large File
**File:** Image > 10MB  
**Expected:** ❌ Rejected with size error

### Test 4: Wrong Type
**File:** PDF, TXT, etc.  
**Expected:** ❌ Rejected before upload

### Test 5: No Backend
**File:** Any valid image, backend stopped  
**Expected:** ✅ Uploads, ❌ Extraction fails with connection error

## Advanced Debugging

### Check Network Requests
1. Press F12 → Network tab
2. Upload file
3. Look for `/api/extract` request
4. Check request payload
5. Check response

### Check FormData
In console, after upload:
```javascript
// Should log the FormData contents
// Look for 'stego_image' and 'encryption_key' fields
```

### Check React State
Add React DevTools extension:
1. Install React DevTools
2. Open Components tab
3. Find ExtractPage component
4. Check `stegoImage` state
5. Should show File object when uploaded

## Still Not Working?

If none of the above works, please provide:

### 1. Test Results
- [ ] test-upload.html result (works/doesn't work)
- [ ] Manual file picker result
- [ ] Browser console output (copy/paste)

### 2. System Info
- Browser name and version
- Operating System
- Antivirus/security software

### 3. File Info
- File name and extension
- File type (from properties)
- File size
- Where file came from (Embed page / downloaded / other)

### 4. Screenshots
- Extract page
- Browser console
- File properties dialog

## Quick Fixes Summary

| Issue | Quick Fix |
|-------|-----------|
| Upload not working | Use manual file picker |
| Drag-drop doesn't work | Click upload area or use manual picker |
| File rejected | Check type (PNG/JPG) and size (< 10MB) |
| Nothing happens | Open console, look for errors |
| Extraction fails | Different issue - check backend status |

## Most Likely Solution

**90% of upload issues are solved by:**

1. **Using the manual file picker** (below the drag-drop area)
2. **Checking the file is actually an image** (PNG/JPG/JPEG)
3. **Checking file size** (< 10MB)

**Try these first!**
