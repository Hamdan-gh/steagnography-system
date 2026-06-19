import crypto from 'crypto';
import { getSupabaseAdmin } from './supabase.js';

const TABLE = 'email_verification_codes';

function hashCode(code) {
  const secret = process.env.VERIFICATION_CODE_SECRET || process.env.SUPABASE_SERVICE_KEY || 'dev-secret';
  return crypto.createHmac('sha256', secret).update(String(code)).digest('hex');
}

function expiryMs() {
  return parseInt(process.env.VERIFICATION_CODE_EXPIRY || '600000', 10);
}

export function generateVerificationCode() {
  const length = parseInt(process.env.VERIFICATION_CODE_LENGTH || '6', 10);
  const max = 10 ** length;
  const min = 10 ** (length - 1);
  return crypto.randomInt(min, max).toString();
}

export async function saveVerificationCode(email, { userId, fullName, code, attempts = 0 }) {
  const supabase = getSupabaseAdmin();
  const expiresAt = Date.now() + expiryMs();
  const record = {
    email,
    code_hash: hashCode(code),
    user_id: userId,
    full_name: fullName,
    expires_at: new Date(expiresAt).toISOString(),
    attempts,
  };

  const { error } = await supabase.from(TABLE).upsert(record, { onConflict: 'email' });

  if (error) {
    const hint = error.code === '42P01'
      ? ' Run supabase_verification_codes.sql in Supabase.'
      : '';
    throw Object.assign(
      new Error(`Could not store verification code.${hint} (${error.message})`),
      { statusCode: 500, code: 'VERIFICATION_STORE_ERROR' }
    );
  }

  return { expiresAt };
}

export async function getVerificationCode(email) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('email', email)
    .maybeSingle();

  if (error) {
    throw Object.assign(new Error(error.message), { statusCode: 500, code: 'VERIFICATION_STORE_ERROR' });
  }

  if (!data) return null;

  return {
    codeHash: data.code_hash,
    userId: data.user_id,
    fullName: data.full_name,
    expiresAt: new Date(data.expires_at).getTime(),
    attempts: data.attempts ?? 0,
  };
}

export async function updateVerificationAttempts(email, attempts) {
  const supabase = getSupabaseAdmin();
  await supabase.from(TABLE).update({ attempts }).eq('email', email);
}

export async function deleteVerificationCode(email) {
  const supabase = getSupabaseAdmin();
  await supabase.from(TABLE).delete().eq('email', email);
}

export function codeMatches(stored, code) {
  return hashCode(code) === stored.codeHash;
}
