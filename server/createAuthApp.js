import express from 'express';
import {
  registerUser,
  verifyUserEmail,
  resendVerificationCode,
  getAuthHealthStatus,
} from './authService.js';
import { setCorsHeaders } from './lib/http.js';

const DEFAULT_ORIGINS = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://steagnography-system.vercel.app',
];

const VERCEL_ORIGIN_RE = /^https:\/\/[\w-]+\.vercel\.app$/;

function buildAllowedOrigins() {
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

function isOriginAllowed(origin, allowedOrigins) {
  if (!origin) return true;
  return allowedOrigins.includes(origin) || VERCEL_ORIGIN_RE.test(origin);
}

async function runRoute(handler, req, res) {
  try {
    const result = await handler(req.body);
    res.status(200).json(result);
  } catch (error) {
    const status = error.statusCode || 500;
    res.status(status).json({
      error: error.code || 'REQUEST_FAILED',
      message: error.message || 'Something went wrong',
      ...(error.attemptsLeft !== undefined ? { attemptsLeft: error.attemptsLeft } : {}),
    });
  }
}

export function createAuthApp() {
  const app = express();
  const allowedOrigins = buildAllowedOrigins();

  app.use((req, res, next) => {
    setCorsHeaders(req, res);
    const origin = req.headers.origin;
    if (req.method === 'OPTIONS') {
      if (isOriginAllowed(origin, allowedOrigins)) {
        return res.status(204).end();
      }
      return res.status(403).json({ error: 'CORS_NOT_ALLOWED', message: 'Origin not allowed' });
    }
    if (origin && !isOriginAllowed(origin, allowedOrigins)) {
      return res.status(403).json({ error: 'CORS_NOT_ALLOWED', message: 'Origin not allowed' });
    }
    next();
  });

  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', message: 'Auth server is running' });
  });

  app.get('/api/auth/health', (_req, res) => {
    res.json(getAuthHealthStatus());
  });

  app.post('/api/auth/register', (req, res) => runRoute(registerUser, req, res));
  app.post('/api/auth/verify-email', (req, res) => runRoute(verifyUserEmail, req, res));
  app.post('/api/auth/resend-code', (req, res) => runRoute(resendVerificationCode, req, res));

  app.use((err, req, res, _next) => {
    setCorsHeaders(req, res);
    res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
  });

  return app;
}
