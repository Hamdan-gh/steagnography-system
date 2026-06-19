# 🚀 Quick Deploy - Auth Server

## Fastest Way: Render.com (5 minutes)

### Step 1: Push to GitHub

```bash
cd server
git init
git add .
git commit -m "Auth server ready for deployment"
```

Create a new repository on GitHub, then:
```bash
git remote add origin https://github.com/YOUR_USERNAME/stegagen-auth.git
git push -u origin main
```

### Step 2: Deploy on Render

1. Go to https://render.com
2. Sign up/Login
3. Click **"New +"** → **"Web Service"**
4. Connect your GitHub repo
5. Configure:
   - Name: `stegagen-auth`
   - Build: `npm install`
   - Start: `npm start`
   - Plan: **Free**

### Step 3: Add Environment Variables

Copy-paste these (click "Add Environment Variable" for each):

```
NODE_ENV=production

SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co

SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dnNpc2FvdnJ5ZnRkcmF1eGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYwNjk4MiwiZXhwIjoyMDk3MTgyOTgyfQ.xsr4SCoYcJ1Qu3jPH7aXbRm0QR1P4xu2i0zs7qjNzvw

EMAIL_HOST=smtp.gmail.com

EMAIL_PORT=587

EMAIL_USER=gangduhamd@gmail.com

EMAIL_PASSWORD=mefyemddmbnkxxpi

EMAIL_FROM=StegaGen Secure <gangduhamd@gmail.com>

FRONTEND_URL=https://your-frontend-url.vercel.app

VERIFICATION_CODE_LENGTH=6

VERIFICATION_CODE_EXPIRY=600000
```

### Step 4: Deploy

Click **"Create Web Service"**

Wait 2-3 minutes for deployment.

### Step 5: Copy Your URL

After deployment, copy your service URL:
```
https://stegagen-auth.onrender.com
```

### Step 6: Update Frontend

In your main project root, update `.env.production`:

```env
VITE_AUTH_SERVER_URL=https://stegagen-auth.onrender.com
```

Then redeploy your frontend on Vercel.

---

## ✅ Done!

Your auth server is now live! Test it by:

1. Going to your production website
2. Trying to sign up
3. Checking email for verification code
4. Verifying the code

---

## 🔧 Update Frontend URL Later

Once you know your frontend URL, update the `FRONTEND_URL` on Render:

1. Go to your service on Render
2. Click "Environment"
3. Edit `FRONTEND_URL` to your actual frontend URL
4. Save (will auto-redeploy)

---

## 📧 For Production Email (Optional)

Switch from Gmail to SendGrid (100k free emails/month):

1. Sign up at https://sendgrid.com
2. Create API key
3. Update these env vars on Render:
   ```
   EMAIL_HOST=smtp.sendgrid.net
   EMAIL_USER=apikey
   EMAIL_PASSWORD=your_sendgrid_api_key
   ```

---

**That's it!** Your email verification system is deployed! 🎉
