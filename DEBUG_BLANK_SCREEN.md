# 🔍 Debug Blank Screen Issue

## Step-by-Step Debugging

### Step 1: Verify Server is Running

In your terminal where you ran `npm run dev`, you should see:
```
VITE v5.x.x ready in XXX ms

➜  Local:   http://localhost:3000/
➜  Network: use --host to expose
```

**❌ If you DON'T see this:**
- The server didn't start
- Check for error messages in terminal
- Try: `npm install` again
- Try: Delete `node_modules/.vite` and restart

---

### Step 2: Check the Correct URL

**IMPORTANT:** Vite config sets port to 3000, but default is 5173

Try BOTH URLs:
- http://localhost:3000 ← (Should be this one)
- http://localhost:5173 ← (Old default)

---

### Step 3: Test Static Page

Go to: **http://localhost:3000/test.html**

**✅ If you see the test page:**
- Server works
- Browser works
- Problem is with React app

**❌ If you DON'T see test page:**
- Server not running
- Wrong port
- Firewall blocking

---

### Step 4: Open Browser Console

1. Press **F12** (or Right-click → Inspect)
2. Go to **Console** tab
3. Refresh page (**Ctrl+R**)
4. Look for **RED error messages**

**Common Errors & Solutions:**

**Error: "Failed to fetch dynamically imported module"**
```bash
# Solution: Clear Vite cache
rmdir /s /q node_modules\.vite
npm run dev
# Then hard refresh: Ctrl+Shift+R
```

**Error: "Uncaught SyntaxError"**
```bash
# Solution: Rebuild
npm run build
npm run dev
```

**Error: "Cannot find module '@/...'"**
```bash
# Solution: Path aliases issue
# Check tsconfig.json has correct paths
```

**Error: Nothing in console, just blank**
```bash
# Solution: Check React is rendering
# See Step 5 below
```

---

### Step 5: Simple React Test

Let's verify React works with a minimal test:

**Temporarily edit `src/main.tsx`:**

```typescript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Minimal test component
function TestApp() {
  return (
    <div style={{ padding: '50px' }}>
      <h1 style={{ color: '#2563EB' }}>React Works! 🎉</h1>
      <p>If you see this, React is rendering</p>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TestApp />
  </React.StrictMode>
);
```

Save and check browser. Do you see "React Works!"?

**✅ YES:** React works, problem is in App.tsx
**❌ NO:** React isn't rendering, check console for errors

---

### Step 6: Check Network Tab

1. Open Dev Tools (F12)
2. Go to **Network** tab
3. Refresh page (Ctrl+R)
4. Look at the list of files loading

**Check:**
- Is `main.tsx` loading? (Should be 200 status)
- Is `index.css` loading?
- Are there any **failed** requests (red)?

---

### Step 7: Try Different Browser

Sometimes cache issues are browser-specific.

Try:
- Chrome
- Firefox
- Edge

Does it work in any of them?

---

### Step 8: Clear Everything and Restart

```bash
# Stop server (Ctrl+C)

# Clear Vite cache
rmdir /s /q node_modules\.vite

# Clear browser cache
# In browser: Ctrl+Shift+Delete → Clear all

# Restart server
npm run dev

# Hard refresh browser
# Ctrl+Shift+R (or Ctrl+F5)
```

---

### Step 9: Check for Port Conflicts

Maybe something else is using port 3000:

```bash
# Check what's on port 3000
netstat -ano | findstr :3000

# If something is there, kill it
taskkill /PID <PID> /F

# Or change port in vite.config.ts:
# server: { port: 3001 }
```

---

### Step 10: Nuclear Option - Fresh Install

```bash
# Stop server

# Delete everything
rmdir /s /q node_modules
del package-lock.json

# Reinstall
npm install

# Start
npm run dev
```

---

## What to Report

If still not working, please provide:

1. **Terminal output** when running `npm run dev`
2. **Browser console errors** (F12 → Console → screenshot)
3. **Network tab** (F12 → Network → screenshot)
4. **Which step fails** from above

---

## Quick Fixes Checklist

Try these in order:

- [ ] Verify `npm run dev` shows "VITE ready"
- [ ] Try http://localhost:3000/test.html
- [ ] Open browser console (F12)
- [ ] Hard refresh (Ctrl+Shift+R)
- [ ] Clear Vite cache: `rmdir /s /q node_modules\.vite`
- [ ] Try different browser
- [ ] Check port 3000 isn't used by something else
- [ ] Reinstall: delete node_modules, `npm install`

---

## Most Likely Issues

Based on "blank screen":

1. **Cache problem** (90% of cases)
   - Solution: Ctrl+Shift+R
   
2. **Wrong port** (5%)
   - Solution: Try :3000 and :5173

3. **Server not running** (3%)
   - Solution: Check terminal for "VITE ready"

4. **Import errors** (2%)
   - Solution: Check console for red errors

---

**Need more help?** 

Go through each step above and note where it fails. That will pinpoint the exact issue!
