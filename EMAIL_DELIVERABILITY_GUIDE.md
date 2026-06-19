# Email Deliverability Guide

## ✅ What We've Fixed

### 1. **Email Template Improvements**
- Removed excessive styling and gradients that trigger spam filters
- Simplified HTML structure for better email client compatibility
- Added proper meta tags for email clients
- Improved text-to-image ratio (more text, less decoration)
- Changed subject line format (removed "—" which can look spammy)

### 2. **Technical Email Headers**
- Added proper MIME headers
- Included `List-Unsubscribe` header
- Added `Precedence: bulk` for transactional emails
- Proper `Message-ID` generation with domain
- Added `envelope` configuration for better DKIM alignment

### 3. **SMTP Configuration**
- Enabled connection pooling
- Added `rejectUnauthorized: true` for better security
- Better timeout handling

## 🚀 Additional Steps to Improve Deliverability

### 1. **Use Resend API (Recommended for Production)**
Resend is a modern email API with excellent deliverability rates.

**In Vercel Dashboard:**
```
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxx
RESEND_FROM=StegaGen Secure <noreply@yourdomain.com>
```

**Get Resend API Key:**
1. Sign up at https://resend.com
2. Verify your sending domain
3. Get your API key
4. Add it to Vercel environment variables

**Benefits:**
- Built-in DKIM, SPF, and DMARC
- High deliverability rates
- No spam folder issues
- Better tracking and analytics

### 2. **Configure SPF Record (If Using Gmail/SMTP)**
Add this TXT record to your domain DNS:

```
Type: TXT
Name: @
Value: v=spf1 include:_spf.google.com ~all
```

For other email providers, replace `_spf.google.com` with your provider's SPF include.

### 3. **Configure DKIM (Gmail)**
1. Go to Google Admin Console → Apps → Google Workspace → Gmail → Authenticate email
2. Generate DKIM key
3. Add the provided TXT record to your DNS
4. Enable DKIM in Google Admin

### 4. **Configure DMARC Record**
Add this TXT record to your domain DNS:

```
Type: TXT
Name: _dmarc
Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com; pct=100; adkim=s; aspf=s
```

### 5. **Environment Variables to Add**

Add these to your Vercel environment variables for better configuration:

```env
# Email Configuration
EMAIL_DOMAIN=yourdomain.com
APP_NAME=StegaGen Secure
FRONTEND_URL=https://steagnography-system.vercel.app

# For Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM="StegaGen Secure <your-email@gmail.com>"
EMAIL_REPLY_TO=your-email@gmail.com

# OR use Resend (Recommended)
RESEND_API_KEY=re_xxxxxxxxxxxxx
RESEND_FROM=StegaGen Secure <noreply@yourdomain.com>
```

### 6. **User Actions**

#### Ask Users to Whitelist
Include in your UI a message like:
> "Can't find the email? Check your spam folder and mark it as 'Not Spam' to ensure future emails arrive in your inbox."

#### Gmail App Password
If using Gmail, make sure you're using an App Password, not your regular password:
1. Go to https://myaccount.google.com/apppasswords
2. Create a new app password
3. Use it in `EMAIL_PASSWORD` environment variable

### 7. **Content Best Practices**
✅ **Do:**
- Keep subject lines short and clear
- Use a verified domain for sending
- Include an unsubscribe link
- Maintain good text-to-image ratio
- Send from a consistent email address

❌ **Don't:**
- Use ALL CAPS in subject lines
- Include excessive emojis
- Use spammy words like "FREE", "URGENT", "ACT NOW"
- Send from @gmail.com or @yahoo.com in production
- Use URL shorteners

## 📊 Testing Email Deliverability

### Mail Tester
Send a test email to the address provided by https://www.mail-tester.com and get a score.

**Target Score: 8/10 or higher**

### Common Issues:
- **Score < 5:** Missing SPF/DKIM records
- **Score 5-7:** Need DMARC, better content
- **Score 7-9:** Minor issues, usually domain reputation
- **Score 9-10:** Excellent deliverability

## 🔍 Current Configuration Check

Check your current email configuration health:
```bash
GET https://steagnography-system.vercel.app/api/auth/health
```

This will show:
- ✅ Supabase connection
- ✅ Email provider (SMTP or Resend)
- ✅ Configuration status

## 📝 Quick Migration to Resend

1. **Sign up:** https://resend.com
2. **Add domain:** Add your domain and verify DNS records
3. **Get API key:** Copy your API key
4. **Update Vercel:**
   ```
   RESEND_API_KEY=re_xxxxxxxxxxxxx
   RESEND_FROM=StegaGen Secure <noreply@yourdomain.com>
   ```
5. **Remove SMTP vars** (optional, Resend takes priority)

## ⚡ Immediate Actions

1. **Add `EMAIL_DOMAIN` environment variable in Vercel:**
   ```
   EMAIL_DOMAIN=yourdomain.com
   ```
   Or if using Gmail:
   ```
   EMAIL_DOMAIN=gmail.com
   ```

2. **Push these changes:**
   ```bash
   git add .
   git commit -m "improve email deliverability"
   git push
   ```

3. **Test the changes** by registering a new account

4. **Check spam folder** and mark as "Not Spam" if needed

5. **Consider migrating to Resend** for production use

## 🎯 Expected Results

After implementing these changes:
- ✅ Better inbox placement rate
- ✅ Professional-looking emails
- ✅ Improved email client compatibility
- ✅ Proper authentication (with SPF/DKIM/DMARC)
- ✅ Reduced spam complaints

## 📞 Support

If emails still go to spam after implementing all steps:
1. Check your domain reputation at https://mxtoolbox.com
2. Verify SPF, DKIM, DMARC records are correct
3. Consider warming up your domain (start with low volume)
4. Switch to Resend for guaranteed deliverability
