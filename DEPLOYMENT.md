# Deployment Guide - StegaGen Secure

Complete guide for deploying the Audio Steganography System to production.

## Architecture Overview

```
Frontend (Vercel)  →  Supabase (Database + Storage)  ←  Python Engine (Railway)
```

## Part 1: Supabase Production Setup

### 1. Prepare Production Database

1. **Upgrade Plan (if needed)**
   - Free tier is sufficient for testing
   - Pro plan recommended for production

2. **Run Database Schema**
   ```sql
   -- Execute supabase-schema.sql in SQL Editor
   -- This creates all tables, indexes, and RLS policies
   ```

3. **Create Storage Buckets**
   - `images` (public)
   - `audio` (private)
   - `stego-images` (private)

4. **Configure CORS**
   - Go to Settings → API
   - Add allowed origins:
     - `https://your-frontend-domain.vercel.app`
     - `http://localhost:3000` (for development)

5. **Set Up Authentication**
   - Enable Email provider
   - Configure email templates
   - Set up email redirect URLs

### 2. Security Configuration

1. **Enable RLS on all tables**
   ```sql
   -- Already included in supabase-schema.sql
   ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
   ```

2. **Configure Service Role Key**
   - Keep it SECRET
   - Only use server-side
   - Never expose to frontend

3. **Set Up Rate Limiting**
   - Configure in Supabase dashboard
   - Recommended: 100 requests/minute per IP

## Part 2: Python Engine Deployment (Railway)

### 1. Prepare for Deployment

Create `Procfile` in `python-engine/`:
```
web: gunicorn app:app --bind 0.0.0.0:$PORT --workers 2 --timeout 300
```

Update `requirements.txt`:
```bash
cd python-engine
echo "gunicorn==21.2.0" >> requirements.txt
```

### 2. Deploy to Railway

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login and Initialize**
   ```bash
   railway login
   cd python-engine
   railway init
   ```

3. **Set Environment Variables**
   ```bash
   railway variables set FLASK_ENV=production
   railway variables set SECRET_KEY=your_production_secret
   railway variables set MAX_CONTENT_LENGTH=52428800
   ```

4. **Deploy**
   ```bash
   railway up
   ```

5. **Get Deployment URL**
   ```bash
   railway domain
   # Output: https://your-app.railway.app
   ```

### 3. Alternative: Deploy to Heroku

```bash
# Login to Heroku
heroku login

# Create app
cd python-engine
heroku create stegagen-api

# Add Python buildpack
heroku buildpacks:set heroku/python

# Set environment variables
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your_secret

# Deploy
git push heroku main

# Get URL
heroku domains
```

## Part 3: Frontend Deployment (Vercel)

### 1. Prepare for Deployment

Update `.env.production`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
VITE_PROCESSING_ENGINE_URL=https://your-api.railway.app
VITE_APP_NAME=StegaGen Secure
VITE_APP_VERSION=1.0.0
```

### 2. Deploy to Vercel

**Method 1: Vercel CLI**
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

**Method 2: GitHub Integration**

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "Import Project"
4. Select your repository
5. Configure:
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
6. Add environment variables
7. Deploy

### 3. Configure Custom Domain (Optional)

1. Go to Vercel project settings
2. Add custom domain
3. Update DNS records:
   ```
   Type: CNAME
   Name: @
   Value: cname.vercel-dns.com
   ```

## Part 4: Environment Variables

### Frontend (Vercel)

Add in Vercel Dashboard → Settings → Environment Variables:

| Variable | Value | Description |
|----------|-------|-------------|
| VITE_SUPABASE_URL | https://xxx.supabase.co | Supabase project URL |
| VITE_SUPABASE_ANON_KEY | eyJxxx... | Supabase anon key |
| VITE_PROCESSING_ENGINE_URL | https://api.railway.app | Python API URL |
| VITE_APP_NAME | StegaGen Secure | App name |
| VITE_APP_VERSION | 1.0.0 | Version |

### Backend (Railway/Heroku)

| Variable | Value | Description |
|----------|-------|-------------|
| FLASK_ENV | production | Flask environment |
| FLASK_DEBUG | False | Disable debug |
| SECRET_KEY | xxx | Secret key |
| MAX_CONTENT_LENGTH | 52428800 | Max upload 50MB |
| UPLOAD_FOLDER | uploads | Upload directory |
| OUTPUT_FOLDER | outputs | Output directory |

## Part 5: Post-Deployment Checklist

### Security

- [ ] All environment variables set
- [ ] No secrets in code
- [ ] HTTPS enabled
- [ ] CORS configured correctly
- [ ] RLS policies active
- [ ] Rate limiting enabled
- [ ] Strong encryption keys

### Functionality

- [ ] Can create account
- [ ] Can login/logout
- [ ] Can upload images
- [ ] Can upload audio
- [ ] Embedding works
- [ ] Extraction works
- [ ] Downloads work
- [ ] Dashboard loads
- [ ] History displays
- [ ] Metrics calculate correctly

### Performance

- [ ] Page load < 3 seconds
- [ ] API response < 2 seconds
- [ ] Embedding completes within timeout
- [ ] No memory leaks
- [ ] Proper error handling

### Monitoring

- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Uptime monitoring
- [ ] Performance monitoring
- [ ] Log aggregation

## Part 6: Monitoring & Maintenance

### Set Up Error Tracking

**Sentry Integration:**

```bash
npm install @sentry/react
```

```typescript
// src/main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your_sentry_dsn",
  environment: "production",
});
```

### Set Up Analytics

**Google Analytics:**

```html
<!-- index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Database Backups

1. **Supabase Backups**
   - Enable automatic daily backups
   - Download manual backup weekly
   - Store in secure location

2. **Storage Backups**
   - Configure bucket replication
   - Download important files periodically

### Monitoring Endpoints

Create health check endpoints:

```python
# app.py
@app.route('/health')
def health():
    return {
        'status': 'healthy',
        'timestamp': time.time(),
        'version': '1.0.0'
    }
```

Set up monitoring:
- **UptimeRobot**: Monitor uptime
- **Pingdom**: Performance monitoring
- **New Relic**: Application monitoring

## Part 7: Scaling Considerations

### Frontend Scaling

- ✅ Vercel auto-scales
- ✅ CDN caching enabled
- ✅ Image optimization
- ✅ Code splitting

### Backend Scaling

**Horizontal Scaling:**
```bash
# Railway: Increase replicas
railway scale --replicas 3
```

**Vertical Scaling:**
```bash
# Railway: Increase resources
railway up --memory 2GB --cpu 2
```

### Database Scaling

- Upgrade Supabase plan
- Enable connection pooling
- Add read replicas
- Implement caching (Redis)

### Storage Optimization

- Implement CDN for images
- Compress files before storage
- Set up lifecycle policies
- Monitor storage usage

## Part 8: Cost Optimization

### Free Tier Limits

**Vercel:**
- 100GB bandwidth/month
- Unlimited deployments
- Serverless functions

**Supabase:**
- 500MB database
- 1GB file storage
- 50,000 monthly active users

**Railway:**
- $5 free credit/month
- Pay for usage beyond

### Cost Reduction Tips

1. **Optimize Images**
   - Compress before upload
   - Use WebP format
   - Lazy loading

2. **Cache Aggressively**
   - Static assets: 1 year
   - API responses: 5 minutes
   - Database queries: 1 minute

3. **Clean Up Storage**
   - Delete old files
   - Implement retention policy
   - Archive unused data

## Part 9: Troubleshooting Production Issues

### Common Issues

**1. CORS Errors**
```python
# app.py - ensure CORS is configured
from flask_cors import CORS
CORS(app, origins=["https://your-domain.vercel.app"])
```

**2. 413 Payload Too Large**
```python
# Increase max content length
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024
```

**3. Timeout Errors**
```python
# Increase gunicorn timeout
# Procfile: --timeout 300
```

**4. Memory Issues**
```python
# Optimize image processing
import gc
# After processing
gc.collect()
```

### Debug Mode

Never enable in production:
```python
if __name__ == '__main__':
    app.run(debug=False)  # Always False in production
```

## Part 10: Continuous Deployment

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

### Auto-Deploy Pipeline

1. Push to GitHub
2. Tests run automatically
3. Build and deploy to staging
4. Manual approval
5. Deploy to production

---

## Success Criteria

✅ Application accessible via HTTPS
✅ All features working
✅ Fast load times (<3s)
✅ No errors in console
✅ Mobile responsive
✅ Secure (A+ SSL rating)
✅ Monitored (uptime, errors)
✅ Backed up (database, files)

**Your production deployment is complete!** 🎉
