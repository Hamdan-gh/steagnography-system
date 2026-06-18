# 🏗️ Deployment Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         Internet                             │
└────────────┬────────────────────────────────┬───────────────┘
             │                                 │
             │                                 │
    ┌────────▼─────────┐              ┌───────▼──────────┐
    │   Vercel CDN     │              │  Render.com      │
    │   (Frontend)     │              │  (Backend API)   │
    │                  │              │                  │
    │  React + Vite    │◄────────────►│  Flask + Python  │
    │  TypeScript      │   API Calls  │  Gunicorn        │
    │  Tailwind CSS    │              │  Processing      │
    └────────┬─────────┘              └───────┬──────────┘
             │                                 │
             │                                 │
             │        ┌───────────────────┐    │
             └───────►│    Supabase       │◄───┘
                      │                   │
                      │  • PostgreSQL DB  │
                      │  • File Storage   │
                      │  • Authentication │
                      │  • Real-time APIs │
                      └───────────────────┘
```

## Data Flow

### 1. User Registration/Login
```
User → Vercel → Supabase Auth → Database
                      ↓
                 JWT Token
                      ↓
                   Vercel
                      ↓
                    User
```

### 2. Audio Embedding
```
User (Browser)
  ↓
  ├─ Cover Image ──────────────┐
  ├─ Audio File ───────────────┤
  └─ Encryption Key ───────────┤
                                ↓
                          Vercel (Frontend)
                                ↓
                          Upload to Supabase Storage
                                ↓
                    Get Download URLs + Metadata
                                ↓
                          Send to Render API
                                ↓
                    Render Downloads Files from Supabase
                                ↓
                    Python Processing (LSB + Encryption)
                                ↓
                    Generate Stego Image
                                ↓
                    Upload Result to Supabase Storage
                                ↓
                    Return URLs + Metrics
                                ↓
                    Vercel Updates UI
                                ↓
                    Save History to Database
                                ↓
                    User Downloads Result
```

### 3. Audio Extraction
```
User (Browser)
  ↓
  ├─ Stego Image ──────────────┐
  └─ Encryption Key ───────────┤
                                ↓
                          Vercel (Frontend)
                                ↓
                          Upload to Supabase Storage
                                ↓
                          Send to Render API
                                ↓
                    Render Downloads from Supabase
                                ↓
                    Python Processing (Extract + Decrypt)
                                ↓
                    Generate Audio File
                                ↓
                    Upload to Supabase Storage
                                ↓
                    Return URLs + Metrics
                                ↓
                    Vercel Updates UI
                                ↓
                    Save History to Database
                                ↓
                    User Downloads Audio
```

## Service Responsibilities

### Vercel (Frontend)
**Responsibilities:**
- Serve static website
- Handle routing (React Router)
- User interface rendering
- Form validation
- File uploads to Supabase
- API orchestration
- State management (Zustand)

**Technologies:**
- React 18
- TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router
- Axios (HTTP client)

**Performance:**
- Global CDN distribution
- Automatic HTTPS
- Edge caching
- Instant deployments
- Zero cold starts

### Render (Backend)
**Responsibilities:**
- Audio steganography processing
- LSB embedding algorithm
- Audio encryption/decryption
- Image processing
- Metrics calculation
- File validation
- Error handling

**Technologies:**
- Python 3.11
- Flask web framework
- Gunicorn WSGI server
- NumPy (numeric processing)
- Pillow (image processing)
- Librosa (audio processing)
- PyCryptodome (encryption)

**Performance:**
- 2 worker processes
- 300s timeout for long operations
- Cold start ~30-60s on free tier
- Auto-scaling on paid tier

### Supabase (Database & Storage)
**Responsibilities:**
- User authentication
- Session management
- User profiles storage
- Embedding/extraction history
- File storage (images & audio)
- Real-time subscriptions
- Row Level Security (RLS)

**Technologies:**
- PostgreSQL 15
- Storage buckets (S3-compatible)
- Authentication JWT tokens
- Real-time API (websockets)
- REST API
- Row Level Security

**Features:**
- Automatic backups
- Point-in-time recovery
- Global CDN for storage
- Automatic SSL
- API rate limiting

## Security Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Security Layers                     │
├─────────────────────────────────────────────────────┤
│                                                      │
│  1. HTTPS/SSL (Transport Layer)                     │
│     • Automatic SSL certificates (Vercel/Render)    │
│     • TLS 1.3 encryption                            │
│                                                      │
│  2. Authentication (Supabase)                       │
│     • JWT tokens (httpOnly cookies)                 │
│     • Email verification                            │
│     • Password hashing (bcrypt)                     │
│     • Session management                            │
│                                                      │
│  3. Authorization (Row Level Security)              │
│     • Database-level access control                 │
│     • User can only access their own data           │
│     • Automatic policy enforcement                  │
│                                                      │
│  4. File Encryption                                 │
│     • AES-256 encryption for audio                  │
│     • User-provided encryption keys                 │
│     • No keys stored on server                      │
│                                                      │
│  5. Input Validation                                │
│     • File type validation                          │
│     • File size limits                              │
│     • Content sanitization                          │
│     • SQL injection prevention                      │
│                                                      │
│  6. CORS Protection                                 │
│     • Allowed origins whitelist                     │
│     • Credential handling                           │
│     • Preflight caching                             │
│                                                      │
└─────────────────────────────────────────────────────┘
```

## Scaling Strategy

### Current Limits (Free Tier)

| Resource | Limit | Impact |
|----------|-------|--------|
| Vercel Bandwidth | 100GB/mo | ~10K users/month |
| Render Compute | 750hrs/mo | Always available |
| Supabase DB | 500MB | ~50K records |
| Supabase Storage | 1GB | ~100 embedding operations |
| Concurrent Users | 50-100 | Free tier limit |

### Scaling Path

**Stage 1: Free Tier (0-1K users/month)**
- Current setup
- No changes needed
- Cost: $0/month

**Stage 2: Light Usage (1K-10K users/month)**
- Upgrade Supabase to Pro: $25/mo
- Upgrade Render to Starter: $7/mo
- Keep Vercel Free
- Cost: $32/month

**Stage 3: Medium Usage (10K-100K users/month)**
- Supabase Pro: $25/mo
- Render Professional: $85/mo (multiple instances)
- Vercel Pro: $20/mo
- Add Redis caching
- Cost: $130/month

**Stage 4: High Usage (100K+ users/month)**
- Supabase Team: $599/mo
- Render Team: $250/mo
- Vercel Pro: $20/mo
- CDN for static assets
- Database read replicas
- Cost: $869/month

## Monitoring & Observability

```
┌──────────────────────────────────────────────┐
│           Monitoring Stack                   │
├──────────────────────────────────────────────┤
│                                              │
│  Vercel Analytics (Built-in)                │
│    • Page views                             │
│    • Performance metrics                    │
│    • Build logs                             │
│                                              │
│  Render Metrics (Built-in)                  │
│    • CPU usage                              │
│    • Memory usage                           │
│    • Request logs                           │
│    • Error logs                             │
│                                              │
│  Supabase Dashboard (Built-in)              │
│    • Database size                          │
│    • Active connections                     │
│    • Storage usage                          │
│    • API requests                           │
│                                              │
│  Optional Add-ons:                          │
│    • Sentry (Error tracking)                │
│    • LogRocket (Session replay)             │
│    • UptimeRobot (Uptime monitoring)        │
│    • Google Analytics (User analytics)      │
│                                              │
└──────────────────────────────────────────────┘
```

## Disaster Recovery

### Backup Strategy

**Database (Supabase):**
- Automatic daily backups
- 7-day retention (free tier)
- Point-in-time recovery (Pro tier)
- Manual backup exports weekly

**Storage (Supabase):**
- No automatic backups on free tier
- Important files replicated to S3
- User-generated content lifecycle policy

**Code (GitHub):**
- All code in version control
- Protected main branch
- Automatic deployments
- Rollback capability

### Recovery Procedures

**Frontend Down (Vercel):**
1. Check Vercel status page
2. Check build logs
3. Rollback to previous deployment
4. Recovery time: 2 minutes

**Backend Down (Render):**
1. Check service logs
2. Restart service
3. Check cold start
4. Recovery time: 1-2 minutes

**Database Issues (Supabase):**
1. Check connection limits
2. Review query performance
3. Restore from backup if needed
4. Recovery time: 5-30 minutes

## Cost Optimization

### Current Setup: $0/month

**Ways to Stay Free:**
1. Monitor usage limits
2. Implement file size limits
3. Add compression
4. Clean up old files
5. Optimize images
6. Cache aggressively
7. Use lazy loading

### If You Need to Upgrade

**Priority Order:**
1. **Supabase** ($25/mo) - More storage critical
2. **Render** ($7/mo) - Eliminate cold starts
3. **Vercel** ($20/mo) - More bandwidth

**Cost Saving Tips:**
1. Use Vercel image optimization
2. Enable edge caching
3. Implement file cleanup jobs
4. Compress before upload
5. Use WebP for images
6. Lazy load components

## Development Workflow

```
Developer Machine
    ↓
  git commit
    ↓
  git push
    ↓
GitHub Repository
    ↓
    ├─→ Vercel (auto-deploy frontend)
    │       ↓
    │   Build + Deploy (2-3 min)
    │       ↓
    │   Production URL updated
    │
    └─→ Render (auto-deploy backend)
            ↓
        Build + Deploy (5-10 min)
            ↓
        API URL updated
```

**Deployment Time:**
- Frontend: 2-3 minutes
- Backend: 5-10 minutes
- Total: ~10 minutes from push to live

**Zero Downtime:**
- Both services support rolling deployments
- Old version serves traffic during build
- Automatic health checks
- Instant rollback capability

---

## 🎯 Key Takeaways

1. **Fully Serverless**: No servers to manage
2. **Auto-Scaling**: Handles traffic spikes automatically
3. **Global Distribution**: Fast from anywhere
4. **Secure by Default**: HTTPS, JWT, RLS, encryption
5. **Zero Cost**: Free tier sufficient for most use cases
6. **Easy Maintenance**: Auto-deployments on git push
7. **Production Ready**: Built-in monitoring and logging

This architecture provides a solid foundation that can scale from 0 to millions of users! 🚀
