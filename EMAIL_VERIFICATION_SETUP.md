# Email Verification Setup Guide

## Overview

We've switched from Supabase's email confirmation links to a custom **verification code system** using Nodemailer. Users now receive a 6-digit code via email that they copy and paste to verify their account.

## 🎯 Benefits

- ✅ **Better UX**: No need to click links or open new tabs
- ✅ **Mobile-friendly**: Easy to copy/paste verification codes
- ✅ **More control**: Customize email templates and verification logic
- ✅ **Faster**: Immediate verification without email link navigation
- ✅ **Modern**: Matches industry-standard verification flows (2FA-style)

## 📁 Project Structure

```
NAPARI/
├── server/                    # NEW: Authentication server
│   ├── package.json          # Server dependencies
│   ├── server.js             # Express server with verification logic
│   ├── .env.example          # Environment variables template
│   └── .env                  # Your actual config (create this)
│
├── src/
│   ├── pages/
│   │   ├── SignupPage.tsx           # Updated to use new API
│   │   └── VerifyEmailPage.tsx      # NEW: Verification code page
│   └── App.tsx                       # Added /verify-email route
│
└── .env                              # Added VITE_AUTH_SERVER_URL
```

## 🚀 Setup Instructions

### Step 1: Install Server Dependencies

```bash
cd server
npm install
```

### Step 2: Configure Email Service

#### Option A: Gmail (Recommended for Development)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate App Password**:
   - Go to: https://myaccount.google.com/security
   - Click "2-Step Verification"
   - Scroll to "App passwords"
   - Generate password for "Mail"
3. **Create `.env` file** in `server/` directory:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_KEY=your_supabase_service_role_key

# Gmail Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_16_digit_app_password
EMAIL_FROM="StegaGen Secure <your_email@gmail.com>"

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Verification Settings
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY=600000
```

#### Option B: SendGrid (Recommended for Production)

1. **Sign up** at https://sendgrid.com
2. **Create API Key** with "Mail Send" permissions
3. **Configure `.env`**:

```env
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your_sendgrid_api_key
EMAIL_FROM="StegaGen Secure <noreply@yourdomain.com>"
```

#### Option C: Other Services

**Mailgun:**
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_USER=your_mailgun_username
EMAIL_PASSWORD=your_mailgun_password
```

**Outlook:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your_outlook_email
EMAIL_PASSWORD=your_outlook_password
```

### Step 3: Get Supabase Service Role Key

1. Go to your Supabase project dashboard
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (NOT the anon key!)
4. Paste it in your `server/.env` as `SUPABASE_SERVICE_KEY`

⚠️ **Important**: The service role key has admin privileges. Never expose it in frontend code!

### Step 4: Update Frontend Environment

Create/update `.env` in the root directory:

```env
# Existing Supabase config
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# NEW: Auth server URL
VITE_AUTH_SERVER_URL=http://localhost:3001

# ... rest of your config
```

### Step 5: Start Both Servers

#### Terminal 1: Start Auth Server
```bash
cd server
npm start
```

You should see:
```
🚀 Auth server running on http://localhost:3001
📧 Email provider: smtp.gmail.com
🌐 Frontend URL: http://localhost:5173
```

#### Terminal 2: Start Frontend
```bash
# In root directory
npm run dev
```

## 🎨 User Flow

### Registration Flow

1. **User fills signup form** → `SignupPage.tsx`
   - Email, password, full name

2. **Frontend sends data** → Auth Server
   - `POST /api/auth/register`

3. **Server creates user** in Supabase Auth
   - User marked as **unverified** (`email_confirm: false`)

4. **Server generates 6-digit code**
   - Stored in memory with 10-minute expiry

5. **Server sends email** with verification code
   - Beautiful HTML template
   - Code expires in 10 minutes

6. **User redirected** to verification page
   - `VerifyEmailPage.tsx`

7. **User enters/pastes code**
   - 6 input fields
   - Auto-focus next field
   - Paste support

8. **Frontend verifies code** → Auth Server
   - `POST /api/auth/verify-email`

9. **Server confirms user** in Supabase
   - Updates `email_confirm: true`
   - Creates user profile record

10. **User redirected** to login
    - Account fully verified ✅

### Verification Page Features

- ✨ **6 separate input boxes** for each digit
- 📋 **Paste support** - paste entire code at once
- ⌨️ **Keyboard navigation** - arrow keys, backspace
- 🔄 **Resend code** button
- ⏱️ **10-minute expiry** with countdown
- 🔒 **5 attempt limit** per code
- ✅ **Success animation** on verification

## 📧 Email Template

The verification email includes:

- **Professional design** with gradient headers
- **Large 6-digit code** (easy to read)
- **Expiry notice** (10 minutes)
- **Security warning**
- **Support contact** info
- **Responsive** (works on mobile)

## 🔒 Security Features

### Server-Side

- ✅ **Rate limiting ready** (add express-rate-limit if needed)
- ✅ **Attempt tracking** (max 5 attempts per code)
- ✅ **Code expiry** (10 minutes)
- ✅ **Secure code generation** (crypto.randomInt)
- ✅ **Email confirmation** before login allowed
- ✅ **Service role key** never exposed to frontend

### Best Practices

- 🔐 Codes stored in memory (use Redis for production scale)
- ⏰ Automatic cleanup of expired codes
- 🚫 User can't login until verified
- 📧 One verification attempt per email/code pair

## 🧪 Testing

### Test Registration

1. Navigate to `http://localhost:5173/signup`
2. Fill out the form with a **real email** you can access
3. Click "Create Account"
4. Check your email for the 6-digit code
5. Enter code on verification page
6. Should redirect to login with success message

### Test Resend Code

1. On verification page, click "Resend Code"
2. Check email for new code
3. Old code should be invalid
4. New code should work

### Test Expiry

1. Wait 10 minutes after receiving code
2. Try to use the code
3. Should show "Code expired" error
4. Resend code should work

### Test Invalid Code

1. Enter wrong code
2. Should show "Invalid code" with attempts left
3. After 5 attempts, code invalidated
4. Must resend to get new code

## 🐛 Troubleshooting

### Email not sending

**Problem:** `Email configuration error` on server startup

**Solutions:**
- Verify EMAIL_HOST, EMAIL_PORT are correct
- Check EMAIL_USER and EMAIL_PASSWORD
- For Gmail: Ensure app password is 16 digits with no spaces
- Test with: `telnet smtp.gmail.com 587`

### "User already exists" error

**Problem:** User exists but unverified

**Solution:** Delete user from Supabase Auth dashboard or complete verification

### Code not found

**Problem:** Server restarted (codes stored in memory)

**Solution:** 
- Use "Resend Code" button
- For production: Implement Redis for persistence

### Frontend can't connect to server

**Problem:** CORS or connection refused

**Solutions:**
- Ensure server is running on port 3001
- Check `FRONTEND_URL` in server/.env matches your frontend URL
- Verify `VITE_AUTH_SERVER_URL` in frontend .env

### Verification succeeds but can't login

**Problem:** User profile not created

**Solution:** Check Supabase logs and RLS policies

## 📦 Production Deployment

### Server Deployment (e.g., Render, Heroku)

1. **Push server code** to Git repository

2. **Set environment variables** in hosting platform:
   ```
   PORT=3001
   NODE_ENV=production
   SUPABASE_URL=...
   SUPABASE_SERVICE_KEY=...
   EMAIL_HOST=...
   EMAIL_PORT=...
   EMAIL_USER=...
   EMAIL_PASSWORD=...
   EMAIL_FROM=...
   FRONTEND_URL=https://yourdomain.com
   ```

3. **Update frontend .env.production**:
   ```
   VITE_AUTH_SERVER_URL=https://your-auth-server.onrender.com
   ```

4. **Consider using Redis** for code storage:
   ```javascript
   // Replace Map with Redis client
   import Redis from 'ioredis';
   const redis = new Redis(process.env.REDIS_URL);
   ```

### Recommended Production Stack

- **Email**: SendGrid (99,000 free emails/month)
- **Server**: Render.com (free tier available)
- **Cache**: Redis Cloud (free tier available)
- **Monitoring**: Sentry for error tracking

## 🎯 API Endpoints

### POST /api/auth/register
Register new user and send verification code

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "fullName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Verification code sent to your email",
  "email": "user@example.com"
}
```

### POST /api/auth/verify-email
Verify email with code

**Request:**
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in."
}
```

### POST /api/auth/resend-code
Resend verification code

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "New verification code sent to your email"
}
```

## 📝 Customization

### Change Code Length

In `server/.env`:
```env
VERIFICATION_CODE_LENGTH=8  # 8-digit code
```

### Change Expiry Time

In `server/.env`:
```env
VERIFICATION_CODE_EXPIRY=300000  # 5 minutes (in milliseconds)
```

### Customize Email Template

Edit the HTML in `server/server.js` → `POST /api/auth/register` route

### Add Rate Limiting

```bash
cd server
npm install express-rate-limit
```

```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // 5 requests per window
});

app.use('/api/auth', limiter);
```

## ✅ Checklist

- [ ] Installed server dependencies
- [ ] Created server/.env with email config
- [ ] Got Supabase service role key
- [ ] Added VITE_AUTH_SERVER_URL to frontend .env
- [ ] Started auth server (port 3001)
- [ ] Started frontend (port 5173)
- [ ] Tested registration flow
- [ ] Received verification email
- [ ] Successfully verified account
- [ ] Tested login after verification

---

**Status:** ✅ Email verification system ready!
**Date:** June 18, 2026
