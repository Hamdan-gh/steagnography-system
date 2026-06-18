# StegaGen Auth Server

Email verification server with Nodemailer integration.

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Configure
Copy `.env.example` to `.env` and fill in your details:

```env
# Supabase (get from dashboard → Settings → API)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=eyJhbG...  # Service role key!

# Gmail (easiest for testing)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your.email@gmail.com
EMAIL_PASSWORD=xxxx xxxx xxxx xxxx  # App password
EMAIL_FROM="StegaGen <your.email@gmail.com>"

# Frontend
FRONTEND_URL=http://localhost:5173
```

### 3. Run
```bash
npm start
```

Server will start on http://localhost:3001

## Gmail Setup

1. Go to https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Search for **App passwords**
4. Create password for **Mail**
5. Copy 16-digit password to .env

## API Endpoints

### POST /api/auth/register
Register user and send verification code

### POST /api/auth/verify-email  
Verify email with code

### POST /api/auth/resend-code
Resend verification code

### GET /health
Health check

## Features

- ✅ 6-digit verification codes
- ✅ 10-minute expiry
- ✅ 5 attempt limit
- ✅ Beautiful email templates
- ✅ Automatic code cleanup
- ✅ Multiple email providers

## Production

For production, consider:
- Use SendGrid or Mailgun for email
- Add Redis for code storage (currently in-memory)
- Add rate limiting (express-rate-limit)
- Deploy to Render, Heroku, or Railway

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| PORT | Server port | 3001 |
| NODE_ENV | Environment | development/production |
| SUPABASE_URL | Supabase project URL | https://xxx.supabase.co |
| SUPABASE_SERVICE_KEY | Service role key | eyJhbG... |
| EMAIL_HOST | SMTP host | smtp.gmail.com |
| EMAIL_PORT | SMTP port | 587 |
| EMAIL_USER | Email username | your@email.com |
| EMAIL_PASSWORD | Email password/API key | app_password |
| EMAIL_FROM | From address | "App <noreply@app.com>" |
| FRONTEND_URL | Frontend URL | http://localhost:5173 |
| VERIFICATION_CODE_LENGTH | Code length | 6 |
| VERIFICATION_CODE_EXPIRY | Expiry in ms | 600000 (10 min) |

## Dependencies

- **express**: Web framework
- **cors**: CORS middleware
- **nodemailer**: Email sending
- **@supabase/supabase-js**: Supabase client
- **dotenv**: Environment variables

---

See `../EMAIL_VERIFICATION_SETUP.md` for detailed documentation.
