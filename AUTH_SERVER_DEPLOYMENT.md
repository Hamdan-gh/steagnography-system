# Auth Server Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Render.com (Recommended - Free Tier Available)

#### Step 1: Prepare Your Repository

1. **Create a Git repository** for the server folder:
```bash
cd server
git init
git add .
git commit -m "Initial commit: Auth server"
```

2. **Push to GitHub:**
```bash
# Create a new repo on GitHub first, then:
git remote add origin https://github.com/yourusername/stegagen-auth-server.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy on Render

1. **Go to** https://render.com and sign up/login

2. **Click "New +" → "Web Service"**

3. **Connect your GitHub repository**

4. **Configure the service:**
   - **Name:** `stegagen-auth-server`
   - **Region:** Oregon (US West)
   - **Branch:** `main`
   - **Root Directory:** Leave empty (or `.` if needed)
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** Free

5. **Add Environment Variables:**

   Click "Advanced" → Add Environment Variables:

   ```
   NODE_ENV=production
   PORT=3001
   
   SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dnNpc2FvdnJ5ZnRkcmF1eGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYwNjk4MiwiZXhwIjoyMDk3MTgyOTgyfQ.xsr4SCoYcJ1Qu3jPH7aXbRm0QR1P4xu2i0zs7qjNzvw
   
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=gangduhamd@gmail.com
   EMAIL_PASSWORD=mefyemddmbnkxxpi
   EMAIL_FROM="StegaGen Secure <gangduhamd@gmail.com>"
   
   FRONTEND_URL=https://your-frontend-url.vercel.app
   
   VERIFICATION_CODE_LENGTH=6
   VERIFICATION_CODE_EXPIRY=600000
   ```

6. **Click "Create Web Service"**

7. **Wait for deployment** (2-3 minutes)

8. **Copy your service URL:** `https://stegagen-auth-server.onrender.com`

#### Step 3: Update Frontend

Update your frontend `.env.production`:

```env
VITE_AUTH_SERVER_URL=https://stegagen-auth-server.onrender.com
```

Then redeploy your frontend.

---

### Option 2: Railway.app (Easy Deploy)

#### Step 1: Deploy

1. Go to https://railway.app
2. Sign up/login with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your auth server repository

#### Step 2: Configure

Railway will auto-detect Node.js. Add environment variables:

```
NODE_ENV=production
SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gangduhamd@gmail.com
EMAIL_PASSWORD=mefyemddmbnkxxpi
EMAIL_FROM="StegaGen Secure <gangduhamd@gmail.com>"
FRONTEND_URL=https://your-frontend.vercel.app
```

#### Step 3: Generate Domain

Click "Generate Domain" to get your public URL.

---

### Option 3: Vercel (Serverless)

⚠️ **Note:** Vercel uses serverless functions. Need to adapt the code slightly.

Create `server/api/auth/[...path].js`:

```javascript
import express from 'express';
import serverless from 'serverless-http';
// Import your server logic here

const app = express();
// Add your routes

export default serverless(app);
```

Then deploy normally with Vercel CLI.

---

### Option 4: Heroku

#### Step 1: Install Heroku CLI

```bash
npm install -g heroku
```

#### Step 2: Deploy

```bash
cd server
heroku login
heroku create stegagen-auth-server
git push heroku main
```

#### Step 3: Set Environment Variables

```bash
heroku config:set NODE_ENV=production
heroku config:set SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
heroku config:set SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
heroku config:set EMAIL_HOST=smtp.gmail.com
heroku config:set EMAIL_PORT=587
heroku config:set EMAIL_USER=gangduhamd@gmail.com
heroku config:set EMAIL_PASSWORD=mefyemddmbnkxxpi
heroku config:set EMAIL_FROM="StegaGen Secure <gangduhamd@gmail.com>"
heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
```

---

## 🔧 Production Configuration

### Update Frontend CORS

After deploying, update `FRONTEND_URL` in your auth server to match your actual frontend URL:

```env
FRONTEND_URL=https://your-actual-domain.vercel.app
```

### Update Frontend Environment

In your main project, update `.env.production`:

```env
VITE_AUTH_SERVER_URL=https://stegagen-auth-server.onrender.com
```

### Test the Deployment

1. Deploy your frontend with updated `VITE_AUTH_SERVER_URL`
2. Go to your production signup page
3. Try to sign up
4. Check if verification email arrives
5. Test verification code

---

## 📧 Production Email (Recommended)

For production, consider using a professional email service instead of Gmail:

### SendGrid (Recommended)

1. Sign up at https://sendgrid.com (100k free emails/month)
2. Create API Key
3. Update environment variables:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key_here
EMAIL_FROM="StegaGen Secure <noreply@yourdomain.com>"
```

### Mailgun

1. Sign up at https://mailgun.com
2. Verify your domain
3. Get SMTP credentials
4. Update environment variables:

```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your_mailgun_username
EMAIL_PASSWORD=your_mailgun_password
EMAIL_FROM="StegaGen Secure <noreply@yourdomain.com>"
```

---

## 🔒 Security Checklist

- [ ] Environment variables set (not hardcoded)
- [ ] `.env` file in `.gitignore`
- [ ] Service role key kept secret
- [ ] CORS configured for your frontend only
- [ ] Rate limiting added (optional but recommended)
- [ ] HTTPS enabled (automatic on Render/Railway/Vercel)

---

## 🚨 Important Notes

### Gmail Limitations

Gmail SMTP has sending limits:
- **500 emails/day** for regular Gmail
- **2000 emails/day** for Google Workspace

For production with many users, use SendGrid or Mailgun.

### Free Tier Limitations

**Render.com Free Tier:**
- Spins down after 15 minutes of inactivity
- First request may take 30-60 seconds (cold start)
- 750 hours/month free

**Railway.app:**
- $5 free credits/month
- No cold starts
- Pay-as-you-go after credits

**Heroku:**
- No longer has free tier
- Starts at $7/month

---

## 🎯 Recommended Stack for Production

```
Frontend:  Vercel (Free, fast, easy)
Auth API:  Render.com (Free tier, good for small projects)
Email:     SendGrid (100k free emails/month)
Database:  Supabase (Already using, 500MB free)
```

**Total Monthly Cost:** $0 for small projects! 🎉

---

## 📊 Deployment Status Check

After deployment, verify these endpoints:

### Health Check
```bash
curl https://your-auth-server.onrender.com/health
```

Should return:
```json
{"status":"ok","message":"Auth server is running"}
```

### Test CORS
```bash
curl -X OPTIONS https://your-auth-server.onrender.com/api/auth/register \
  -H "Origin: https://your-frontend.vercel.app" \
  -H "Access-Control-Request-Method: POST"
```

Should include CORS headers in response.

---

## 🐛 Troubleshooting

### "Cannot find module"
- Check `package.json` includes all dependencies
- Ensure `npm install` runs in build command

### "CORS error"
- Update `FRONTEND_URL` to match your actual frontend URL
- Check if includes `https://` protocol

### "Email not sending"
- Check email credentials in environment variables
- For Gmail, ensure app password is correct
- Consider switching to SendGrid for production

### "Cold start slow"
- Normal for Render.com free tier
- Upgrade to paid tier for always-on
- Or use Railway (no cold starts)

---

## 📝 Quick Deploy Checklist

- [ ] Create GitHub repository for server
- [ ] Push code to GitHub
- [ ] Sign up on Render.com/Railway
- [ ] Create new web service
- [ ] Connect GitHub repository
- [ ] Add all environment variables
- [ ] Deploy
- [ ] Copy service URL
- [ ] Update frontend `.env.production` with auth server URL
- [ ] Redeploy frontend
- [ ] Test signup flow

---

**Need help?** Check the platform-specific documentation:
- Render: https://render.com/docs
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs
