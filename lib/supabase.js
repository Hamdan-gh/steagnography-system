import { createClient } from '@supabase/supabase-js';

let client;

function env(name, fallback) {
  return process.env[name] || (fallback ? process.env[fallback] : undefined);
}

export function getSupabaseAdmin() {
  if (client) return client;

  const url = env('SUPABASE_URL', 'VITE_SUPABASE_URL');
  const key = env('SUPABASE_SERVICE_KEY');

  if (!url || !key) {
    throw Object.assign(new Error('Server misconfigured: missing SUPABASE_URL or SUPABASE_SERVICE_KEY'), {
      statusCode: 500,
      code: 'CONFIG_ERROR',
    });
  }

  client = createClient(url, key);
  return client;
}

export async function findAuthUserByEmail(email) {
  const supabaseAdmin = getSupabaseAdmin();
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
