# ✅ Pre-Deployment Verification Checklist

Run through this checklist before deploying to catch issues early.

---

## 📦 Code Verification

### 1. Required Files Exist

Check that these files exist in your project:

**Root Directory:**
- [ ] `package.json`
- [ ] `vercel.json`
- [ ] `vite.config.ts`
- [ ] `tsconfig.json`
- [ ] `.env.example`
- [ ] `.gitignore`
- [ ] `supabase-schema.sql`

**Python Engine Directory:**
- [ ] `python-engine/app.py`
- [ ] `python-engine/requirements.txt`
- [ ] `python-engine/Procfile`
- [ ] `python-engine/render.yaml`
- [ ] `python-engine/.env.example`

### 2. Dependencies Check

**Frontend:**
```bash
# Check if dependencies are installed
npm list --depth=0

# Should include:
# - @supabase/supabase-js
# - react
# - react-router-dom
# - axios
# - And others...
```

**Backend:**
```bash
cd python-engine

# Check requirements.txt includes:
# - Flask
# - Flask-CORS
# - gunicorn
# - numpy
# - Pillow
# - librosa
```

### 3. Environment Variables

**Check .env.example has all variables:**
```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_PROCESSING_ENGINE_URL=
VITE_APP_NAME=
VITE_APP_VERSION=
```

### 4. Git Status

```bash
# Make sure everything is committed
git status

# Should show: "nothing to commit, working tree clean"
```

---

## 🔍 Code Quality Checks

### 1. TypeScript Compilation

```bash
# Check for TypeScript errors
npm run type-check

# Should complete without errors
```

### 2. Linting

```bash
# Check for linting errors
npm run lint

# Fix auto-fixable issues
npm run lint -- --fix
```

### 3. Build Test

```bash
# Test production build
npm run build

# Should create 'dist' folder without errors
```

### 4. Preview Build

```bash
# Test built version locally
npm run preview

# Open http://localhost:4173
# Test navigation works
```

---

## 🔐 Security Checks

### 1. No Secrets in Code

Search for hardcoded secrets:

```bash
# Search for potential secrets (run in project root)
# On Windows PowerShell:
Select-String -Path .\src\*.tsx,.\src\*.ts -Pattern "(password|secret|key).*=.*['\"].*['\"]" -CaseSensitive

# Should return no results or only example/placeholder values
```

### 2. .gitignore Verification

Ensure these are in `.gitignore`:
```
.env
.env.local
.env.production
node_modules/
dist/
python-engine/.env
python-engine/venv/
python-engine/__pycache__/
python-engine/uploads/
python-engine/outputs/
```

### 3. Environment Files Not Committed

```bash
# Check git doesn't track .env files
git ls-files | findstr ".env"

# Should only show .env.example
```

---

## 🗄️ Database Schema Verification

### 1. SQL File Valid

Open `supabase-schema.sql` and verify:
- [ ] Contains CREATE TABLE statements
- [ ] Contains RLS policies
- [ ] Contains storage bucket policies
- [ ] No syntax errors
- [ ] No placeholder values (like 'your_user_id_here')

### 2. Required Tables

Schema should include:
- [ ] `profiles`
- [ ] `embeddings`
- [ ] `extractions`

---

## 🐍 Backend Verification

### 1. Python Dependencies

Check all imports are in requirements.txt:

```bash
cd python-engine

# Check each import in app.py has corresponding package:
# - Flask → Flask
# - flask_cors → Flask-CORS
# - numpy → numpy
# - PIL → Pillow
# - librosa → librosa
```

### 2. Python Version

```bash
# Check Python version
python --version

# Should be Python 3.10 or 3.11
```

### 3. Procfile Valid

Check `python-engine/Procfile`:
```
web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 300
```

### 4. Test Backend Locally (Optional)

```bash
cd python-engine

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run server
python app.py

# Test health endpoint
# Open browser: http://localhost:5000/api/health
```

---

## 📱 Frontend Verification

### 1. API Endpoints Check

Search for hardcoded localhost URLs that should use env vars:

```bash
# Search in source files
Select-String -Path .\src\**\*.ts,.\src\**\*.tsx -Pattern "localhost:5000"

# Replace any with import.meta.env.VITE_PROCESSING_ENGINE_URL
```

### 2. Routing Check

Open `src/App.tsx` and verify:
- [ ] Routes defined for all pages
- [ ] Protected routes have auth guard
- [ ] Fallback route exists (404)

### 3. Supabase Client Check

Open `src/lib/supabase.ts` and verify:
- [ ] Uses `import.meta.env.VITE_SUPABASE_URL`
- [ ] Uses `import.meta.env.VITE_SUPABASE_ANON_KEY`
- [ ] No hardcoded values

---

## 🌐 CORS Configuration

### 1. Backend CORS

Check `python-engine/app.py`:
```python
from flask_cors import CORS
CORS(app)  # Should be present
```

### 2. Allowed Origins

For production, update to:
```python
CORS(app, origins=[
    "http://localhost:5173",
    "https://*.vercel.app",
    "https://your-custom-domain.com"
])
```

---

## 📊 File Size Limits

### 1. Frontend Config

Check `src/pages/Embed.tsx` or relevant upload components:
- [ ] Max file size defined (50MB recommended)
- [ ] User-friendly error messages
- [ ] Progress indicators

### 2. Backend Config

Check `python-engine/app.py`:
```python
app.config['MAX_CONTENT_LENGTH'] = 200 * 1024 * 1024  # 200MB
```

### 3. Supabase Storage

Plan to set bucket limits:
- [ ] Cover images: 50MB max
- [ ] Audio files: 50MB max
- [ ] Stego images: 50MB max

---

## 🧪 Manual Testing (Local)

Before deploying, test these scenarios locally:

### Test 1: Authentication Flow
1. [ ] Sign up with new account
2. [ ] Receive confirmation email (if using email verification)
3. [ ] Login successfully
4. [ ] Logout works
5. [ ] Can't access protected routes when logged out

### Test 2: File Upload Flow
1. [ ] Upload valid cover image (PNG/JPG)
2. [ ] Upload valid audio file (WAV/MP3)
3. [ ] See upload progress
4. [ ] Receive success confirmation

### Test 3: Embedding Flow
1. [ ] Select cover image
2. [ ] Select audio file
3. [ ] Enter encryption key
4. [ ] Start embedding
5. [ ] See progress indicator
6. [ ] Download stego image
7. [ ] Check history entry created

### Test 4: Extraction Flow
1. [ ] Upload stego image
2. [ ] Enter correct encryption key
3. [ ] Start extraction
4. [ ] Download audio file
5. [ ] Verify audio is correct
6. [ ] Check history entry created

### Test 5: Error Handling
1. [ ] Upload invalid file type
2. [ ] Upload oversized file
3. [ ] Use wrong encryption key
4. [ ] Submit without required fields
5. [ ] All show appropriate errors

### Test 6: Responsive Design
1. [ ] Open on desktop (1920x1080)
2. [ ] Open on tablet (768px width)
3. [ ] Open on mobile (375px width)
4. [ ] All pages responsive

---

## 📋 Documentation Check

### Required Documentation

- [ ] README.md updated with deployment info
- [ ] VERCEL_RENDER_DEPLOYMENT.md complete
- [ ] QUICK_DEPLOY_CHECKLIST.md ready
- [ ] .env.example has all variables
- [ ] API endpoints documented

### Deployment Docs Ready

- [ ] Supabase setup instructions clear
- [ ] Render deployment steps complete
- [ ] Vercel deployment steps complete
- [ ] Environment variables listed
- [ ] Troubleshooting section included

---

## 🚀 Final Pre-Flight Checks

### 1. GitHub Repository

- [ ] Code pushed to GitHub
- [ ] Repository is public or private (as intended)
- [ ] README.md updated
- [ ] LICENSE file present
- [ ] .gitignore working correctly

### 2. Credentials Ready

Have these ready before starting deployment:

- [ ] Supabase account created
- [ ] Render account created
- [ ] Vercel account created
- [ ] GitHub account connected to all services

### 3. Time Allocation

Set aside time for deployment:
- [ ] 15 minutes for Supabase setup
- [ ] 20 minutes for Render deployment
- [ ] 10 minutes for Vercel deployment
- [ ] 5 minutes for final configuration
- [ ] 10 minutes for testing
- **Total: ~60 minutes**

### 4. Backup Current State

```bash
# Create backup branch
git branch backup-before-deployment
git push origin backup-before-deployment

# Tag current version
git tag v1.0.0-pre-deployment
git push --tags
```

---

## ✅ Ready to Deploy!

If all checks pass, you're ready to follow the deployment guide!

### Next Steps:

1. Open `VERCEL_RENDER_DEPLOYMENT.md`
2. Follow Part 1: Supabase Setup
3. Follow Part 2: Backend Deployment (Render)
4. Follow Part 3: Frontend Deployment (Vercel)
5. Follow Part 4: Final Configuration & Testing

---

## 🚨 If Any Checks Fail

**Don't deploy yet!** Fix the issues first:

1. Address all failing checks
2. Test locally again
3. Commit fixes
4. Re-run this checklist
5. Only deploy when all green ✅

---

## 📞 Useful Commands Summary

```bash
# Check dependencies
npm list --depth=0

# Type check
npm run type-check

# Lint
npm run lint

# Build
npm run build

# Preview build
npm run preview

# Git status
git status

# Check for uncommitted changes
git diff

# View git history
git log --oneline -10

# Create backup
git branch backup-$(date +%Y%m%d)
```

---

## 🎯 Success Criteria

You're ready to deploy when:

- ✅ All files present
- ✅ Dependencies installed
- ✅ No TypeScript errors
- ✅ No linting errors
- ✅ Build succeeds
- ✅ No secrets in code
- ✅ Database schema ready
- ✅ Backend tested locally
- ✅ Frontend tested locally
- ✅ All manual tests pass
- ✅ Documentation complete
- ✅ Code backed up
- ✅ Credentials ready
- ✅ Time allocated

**Status: Ready for Deployment! 🚀**
