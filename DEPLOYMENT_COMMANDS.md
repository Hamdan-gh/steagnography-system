# 🖥️ Deployment Commands Reference

Quick reference for all commands you'll need during deployment.

---

## 📦 Pre-Deployment Commands

### Check Project Status
```bash
# Check if code builds successfully
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting issues
npm run lint

# Fix auto-fixable linting issues
npm run lint -- --fix

# Preview production build locally
npm run preview
```

### Git Commands
```bash
# Check current status
git status

# See what changed
git diff

# Check remote connection
git remote -v

# View commit history
git log --oneline -10

# Create backup branch
git branch backup-before-deployment
git push origin backup-before-deployment

# Add all changes
git add .

# Commit changes
git commit -m "Prepare for deployment"

# Push to GitHub
git push origin main

# Tag a version
git tag v1.0.0
git push --tags
```

---

## 🐍 Backend Setup Commands (Optional Local Testing)

### Create Python Virtual Environment
```bash
# Navigate to backend folder
cd python-engine

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
venv\Scripts\activate

# Activate virtual environment (Mac/Linux)
source venv/bin/activate

# Upgrade pip
python -m pip install --upgrade pip

# Install dependencies
pip install -r requirements.txt

# Check installed packages
pip list

# Run local server
python app.py

# Test health endpoint
# Open browser: http://localhost:5000/api/health

# Deactivate virtual environment when done
deactivate
```

### Test Backend Locally (Optional)
```bash
# Start Flask development server
cd python-engine
python app.py

# In another terminal, test with curl (Windows PowerShell):
Invoke-WebRequest -Uri http://localhost:5000/api/health

# Expected response:
# {"status": "healthy", "version": "1.0.0", "service": "StegaGen Processing Engine"}
```

---

## 🌐 Vercel Deployment Commands

### Install Vercel CLI (Optional - if not using web interface)
```bash
# Install globally
npm install -g vercel

# Or install as dev dependency
npm install --save-dev vercel

# Login to Vercel
vercel login

# Deploy to production
vercel --prod

# Check deployment status
vercel ls

# View logs
vercel logs

# Set environment variable
vercel env add VITE_SUPABASE_URL production

# Remove deployment
vercel remove [deployment-url]
```

### Using Vercel from Package.json (Alternative)
```json
{
  "scripts": {
    "deploy": "vercel --prod"
  }
}
```

```bash
# Then deploy with:
npm run deploy
```

---

## 🔧 Render Commands (CLI - Optional)

### Install Render CLI (Optional)
```bash
# Install using npm
npm install -g render-cli

# Login
render login

# List services
render services

# View logs
render logs [service-id]

# Restart service
render restart [service-id]

# Deploy (from git push - automatic)
git push origin main
```

---

## 🗄️ Supabase Commands (Optional - CLI)

### Install Supabase CLI (Optional)
```bash
# Install globally
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Pull schema from remote
supabase db pull

# Reset local database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --project-id your-project-id > src/types/supabase.ts
```

---

## 🧪 Testing Commands

### Frontend Testing
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open in browser
# http://localhost:5173

# Build for production
npm run build

# Preview production build
npm run preview

# Check bundle size
npm run build -- --analyze
```

### Backend Testing
```bash
cd python-engine

# Test health endpoint
# Windows PowerShell:
Invoke-WebRequest -Uri http://localhost:5000/api/health

# Test with curl (if installed):
curl http://localhost:5000/api/health

# Test embedding endpoint (example)
# Create test files first, then:
curl -X POST http://localhost:5000/api/embed \
  -F "cover_image=@path/to/image.png" \
  -F "audio_file=@path/to/audio.wav" \
  -F "encryption_key=test123"
```

---

## 📊 Monitoring Commands

### Check Deployment Status

**Vercel:**
```bash
# View deployments
vercel ls

# View logs of latest deployment
vercel logs

# View specific deployment
vercel inspect [deployment-url]
```

**Render:**
```bash
# View service logs (from dashboard or CLI)
render logs [service-id]

# SSH into service (if enabled)
render ssh [service-id]
```

---

## 🔄 Continuous Deployment

### Auto-Deploy Setup (Already Configured!)

When you push to GitHub, both Vercel and Render will automatically deploy:

```bash
# Make changes to your code
# Stage changes
git add .

# Commit with descriptive message
git commit -m "Add new feature: user profile page"

# Push to GitHub
git push origin main

# Vercel will auto-deploy frontend (~2-3 minutes)
# Render will auto-deploy backend (~5-10 minutes)
```

### Force Redeploy

**Vercel:**
- Go to dashboard → Deployments
- Click "..." on latest deployment → Redeploy

**Render:**
- Go to dashboard → Manual Deploy
- Click "Deploy latest commit"

---

## 🐛 Debugging Commands

### View Logs

**Frontend (Vercel):**
```bash
# Via CLI
vercel logs

# Via browser console (F12)
# Check Console and Network tabs
```

**Backend (Render):**
```bash
# Via dashboard: Dashboard → Logs tab
# Or via CLI:
render logs [service-id]

# View last 100 lines
render logs [service-id] --tail 100

# Follow logs in real-time
render logs [service-id] --follow
```

### Check Environment Variables

**Vercel:**
```bash
# List env vars
vercel env ls

# Pull env vars to local
vercel env pull
```

**Render:**
```bash
# View in dashboard: Dashboard → Environment tab
# Or list via CLI:
render env [service-id]
```

---

## 🔐 Security Commands

### Check for Secrets in Code
```bash
# Search for potential secrets (Windows PowerShell)
Select-String -Path .\src\*.tsx,.\src\*.ts -Pattern "(password|secret|key|token).*=.*['\"].*['\"]"

# Check what's being committed
git diff --cached

# View .gitignore
type .gitignore

# Check if .env is ignored
git check-ignore .env
```

### Audit Dependencies
```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Check outdated packages
npm outdated

# Update packages
npm update
```

---

## 📈 Performance Commands

### Analyze Bundle Size
```bash
# Build and analyze
npm run build

# View dist folder size
# Windows:
Get-ChildItem -Path .\dist -Recurse | Measure-Object -Property Length -Sum

# Check specific file sizes
ls -lh dist/assets/
```

### Lighthouse Audit
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit on deployed site
lighthouse https://your-app.vercel.app --view

# Save report
lighthouse https://your-app.vercel.app --output html --output-path ./report.html
```

---

## 🧹 Cleanup Commands

### Clean Local Files
```bash
# Remove node_modules
rm -rf node_modules

# Remove dist folder
rm -rf dist

# Remove Python cache
rm -rf python-engine/__pycache__
rm -rf python-engine/venv

# Reinstall dependencies
npm install
```

### Clean Git History (Advanced)
```bash
# Remove large files from history (use with caution!)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch path/to/large/file" \
  --prune-empty --tag-name-filter cat -- --all

# Clean up
git reflog expire --expire=now --all
git gc --prune=now --aggressive
```

---

## 📦 Package Management

### Update Dependencies
```bash
# Check for updates
npm outdated

# Update all packages to latest
npm update

# Update specific package
npm update package-name

# Install latest version
npm install package-name@latest

# Save exact versions
npm install --save-exact package-name
```

### Lock File Management
```bash
# Regenerate package-lock.json
rm package-lock.json
npm install

# Verify lock file
npm ci

# Update lock file only
npm install --package-lock-only
```

---

## 🎯 Quick Commands Summary

### Daily Development
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
git status           # Check changes
git add .            # Stage changes
git commit -m "msg"  # Commit changes
git push             # Deploy (auto-deploys to Vercel + Render)
```

### Deployment Day
```bash
npm run type-check   # Check TypeScript
npm run lint         # Check linting
npm run build        # Build production
git add .            # Stage all
git commit -m "msg"  # Commit
git push origin main # Push & auto-deploy
```

### Troubleshooting
```bash
npm run build        # Check if build works
vercel logs          # Check frontend logs
render logs          # Check backend logs
npm audit            # Check security
npm outdated         # Check updates
```

---

## 💡 Command Tips

### Aliases (Optional - Add to your shell profile)

**Windows PowerShell** (`$PROFILE` file):
```powershell
function gst { git status }
function gaa { git add . }
function gcm { git commit -m $args }
function gp { git push }
function nb { npm run build }
function nd { npm run dev }
```

**Mac/Linux** (`~/.bashrc` or `~/.zshrc`):
```bash
alias gst='git status'
alias gaa='git add .'
alias gcm='git commit -m'
alias gp='git push'
alias nb='npm run build'
alias nd='npm run dev'
```

Then use:
```bash
gst           # Instead of git status
gaa           # Instead of git add .
gcm "message" # Instead of git commit -m "message"
gp            # Instead of git push
```

---

## 🆘 Emergency Commands

### Rollback Deployment

**Vercel:**
1. Go to Vercel dashboard → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

**Render:**
1. Go to Render dashboard
2. Click "Manual Deploy"
3. Select previous commit to deploy

**Via Git:**
```bash
# Revert last commit
git revert HEAD
git push origin main

# Or reset to specific commit (use carefully!)
git reset --hard [commit-hash]
git push origin main --force
```

### Fix Broken Build
```bash
# Clean everything
rm -rf node_modules dist package-lock.json

# Reinstall
npm install

# Try building again
npm run build
```

### Database Reset (Use with EXTREME caution!)
```bash
# In Supabase SQL Editor, run:
# DROP SCHEMA public CASCADE;
# CREATE SCHEMA public;
# GRANT ALL ON SCHEMA public TO postgres;
# GRANT ALL ON SCHEMA public TO public;

# Then re-run your schema SQL file
```

---

## 📝 Notes

- Most deployment is done via web dashboards (easier!)
- CLI commands are optional but useful for automation
- Always test locally before deploying
- Keep environment variables secure
- Regular backups are important

---

**Ready to deploy? Start with: [START_DEPLOYMENT_HERE.md](./START_DEPLOYMENT_HERE.md)** 🚀
