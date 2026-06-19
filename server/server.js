import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createEmailTransporter, sendVerificationEmail } from './emailService.js';
import { VerificationStore } from './verificationStore.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://steagnography-system.vercel.app',
];

function buildAllowedOrigins() {
  const origins = new Set(DEFAULT_ORIGINS);
  const extra = process.env.FRONTEND_URL || '';
  for (const origin of extra.split(',')) {
    const trimmed = origin.trim();
    if (trimmed) origins.add(trimmed);
  }
  return [...origins];
}

const allowedOrigins = buildAllowedOrigins();
const VERCEL_ORIGIN_RE = /^https:\/\/[\w-]+\.vercel\.app$/;

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin) || VERCEL_ORIGIN_RE.test(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const transporter = createEmailTransporter();
const verificationStore = new VerificationStore(supabaseAdmin);

transporter.verify((error) => {
  if (error) {
    console.error('Email configuration error:', error);
  } else {
    console.log('Email server is ready');
  }
});

function generateVerificationCode() {
  const length = parseInt(process.env.VERIFICATION_CODE_LENGTH || '6', 10);
  const max = 10 ** length;
  const min = 10 ** (length - 1);
  return crypto.randomInt(min, max).toString();
}

async function findAuthUserByEmail(email) {
  let page = 1;
  const perPage = 200;

  while (page <= 10) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage });
    if (error) throw error;

    const match = data.users.find((user) => user.email?.toLowerCase() === email.toLowerCase());
    if (match) return match;

    if (data.users.length < perPage) break;
    page += 1;
  }

  return null;
}

async function sendCodeEmail(email, fullName, code, isResend = false) {
  await sendVerificationEmail(transporter, {
    to: email,
    email,
    fullName,
    code,
    isResend,
  });
}

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Auth server is running' });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email, password, and full name are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id, email_verified')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (existingUser?.email_verified) {
      return res.status(400).json({
        error: 'User already exists',
        message: 'An account with this email already exists and is verified',
      });
    }

    let userId;
    let displayName = fullName;

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: false,
      user_metadata: {
        full_name: fullName,
        role: 'user',
      },
    });

    if (authError) {
      const existingAuthUser = await findAuthUserByEmail(normalizedEmail);
      if (!existingAuthUser || existingAuthUser.email_confirmed_at) {
        console.error('Supabase auth error:', authError);
        return res.status(400).json({
          error: 'Registration failed',
          message: authError.message,
        });
      }

      userId = existingAuthUser.id;
      displayName = existingAuthUser.user_metadata?.full_name || fullName;

      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password,
        user_metadata: {
          ...existingAuthUser.user_metadata,
          full_name: fullName,
          role: 'user',
        },
      });

      if (updateError) {
        return res.status(400).json({
          error: 'Registration failed',
          message: updateError.message,
        });
      }
    } else {
      userId = authData.user.id;
    }

    const verificationCode = generateVerificationCode();
    await verificationStore.save(normalizedEmail, {
      userId,
      fullName: displayName,
      code: verificationCode,
      attempts: 0,
    });

    await sendCodeEmail(normalizedEmail, displayName, verificationCode);

    res.status(200).json({
      success: true,
      message: 'Verification code sent to your email',
      email: normalizedEmail,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      error: 'Registration failed',
      message: error.message,
    });
  }
});

app.post('/api/auth/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        error: 'Missing required fields',
        message: 'Email and verification code are required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const verificationData = await verificationStore.get(normalizedEmail);

    if (!verificationData) {
      return res.status(400).json({
        error: 'Invalid or expired code',
        message: 'Verification code not found. Please request a new code.',
      });
    }

    if (Date.now() > verificationData.expiresAt) {
      await verificationStore.delete(normalizedEmail);
      return res.status(400).json({
        error: 'Code expired',
        message: 'Verification code has expired. Please request a new code.',
      });
    }

    if (verificationData.attempts >= 5) {
      await verificationStore.delete(normalizedEmail);
      return res.status(400).json({
        error: 'Too many attempts',
        message: 'Too many failed attempts. Please request a new code.',
      });
    }

    if (!verificationStore.codeMatches(verificationData, String(code).trim())) {
      const attempts = verificationData.attempts + 1;
      await verificationStore.updateAttempts(normalizedEmail, attempts);
      return res.status(400).json({
        error: 'Invalid code',
        message: 'Incorrect verification code. Please try again.',
        attemptsLeft: 5 - attempts,
      });
    }

    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      verificationData.userId,
      { email_confirm: true }
    );

    if (updateError) {
      console.error('Error confirming user:', updateError);
      return res.status(500).json({
        error: 'Verification failed',
        message: 'Failed to verify account. Please try again.',
      });
    }

    const { error: profileError } = await supabaseAdmin
      .from('users')
      .upsert({
        id: verificationData.userId,
        email: normalizedEmail,
        full_name: verificationData.fullName,
        role: 'user',
        email_verified: true,
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      console.error('Error creating user profile:', profileError);
    }

    await verificationStore.delete(normalizedEmail);

    res.status(200).json({
      success: true,
      message: 'Email verified successfully! You can now log in.',
    });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({
      error: 'Verification failed',
      message: error.message,
    });
  }
});

app.post('/api/auth/resend-code', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Missing email',
        message: 'Email is required',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    let existingData = await verificationStore.get(normalizedEmail);

    if (!existingData) {
      const authUser = await findAuthUserByEmail(normalizedEmail);
      if (!authUser || authUser.email_confirmed_at) {
        return res.status(400).json({
          error: 'No pending verification',
          message: 'No pending verification found for this email. Please sign up again.',
        });
      }

      existingData = {
        userId: authUser.id,
        fullName: authUser.user_metadata?.full_name || 'User',
        attempts: 0,
      };
    }

    const verificationCode = generateVerificationCode();
    await verificationStore.save(normalizedEmail, {
      userId: existingData.userId,
      fullName: existingData.fullName,
      code: verificationCode,
      attempts: 0,
    });

    await sendCodeEmail(normalizedEmail, existingData.fullName, verificationCode, true);

    res.status(200).json({
      success: true,
      message: 'New verification code sent to your email',
    });
  } catch (error) {
    console.error('Resend code error:', error);
    res.status(500).json({
      error: 'Failed to resend code',
      message: error.message,
    });
  }
});

app.use((err, _req, res, _next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
  console.log(`Allowed origins: ${[...allowedOrigins].join(', ')}`);
  console.log(`Verification store: ${process.env.USE_IN_MEMORY_VERIFICATION === 'true' ? 'in-memory' : 'supabase + memory fallback'}`);
});
