import crypto from 'crypto';

const TABLE = 'email_verification_codes';

function hashCode(code) {
  const secret = process.env.VERIFICATION_CODE_SECRET || process.env.SUPABASE_SERVICE_KEY || 'dev-secret';
  return crypto.createHmac('sha256', secret).update(String(code)).digest('hex');
}

function expiryMs() {
  return parseInt(process.env.VERIFICATION_CODE_EXPIRY || '600000', 10);
}

export class VerificationStore {
  constructor(supabaseAdmin) {
    this.supabase = supabaseAdmin;
    this.memory = new Map();
    this.dbEnabled = process.env.USE_IN_MEMORY_VERIFICATION !== 'true';
  }

  async save(email, { userId, fullName, code, attempts = 0 }) {
    const expiresAt = Date.now() + expiryMs();
    const record = {
      email,
      code_hash: hashCode(code),
      user_id: userId,
      full_name: fullName,
      expires_at: new Date(expiresAt).toISOString(),
      attempts,
    };

    if (this.dbEnabled) {
      const { error } = await this.supabase.from(TABLE).upsert(record, { onConflict: 'email' });
      if (!error) {
        return { expiresAt };
      }
      console.warn('Verification DB write failed, using in-memory store:', error.message);
    }

    this.memory.set(email, {
      code,
      userId,
      fullName,
      expiresAt,
      attempts,
    });
    return { expiresAt };
  }

  async get(email) {
    if (this.dbEnabled) {
      const { data, error } = await this.supabase
        .from(TABLE)
        .select('*')
        .eq('email', email)
        .maybeSingle();

      if (!error && data) {
        return {
          source: 'db',
          codeHash: data.code_hash,
          userId: data.user_id,
          fullName: data.full_name,
          expiresAt: new Date(data.expires_at).getTime(),
          attempts: data.attempts ?? 0,
        };
      }
      if (error && error.code !== 'PGRST116') {
        console.warn('Verification DB read failed:', error.message);
      }
    }

    const memory = this.memory.get(email);
    if (!memory) return null;

    return {
      source: 'memory',
      code: memory.code,
      userId: memory.userId,
      fullName: memory.fullName,
      expiresAt: memory.expiresAt,
      attempts: memory.attempts ?? 0,
    };
  }

  async updateAttempts(email, attempts) {
    if (this.dbEnabled) {
      const { error } = await this.supabase
        .from(TABLE)
        .update({ attempts })
        .eq('email', email);
      if (!error) return;
    }

    const memory = this.memory.get(email);
    if (memory) {
      memory.attempts = attempts;
      this.memory.set(email, memory);
    }
  }

  async delete(email) {
    if (this.dbEnabled) {
      await this.supabase.from(TABLE).delete().eq('email', email);
    }
    this.memory.delete(email);
  }

  codeMatches(stored, code) {
    if (stored.codeHash) {
      return hashCode(code) === stored.codeHash;
    }
    return stored.code === code;
  }
}
