import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());

// Supabase Admin Client (with service role key)
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Verify email configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email configuration error:', error);
  } else {
    console.log('✅ Email server is ready to send messages');
  }
});

// In-memory store for verification codes (in production, use Redis or database)
const verificationCodes = new Map();

// Generate random verification code
function generateVerificationCode() {
  const length = parseInt(process.env.VERIFICATION_CODE_LENGTH) || 6;
  return crypto.randomInt(100000, 999999).toString().padStart(length, '0');
}

// Clean up expired verification codes
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of verificationCodes.entries()) {
    if (now > data.expiresAt) {
      verificationCodes.delete(key);
    }
  }
}, 60000); // Clean up every minute

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running' });
});

// Register user and send verification code
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    // Validate input
    if (!email || !password || !fullName) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Email, password, and full name are required' 
      });
    }

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email_verified')
      .eq('email', email)
      .single();

    if (existingUser && existingUser.email_verified) {
      return res.status(400).json({ 
        error: 'User already exists',
        message: 'An account with this email already exists and is verified' 
      });
    }

    // Create user in Supabase Auth (but mark as unverified)
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: false, // Don't auto-confirm
      user_metadata: {
        full_name: fullName,
        role: 'user'
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({ 
        error: 'Registration failed',
        message: authError.message 
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = Date.now() + (parseInt(process.env.VERIFICATION_CODE_EXPIRY) || 600000); // 10 minutes

    // Store verification code
    verificationCodes.set(email, {
      code: verificationCode,
      userId: authData.user.id,
      fullName,
      expiresAt,
      attempts: 0
    });

    // Send verification email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'Verify Your Email - StegaGen Secure',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
            .header h1 { color: #ffffff; margin: 0; font-size: 28px; }
            .content { padding: 40px 30px; }
            .code-box { background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af; font-family: 'Courier New', monospace; }
            .expiry { color: #6b7280; font-size: 14px; margin-top: 15px; }
            .warning { background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
            .button { display: inline-block; background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 8px; margin: 20px 0; font-weight: 600; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ StegaGen Secure</h1>
              <p style="color: #e0e7ff; margin: 10px 0 0 0;">Email Verification</p>
            </div>
            <div class="content">
              <h2 style="color: #1f2937; margin-top: 0;">Welcome, ${fullName}!</h2>
              <p style="font-size: 16px; color: #4b5563;">Thank you for registering with StegaGen Secure. To complete your registration, please verify your email address using the code below:</p>
              
              <div class="code-box">
                <div class="code">${verificationCode}</div>
                <p class="expiry">This code expires in 10 minutes</p>
              </div>

              <p style="font-size: 16px; color: #4b5563;">Enter this code on the verification page to activate your account and start using our secure audio steganography platform.</p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't create an account with StegaGen Secure, please ignore this email or contact our support team.
              </div>

              <p style="font-size: 14px; color: #6b7280; margin-top: 30px;">
                Having trouble? Contact us at <a href="mailto:support@stegagen.com" style="color: #3b82f6;">support@stegagen.com</a>
              </p>
            </div>
            <div class="footer">
              <p style="margin: 0;">© ${new Date().getFullYear()} StegaGen Secure. All rights reserved.</p>
              <p style="margin: 10px 0 0 0;">Secure Audio Steganography Platform</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true,
      message: 'Verification code sent to your email',
      email: email
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      error: 'Registration failed',
      message: error.message 
    });
  }
});

// Verify email with code
app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Email and verification code are required' 
      });
    }

    // Get stored verification data
    const verificationData = verificationCodes.get(email);

    if (!verificationData) {
      return res.status(400).json({ 
        error: 'Invalid or expired code',
        message: 'Verification code not found. Please request a new code.' 
      });
    }

    // Check if expired
    if (Date.now() > verificationData.expiresAt) {
      verificationCodes.delete(email);
      return res.status(400).json({ 
        error: 'Code expired',
        message: 'Verification code has expired. Please request a new code.' 
      });
    }

    // Check attempt limit
    if (verificationData.attempts >= 5) {
      verificationCodes.delete(email);
      return res.status(400).json({ 
        error: 'Too many attempts',
        message: 'Too many failed attempts. Please request a new code.' 
      });
    }

    // Verify code
    if (verificationData.code !== code) {
      verificationData.attempts++;
      return res.status(400).json({ 
        error: 'Invalid code',
        message: 'Incorrect verification code. Please try again.',
        attemptsLeft: 5 - verificationData.attempts
      });
    }

    // Code is correct - verify the user in Supabase
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      verificationData.userId,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('Error confirming user:', updateError);
      return res.status(500).json({ 
        error: 'Verification failed',
        message: 'Failed to verify account. Please try again.' 
      });
    }

    // Create/update user profile
    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: verificationData.userId,
        email: email,
        full_name: verificationData.fullName,
        role: 'user',
        email_verified: true,
        updated_at: new Date().toISOString()
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // Don't fail - the user is still verified in auth
    }

    // Remove verification code
    verificationCodes.delete(email);

    res.status(200).json({ 
      success: true,
      message: 'Email verified successfully! You can now log in.' 
    });

  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ 
      error: 'Verification failed',
      message: error.message 
    });
  }
});

// Resend verification code
app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ 
        error: 'Missing email',
        message: 'Email is required' 
      });
    }

    // Check if there's existing verification data
    const existingData = verificationCodes.get(email);
    if (!existingData) {
      return res.status(400).json({ 
        error: 'No pending verification',
        message: 'No pending verification found for this email' 
      });
    }

    // Generate new code
    const verificationCode = generateVerificationCode();
    const expiresAt = Date.now() + (parseInt(process.env.VERIFICATION_CODE_EXPIRY) || 600000);

    // Update stored data
    verificationCodes.set(email, {
      ...existingData,
      code: verificationCode,
      expiresAt,
      attempts: 0
    });

    // Send new email
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: email,
      subject: 'New Verification Code - StegaGen Secure',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; color: white; }
            .content { padding: 40px 30px; }
            .code-box { background: linear-gradient(135deg, #eff6ff 0%, #f3e8ff 100%); border: 2px solid #3b82f6; border-radius: 12px; padding: 30px; text-align: center; margin: 30px 0; }
            .code { font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1e40af; font-family: 'Courier New', monospace; }
            .footer { background-color: #f9fafb; padding: 20px; text-align: center; color: #6b7280; font-size: 14px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🛡️ StegaGen Secure</h1>
              <p>New Verification Code</p>
            </div>
            <div class="content">
              <h2>New Verification Code</h2>
              <p>You requested a new verification code. Use the code below to verify your email:</p>
              <div class="code-box">
                <div class="code">${verificationCode}</div>
                <p style="color: #6b7280; margin-top: 15px;">Expires in 10 minutes</p>
              </div>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} StegaGen Secure. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      success: true,
      message: 'New verification code sent to your email' 
    });

  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({ 
      error: 'Failed to resend code',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong' 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`\n🚀 Auth server running on http://localhost:${PORT}`);
  console.log(`📧 Email provider: ${process.env.EMAIL_HOST}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}\n`);
});
