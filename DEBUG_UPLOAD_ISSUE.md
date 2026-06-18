# Debug Upload Issue - Step by Step

## Issue Description
Image is not uploading/selecting on the Extract page when trying to extract audio.

## Debugging Steps Added

### 1. Enhanced Logging
I've added comprehensive console logging throughout the upload flow:

**FileUpload Component:**
- Logs accepted types and max size on mount
- Logs when files are dropped
- Logs file rejections with reasons
- Logs when onFileSelect is called

**ExtractPage Component:**
- Logs file details when selected (name, type, size)
- Logs validation results
- Shows success toast when image is selected
- Visual confirmation with green checkmark

### 2. Fallback File Input
Added a standard HTML file input as a fallback option if drag-and-drop isn't working.

## How to Debug

### Step 1: Open Browser Console
1. Press `F12` in your browser
2. Go to "Console" tab
3. Clear the console

### Step 2: Try to Upload a File
1. Go to Extract page
2. Try to select/upload an image
3. Watch the console output

### Step 3: Check Console Messages

#### If you see this - File selection is working:
```
FileUpload - Accepted types: ['image/png', 'image/jpeg', 'image/jpg']
FileUpload - Max size: 10485760
Files dropped: [File]
Calling onFileSelect with: File {name: "...", type: "...", size: ...}
File selected: {name: "...", type: "...", size: ...}
Validation result: {valid: true}
```

#### If you see file rejections:
```
File rejections: [{file: ..., errors: [...]}]
File rejection: file-invalid-type - File type must be...
```
**Solution:** File type not supported. Use PNG, JPG, or JPEG.

#### If you see nothing:
**Problem:** File not being selected at all.
**Try:**
1. Use the manual file input (below the drag-drop area)
2. Check if clicking the drag-drop area opens file picker
3. Try a different browser

#### If you see validation error:
```
Validation result: {valid: false, message: "..."}
```
**Problem:** File failed validation.
**Check:**
- File size (must be < 10MB)
- File type (must be image/png, image/jpeg, or image/jpg)

## Solutions to Try

### Solution 1: Use Manual File Picker
I've added a standard file input below the drag-drop area.
- Look for "Or use file picker:"
- Click "Choose File" button
- Select your image

### Solution 2: Check File Properties
Before uploading, check your file:
```
Windows: Right-click → Properties
```
- **Type:** Must be PNG, JPEG, or JPG
- **Size:** Must be less than 10MB

### Solution 3: Try Different File
Some image files might have incorrect MIME types:
1. Open the image in an image editor (Paint, GIMP, etc.)
2. Re-save as PNG
3. Try uploading the new file

### Solution 4: Check Browser Permissions
1. Check if browser is blocking file access
2. Try a different browser (Chrome, Firefox, Edge)
3. Check if any browser extensions are interfering

### Solution 5: Clear Browser Cache
1. Press `Ctrl+Shift+Delete`
2. Clear cache and reload page
3. Try upload again

## Expected Behavior

### Successful Upload Flow:
1. **Click or drag image** → Drag-drop area highlights
2. **File selected** → Console shows file details
3. **Validation passes** → Green checkmark appears
4. **Image loaded** → Shows: "✓ Image loaded: filename.png (2.5 MB)"
5. **Extract button enabled** → Can now extract audio

### Visual Indicators:
- ✅ Green checkmark with filename and size
- ✅ File details card with remove button
- ✅ "Extract Audio" button becomes enabled

## Common Issues & Fixes

### Issue 1: "Nothing happens when I click"
**Diagnosis:**
- Check console for errors
- Check if file picker dialog opens
- Try manual file input

**Fix:**
- Use the manual file picker
- Try different browser
- Check browser console for errors

### Issue 2: "File is rejected"
**Diagnosis:**
- Check console for rejection reason
- Verify file type and size

**Fix:**
- Ensure file is PNG, JPG, or JPEG
- Ensure file is less than 10MB
- Re-save image in correct format

### Issue 3: "File selects but Extract doesn't work"
**Diagnosis:**
- File selected successfully but extraction fails
- Check if encryption key is entered

**Fix:**
- Enter encryption key (16-32 characters)
- Check backend status (should be green)
- Check console for extraction errors

### Issue 4: "Drag and drop doesn't work"
**Diagnosis:**
- React-dropzone might be conflicting with something

**Fix:**
- **Use the manual file input instead**
- It's the standard HTML file input below the drag-drop area
- Works regardless of dropzone issues

## Test Files

### Create a Test Stego Image:
1. Go to Embed page
2. Upload any cover image
3. Upload any audio file
4. Enter encryption key: `test-key-12345678`
5. Download the stego image
6. Use this for testing extraction

### Test with Sample Images:
If you have the stego images in `python-engine/outputs/`:
- Try those first
- They are guaranteed to be valid stego images

## Report Format

If issue persists, please provide:

1. **Browser Console Output:**
   - Open console (F12)
   - Try to upload
   - Copy all messages

2. **File Details:**
   - File name
   - File type (right-click → properties)
   - File size

3. **Browser & OS:**
   - Browser name and version
   - Operating System

4. **What happens:**
   - Does file picker open?
   - Does file appear selected?
   - Any error messages?

5. **Screenshots:**
   - Screenshot of the page
   - Screenshot of console

## Quick Test Checklist

- [ ] Open browser console (F12)
- [ ] Try drag-and-drop upload
- [ ] Check console for messages
- [ ] Try manual file picker
- [ ] Check file type (PNG/JPG/JPEG)
- [ ] Check file size (< 10MB)
- [ ] Look for green checkmark after selection
- [ ] Verify backend status is green
- [ ] Try extraction with valid key

## Next Steps

With the enhanced logging, we can now see exactly where the upload is failing:
1. Is the file being selected by dropzone?
2. Is validation passing?
3. Is the component state updating?

**Please try uploading a file now and share what you see in the console!**
