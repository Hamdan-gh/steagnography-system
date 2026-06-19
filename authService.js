import { getSupabaseAdmin, findAuthUserByEmail } from './lib/supabase.js';
import {
  generateVerificationCode,
  saveVerificationCode,
  getVerificationCode,
  updateVerificationAttempts,
  deleteVerificationCode,
  codeMatches,
} from './lib/verification.js';
import { sendVerificationEmailMessage } from './emailService.js';

export async function registerUser(body) {
  const { email, password, fullName } = body;

  if (!email || !password || !fullName) {
    throw Object.assign(new Error('Email, password, and full name are required'), {
      statusCode: 400,
      code: 'MISSING_FIELDS',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const supabaseAdmin = getSupabaseAdmin();

  const existingAuthUser = await findAuthUserByEmail(normalizedEmail);
  if (existingAuthUser?.email_confirmed_at) {
    throw Object.assign(new Error('An account with this email already exists and is verified'), {
      statusCode: 400,
      code: 'USER_EXISTS',
    });
  }

  let userId;
  let displayName = fullName;

  if (existingAuthUser) {
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
      throw Object.assign(new Error(updateError.message), {
        statusCode: 400,
        code: 'REGISTRATION_FAILED',
      });
    }
  } else {
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
      throw Object.assign(new Error(authError.message), {
        statusCode: 400,
        code: 'REGISTRATION_FAILED',
      });
    }

    userId = authData.user.id;
  }

  const verificationCode = generateVerificationCode();
  await saveVerificationCode(normalizedEmail, {
    userId,
    fullName: displayName,
    code: verificationCode,
    attempts: 0,
  });

  try {
    await sendVerificationEmailMessage({
      to: normalizedEmail,
      email: normalizedEmail,
      fullName: displayName,
      code: verificationCode,
    });
  } catch (emailError) {
    await deleteVerificationCode(normalizedEmail);
    if (existingAuthUser) {
      // Keep existing unverified auth user
    } else {
      try {
        await supabaseAdmin.auth.admin.deleteUser(userId);
      } catch (cleanupError) {
        console.error('Failed to rollback auth user after email error:', cleanupError);
      }
    }

    throw Object.assign(
      new Error(
        emailError.message?.includes('timeout') || emailError.message?.includes('ETIMEDOUT')
          ? 'Email delivery timed out. Add RESEND_API_KEY in Vercel for reliable delivery.'
          : `Could not send verification email: ${emailError.message}`
      ),
      { statusCode: 503, code: 'EMAIL_DELIVERY_FAILED' }
    );
  }

  return {
    success: true,
    message: 'Verification code sent to your email',
    email: normalizedEmail,
  };
}

export async function verifyUserEmail(body) {
  const { email, code } = body;

  if (!email || !code) {
    throw Object.assign(new Error('Email and verification code are required'), {
      statusCode: 400,
      code: 'MISSING_FIELDS',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const verificationData = await getVerificationCode(normalizedEmail);

  if (!verificationData) {
    throw Object.assign(new Error('Verification code not found. Please request a new code.'), {
      statusCode: 400,
      code: 'INVALID_CODE',
    });
  }

  if (Date.now() > verificationData.expiresAt) {
    await deleteVerificationCode(normalizedEmail);
    throw Object.assign(new Error('Verification code has expired. Please request a new code.'), {
      statusCode: 400,
      code: 'CODE_EXPIRED',
    });
  }

  if (verificationData.attempts >= 5) {
    await deleteVerificationCode(normalizedEmail);
    throw Object.assign(new Error('Too many failed attempts. Please request a new code.'), {
      statusCode: 400,
      code: 'TOO_MANY_ATTEMPTS',
    });
  }

  if (!codeMatches(verificationData, String(code).trim())) {
    const attempts = verificationData.attempts + 1;
    await updateVerificationAttempts(normalizedEmail, attempts);
    throw Object.assign(new Error('Incorrect verification code. Please try again.'), {
      statusCode: 400,
      code: 'INVALID_CODE',
      attemptsLeft: 5 - attempts,
    });
  }

  const supabaseAdmin = getSupabaseAdmin();
  const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
    verificationData.userId,
    { email_confirm: true }
  );

  if (updateError) {
    throw Object.assign(new Error('Failed to verify account. Please try again.'), {
      statusCode: 500,
      code: 'VERIFICATION_FAILED',
    });
  }

  const { error: profileError } = await supabaseAdmin
    .from('users')
    .upsert({
      id: verificationData.userId,
      email: normalizedEmail,
      full_name: verificationData.fullName,
      role: 'user',
      updated_at: new Date().toISOString(),
    });

  if (profileError) {
    console.error('Error creating user profile:', profileError);
  }

  await deleteVerificationCode(normalizedEmail);

  return {
    success: true,
    message: 'Email verified successfully! You can now log in.',
  };
}

export async function resendVerificationCode(body) {
  const { email } = body;

  if (!email) {
    throw Object.assign(new Error('Email is required'), {
      statusCode: 400,
      code: 'MISSING_EMAIL',
    });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  let existingData = await getVerificationCode(normalizedEmail);

  if (!existingData) {
    const authUser = await findAuthUserByEmail(normalizedEmail);
    if (!authUser || authUser.email_confirmed_at) {
      throw Object.assign(new Error('No pending verification found for this email. Please sign up again.'), {
        statusCode: 400,
        code: 'NO_PENDING_VERIFICATION',
      });
    }

    existingData = {
      userId: authUser.id,
      fullName: authUser.user_metadata?.full_name || 'User',
      attempts: 0,
    };
  }

  const verificationCode = generateVerificationCode();
  await saveVerificationCode(normalizedEmail, {
    userId: existingData.userId,
    fullName: existingData.fullName,
    code: verificationCode,
    attempts: 0,
  });

  try {
    await sendVerificationEmailMessage({
      to: normalizedEmail,
      email: normalizedEmail,
      fullName: existingData.fullName,
      code: verificationCode,
      isResend: true,
    });
  } catch (emailError) {
    throw Object.assign(new Error(`Could not send verification email: ${emailError.message}`), {
      statusCode: 503,
      code: 'EMAIL_DELIVERY_FAILED',
    });
  }

  return {
    success: true,
    message: 'New verification code sent to your email',
  };
}

export function getAuthHealthStatus() {
  const hasSupabaseUrl = !!(process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL);
  const hasSupabaseKey = !!process.env.SUPABASE_SERVICE_KEY;
  const hasResend = !!process.env.RESEND_API_KEY;
  const hasSmtp = !!(process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASSWORD);

  return {
    status: 'ok',
    message: 'Auth API is running',
    config: {
      hasSupabaseUrl,
      hasSupabaseKey,
      emailProvider: hasResend ? 'resend' : hasSmtp ? 'smtp' : 'none',
      hasResend,
      hasSmtp,
    },
  };
}
