/**
 * Simple in-memory fixed-window rate limiter for server actions / route handlers.
 * Keyed by an arbitrary string (IP, email, tran_id, etc.).
 *
 * Not distributed — resets on deploy / per server instance. For production
 * behind multiple instances, back this with Redis (same API shape).
 */
interface Window {
  count: number;
  resetAt: number;
}

const windows = new Map<string, Window>();

export function rateLimit(key: string, max: number, windowMs: number): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const existing = windows.get(key);

  if (!existing || now > existing.resetAt) {
    windows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: Math.max(max - 1, 0), resetAt: now + windowMs };
  }

  if (existing.count >= max) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: Math.max(max - existing.count, 0), resetAt: existing.resetAt };
}

export function clearRateLimit(key: string): void {
  windows.delete(key);
}
