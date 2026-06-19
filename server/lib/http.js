const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://steagnography-system.vercel.app',
];

const VERCEL_ORIGIN_RE = /^https:\/\/[\w-]+\.vercel\.app$/;

function allowedOrigins() {
  const origins = [...DEFAULT_ORIGINS];
  const extra = process.env.FRONTEND_URL || '';
  for (const origin of extra.split(',')) {
    const trimmed = origin.trim();
    if (trimmed && !origins.includes(trimmed)) {
      origins.push(trimmed);
    }
  }
  return origins;
}

export function setCorsHeaders(req, res) {
  const origin = req.headers.origin;
  const allowed = allowedOrigins();

  if (origin && (allowed.includes(origin) || VERCEL_ORIGIN_RE.test(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Vary', 'Origin');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

export function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === 'string') {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

export function sendError(res, error) {
  const status = error.statusCode || 500;
  const message = error.message || 'Something went wrong';
  return res.status(status).json({
    error: error.code || 'REQUEST_FAILED',
    message,
    ...(error.attemptsLeft !== undefined ? { attemptsLeft: error.attemptsLeft } : {}),
  });
}

export function withJsonHandler(handler, { methods = ['POST'] } = {}) {
  return async (req, res) => {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    if (!methods.includes(req.method)) {
      return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' });
    }

    try {
      const result = await handler(parseBody(req), req);
      return res.status(200).json(result);
    } catch (error) {
      console.error('Auth handler error:', error);
      return sendError(res, error);
    }
  };
}

export function withHealthHandler(getStatus) {
  return async (req, res) => {
    setCorsHeaders(req, res);

    if (req.method === 'OPTIONS') {
      return res.status(204).end();
    }

    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'METHOD_NOT_ALLOWED', message: 'Method not allowed' });
    }

    return res.status(200).json(getStatus());
  };
}
