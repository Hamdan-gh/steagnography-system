# 🔧 Troubleshooting Guide

## Common Issues and Solutions

### Issue 1: Blank Screen / Nothing Showing ✅ SOLVED

**Problem**: Frontend shows blank white screen.

**Cause**: Missing `.env` file or Supabase not configured.

**Solution**:
1. Make sure `.env` file exists in project root
2. The app now shows a Welcome page even without Supabase
3. To enable full features, configure Supabase (see QUICKSTART.md Step 2)

**Quick Fix**:
```bash
# Run the dev server
npm run dev

# Open http://localhost:3000
# You should see the Welcome page
```

---

### Issue 2: "Cannot find module 'tailwindcss-animate'"

**Solution**: Already fixed! Package installed.

---

### Issue 3: Port 5000 Already in Use

**Problem**: Python backend can't start because port 5000 is in use.

**Solution (Windows)**:
```bash
# Find process
netstat -ano | findstr :5000

# Kill it (replace PID with actual number)
taskkill /PID <PID> /F
```

**Or change port**:
Edit `python-engine/app.py`:
```python
app.run(host='0.0.0.0', port=5001, debug=True)
```

Update `.env`:
```env
VITE_PROCESSING_ENGINE_URL=http://localhost:5001
```

---

### Issue 4: Python Module Errors

**Problem**: `ModuleNotFoundError` when starting Python engine.

**Solution**:
```bash
cd python-engine
pip install -r requirements.txt --force-reinstall
```

If that doesn't work:
```bash
# Install individually
pip install Flask Flask-CORS numpy scipy Pillow librosa soundfile pycryptodome deap scikit-image python-dotenv werkzeug
```

---

### Issue 5: Supabase Connection Failed

**Problem**: Can't connect to Supabase.

**Solution**:
1. Check `.env` file has correct credentials
2. Verify Supabase project is running (not paused)
3. Check database schema was created
4. Verify storage buckets exist

**Test Connection**:
Open browser console (F12) and check for errors.

---

### Issue 6: Authentication Not Working

**Problem**: Can't login or signup.

**Causes & Solutions**:
- **No Supabase configured**: Follow QUICKSTART.md Step 2
- **Database not setup**: Run `supabase-schema.sql` in Supabase SQL Editor
- **Wrong credentials**: Double-check `.env` file

---

### Issue 7: File Upload Fails

**Problem**: Can't upload images or audio files.

**Solutions**:
1. Check file size (images <10MB, audio <5MB)
2. Verify file format (PNG/JPEG for images, WAV/MP3 for audio)
3. Ensure storage buckets exist in Supabase
4. Check storage policies are configured

---

### Issue 8: "npm install" Fails

**Problem**: Errors during `npm install`.

**Solution**:
```bash
# Clear cache
npm cache clean --force

# Delete node_modules
rmdir /s /q node_modules

# Reinstall
npm install
```

---

### Issue 9: Build Errors

**Problem**: TypeScript or build errors.

**Solution**:
```bash
# Check TypeScript
npm run type-check

# Clean build
rm -rf dist
npm run build
```

---

### Issue 10: Slow Processing

**Problem**: Embedding takes too long.

**Solutions**:
1. Use smaller images (1024x1024 or less)
2. Reduce GA generations to 50-100
3. Reduce population size to 30-50
4. Compress audio files before uploading

---

## Quick Diagnostics

### Check Everything is Working

**1. Frontend Running?**
```bash
npm run dev
# Should see: Local: http://localhost:3000
```

**2. Can Access Frontend?**
- Open http://localhost:3000
- Should see Welcome page

**3. Backend Running?**
```bash
cd python-engine
python app.py
# Should see: Running on http://127.0.0.1:5000
```

**4. Supabase Connected?**
- Open browser console (F12)
- No Supabase errors = good
- Warning about credentials = need to configure

---

## Getting More Help

1. **Check Logs**
   - Browser console (F12)
   - Python terminal output
   - Supabase dashboard logs

2. **Review Documentation**
   - QUICKSTART.md - Setup guide
   - SETUP.md - Detailed instructions
   - DOCUMENTATION.md - Technical details

3. **Common Log Messages**

**✅ Good Messages**:
```
VITE ready in 500 ms
Running on http://127.0.0.1:5000
```

**⚠️ Warning Messages**:
```
Supabase credentials not configured
# Solution: Follow QUICKSTART.md Step 2
```

**❌ Error Messages**:
```
Cannot find module
# Solution: npm install or pip install

Port already in use
# Solution: Kill process or change port

Connection refused
# Solution: Start the server
```

---

## System Requirements

**Minimum**:
- Node.js 18+
- Python 3.9+
- 4GB RAM
- Modern browser

**Check Versions**:
```bash
node --version    # Should be 18+
python --version  # Should be 3.9+
npm --version     # Any recent version
```

---

## Still Stuck?

1. Check you're in the correct directory
2. Ensure both `.env` and `python-engine/.env` exist
3. Try restarting both servers
4. Clear browser cache
5. Check firewall isn't blocking ports 3000 or 5000

---

## Success Indicators

✅ Frontend shows Welcome page
✅ No errors in browser console
✅ Python backend shows "Running on..."
✅ Can navigate to Login/Signup pages
✅ After Supabase setup, can create account

---

**Your Current Status**:
- ✅ Dependencies installed
- ✅ .env file created
- ✅ Welcome page works
- ⏳ Supabase needs configuration (optional for testing)

**Next Step**: Open QUICKSTART.md and continue from Step 2!
