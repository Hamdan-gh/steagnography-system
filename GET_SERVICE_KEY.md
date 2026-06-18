# Get Supabase Service Role Key

## ⚠️ You Need to Complete This Step!

Your `server/.env` file is almost ready, but you need to add your **Supabase Service Role Key**.

## 📋 Step-by-Step Instructions

### 1. Go to Your Supabase Project

Open this link in your browser:
```
https://supabase.com/dashboard/project/uwvsisaovryftdrauxdp/settings/api
```

Or manually:
1. Go to https://supabase.com/dashboard
2. Click on your project: **uwvsisaovryftdrauxdp**
3. Click **Settings** (gear icon in sidebar)
4. Click **API**

### 2. Find the Service Role Key

On the API settings page, you'll see several keys. Look for:

```
┌─────────────────────────────────────┐
│ Project API keys                    │
├─────────────────────────────────────┤
│                                     │
│ anon public                         │
│ eyJhbGciOiJI... (your anon key)    │
│                                     │
│ ⚠️ service_role secret              │
│ eyJhbGciOiJI... (THIS ONE!)        │
│ [Show] [Copy]                       │
│                                     │
└─────────────────────────────────────┘
```

**⚠️ Important:** Get the **service_role** key, NOT the anon key!

### 3. Copy the Service Role Key

1. Click **[Show]** to reveal the full key
2. Click **[Copy]** to copy it to clipboard
3. The key will look like this (but longer):
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dnNpc2FvdnJ5ZnRkcmF1eGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYwNjk4MiwiZXhwIjoyMDk3MTgyOTgyfQ...
   ```

### 4. Update server/.env File

1. Open `server/.env` in your editor
2. Find this line:
   ```env
   SUPABASE_SERVICE_KEY=GET_THIS_FROM_SUPABASE_DASHBOARD
   ```
3. Replace it with your actual key:
   ```env
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV3dnNpc2FvdnJ5ZnRkcmF1eGRwIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MTYwNjk4MiwiZXhwIjoyMDk3MTgyOTgyfQ...
   ```
4. Save the file

### 5. Verify Your Configuration

Your `server/.env` should now look like this:

```env
# Server Configuration
PORT=3001
NODE_ENV=development

# Supabase Configuration
SUPABASE_URL=https://uwvsisaovryftdrauxdp.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  ✅ YOUR ACTUAL KEY

# Email Configuration (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=gangduhamd@gmail.com
EMAIL_PASSWORD=mefyemddmbnkxxpi
EMAIL_FROM="StegaGen Secure <gangduhamd@gmail.com>"

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Verification Code Settings
VERIFICATION_CODE_LENGTH=6
VERIFICATION_CODE_EXPIRY=600000
```

## ✅ Once Complete

After adding the service role key, you can start the server:

```bash
cd server
npm install
npm start
```

You should see:
```
🚀 Auth server running on http://localhost:3001
✅ Email server is ready to send messages
📧 Email provider: smtp.gmail.com
🌐 Frontend URL: http://localhost:5173
```

## 🔒 Security Note

**⚠️ NEVER share your service_role key!**
- It has full admin access to your database
- Keep it in `.env` file (already in `.gitignore`)
- Don't commit it to Git
- Don't post it publicly

The service_role key is like a master password for your Supabase project!

---

**Need help?** The service role key is on the API settings page under "service_role secret"
