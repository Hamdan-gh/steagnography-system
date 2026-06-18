# Quick Start - Email Verification

## ⚡ 5-Minute Setup

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Create server/.env File

Copy `server/.env.example` to `server/.env` and fill in:

```env
PORT=3001
NODE_ENV=development

# Get from Supabase Dashboard → Settings → API
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Gmail Setup (easiest for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App Password from Google
EMAIL_FROM="StegaGen <your.email@gmail.com>"

FRONTEND_URL=http://localhost:5173
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY=600000
```

### 3. Get Gmail App Password

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Generate password for "Mail"
5. Copy the 16-digit password to your `.env`

### 4. Add Auth Server URL to Frontend

In root `.env`:
```env
VITE_AUTH_SERVER_URL=http://localhost:3001
```

### 5. Start Both Servers

**Terminal 1 (Auth Server):**
```bash
cd server
npm start
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

**Or use the batch file:**
- Double-click `start-auth-server.bat` for auth server
- Double-click existing start script for frontend

## ✅ Test It

1. Go to http://localhost:5173/signup
2. Fill out the form with your real email
3. Click "Create Account"
4. Check your email for 6-digit code
5. Enter code on verification page
6. Should redirect to login
7. Login with your credentials

## 🎯 How It Works

```
User Signs Up
     ↓
Server Creates User (unverified)
     ↓
Server Generates 6-Digit Code
     ↓
Server Sends Email
     ↓
User Receives Code
     ↓
User Enters Code
     ↓
Server Verifies Code
     ↓
User Account Activated ✅
     ↓
User Can Login
```

## 🔧 Common Issues

### "Email configuration error"
- Check your Gmail app password (should be 16 digits)
- Make sure 2FA is enabled on Gmail
- Verify EMAIL_HOST=smtp.gmail.com and EMAIL_PORT=587

### Can't connect to server
- Make sure auth server is running on port 3001
- Check VITE_AUTH_SERVER_URL in frontend .env
- Verify FRONTEND_URL in server .env

### User created but email not sent
- Check server logs for email errors
- Test email configuration:
  ```bash
  cd server
  node -e "require('./server.js')"
  ```

## 📧 Email Services

### Gmail (Dev)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
```

### SendGrid (Production)
```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_api_key
```

### Mailgun
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
```

## 🎨 Verification Page Features

- ✨ 6 input boxes (one per digit)
- 📋 Paste entire code
- ⌨️ Keyboard navigation
- 🔄 Resend code button
- ⏱️ 10-minute expiry
- 🔒 5 attempt limit

## 📱 User Experience

**Before (Supabase default):**
- Click email link → Opens browser → Redirected → Sometimes fails

**After (Verification code):**
- Copy code → Paste → Done! ✅

Much better for mobile users!

## 🚀 Production Checklist

- [ ] Use professional email service (SendGrid/Mailgun)
- [ ] Deploy auth server to Render/Heroku
- [ ] Update VITE_AUTH_SERVER_URL to production URL
- [ ] Set NODE_ENV=production
- [ ] Add rate limiting
- [ ] Use Redis for code storage (optional)
- [ ] Configure custom domain for emails

---

**Need help?** Check `EMAIL_VERIFICATION_SETUP.md` for detailed documentation.
