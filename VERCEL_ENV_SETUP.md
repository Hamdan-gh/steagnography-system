# Vercel Environment Variables Setup

## 🚀 Quick Setup Guide

### Step 1: Go to Vercel Dashboard
1. Open https://vercel.com/dashboard
2. Select your project: `steagnography-system`
3. Click **Settings** tab
4. Click **Environment Variables** in the left sidebar

### Step 2: Add Required Variables

Add these environment variables one by one:

#### **Supabase Configuration**
```
SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dnNpc2FvdnJ5ZnRkcmF1eGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYwNjk4MiwiZXhwIjoyMDk3MTgyOTgyfQ.xsr4SCoYcJ1Qu3jPH7aXbRm0QR1P4xu2i0zs7qjNzvw
```

#### **Email Configuration (Gmail)**
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gangduhamd@gmail.com
EMAIL_PASSWORD=mefyemddmbnkxxpi
EMAIL_FROM=StegaGen Secure <gangduhamd@gmail.com>
EMAIL_REPLY_TO=gangduhamd@gmail.com
EMAIL_DOMAIN=gmail.com
```

#### **Application Configuration**
```
APP_NAME=StegaGen Secure
FRONTEND_URL=https://steagnography-system.vercel.app
NODE_ENV=production
```

#### **Verification Settings**
```
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY=600000
VERIFICATION_CODE_SECRET=your-long-random-secret-string-here
```

### Step 3: Environment Scope
For each variable, select:
- ✅ **Production**
- ✅ **Preview** 
- ✅ **Development**

Or just select **All Environments** for simplicity.

### Step 4: Save and Redeploy
After adding all variables:
1. Click **Save** for each variable
2. Go to **Deployments** tab
3. Click the three dots ⋮ on the latest deployment
4. Click **Redeploy**
5. Confirm the redeployment

---

## 🎯 Alternative: Use Resend (Recommended)

For better email deliverability, use Resend instead of Gmail:

### Step 1: Sign up for Resend
1. Go to https://resend.com
2. Sign up for a free account (3,000 emails/month free)

### Step 2: Add Your Domain (Optional)
1. In Resend dashboard, go to **Domains**
2. Click **Add Domain**
3. Add your domain (e.g., `yourdomain.com`)
4. Add the DNS records shown
5. Wait for verification

### Step 3: Get API Key
1. Go to **API Keys** in Resend dashboard
2. Click **Create API Key**
3. Copy the key (starts with `re_`)

### Step 4: Add to Vercel
Replace the Gmail email variables with:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
RESEND_FROM=StegaGen Secure <noreply@yourdomain.com>
```

Or if not using custom domain:
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
RESEND_FROM=StegaGen Secure <onboarding@resend.dev>
```

**Remove these (not needed with Resend):**
- EMAIL_HOST
- EMAIL_PORT
- EMAIL_USER
- EMAIL_PASSWORD

**Keep these:**
- EMAIL_FROM (optional, falls back to RESEND_FROM)
- EMAIL_REPLY_TO
- EMAIL_DOMAIN

---

## 📋 Verification Checklist

After adding environment variables:

- [ ] All required variables are added
- [ ] Environment scope is set correctly
- [ ] Deployment is triggered
- [ ] Deployment succeeded
- [ ] Test registration on your site
- [ ] Check email arrives in inbox (not spam)
- [ ] Test verification code works

---

## 🔍 Test Your Configuration

### Health Check
```bash
curl https://steagnography-system.vercel.app/api/auth/health
```

Should return:
```json
{
  "status": "ok",
  "message": "Auth API is running",
  "config": {
    "hasSupabaseUrl": true,
    "hasSupabaseKey": true,
    "emailProvider": "smtp",  // or "resend"
    "hasResend": false,       // or true
    "hasSmtp": true          // or false
  }
}
```

### Test Registration
1. Go to https://steagnography-system.vercel.app
2. Click **Sign Up**
3. Fill in the form
4. Submit
5. Check your email (inbox and spam)
6. Use the verification code

---

## 🐛 Troubleshooting

### Email Not Sending
**Check:**
1. Vercel logs for errors
2. All email variables are set correctly
3. Gmail app password is correct (not regular password)
4. No typos in email configuration

### Email Goes to Spam
**Solutions:**
1. Add `EMAIL_DOMAIN=gmail.com` to Vercel
2. Ask recipients to mark as "Not Spam"
3. Consider switching to Resend
4. Set up SPF/DKIM records for your domain

### 500 Server Error
**Check:**
1. `SUPABASE_URL` and `SUPABASE_SERVICE_KEY` are set
2. Supabase `email_verification_codes` table exists
3. Check Vercel function logs for specific error

### CORS Errors
**Already fixed!** But if you see CORS errors:
1. Check `FRONTEND_URL` matches your actual URL
2. Make sure no trailing slash in URL
3. Redeploy after changing CORS settings

---

## 📞 Need Help?

1. Check Vercel function logs: **Deployments** → Click deployment → **Functions** → Click function → View logs
2. Check Supabase logs: Supabase dashboard → **Logs**
3. Test locally first with `.env` file
4. Review `EMAIL_DELIVERABILITY_GUIDE.md` for email issues

---

## ⚡ Quick Commands

### Local Testing
```bash
cd server
npm install
npm start
```

### Check Vercel Deployment
```bash
vercel logs
```

### Force Redeploy
```bash
git commit --allow-empty -m "trigger redeploy"
git push
```
