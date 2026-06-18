import { API_BASE_URL } from '@/constants';

/** Resolve backend-relative paths like /api/download/foo to full URLs. */
export function resolveMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/')) return `${API_BASE_URL}${url}`;
  return url;
}
