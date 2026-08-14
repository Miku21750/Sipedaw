type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()) {
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    const entry = { count: 1, resetAt: now + windowMs };
    buckets.set(key, entry);
    return { allowed: true, remaining: limit - 1, resetAt: entry.resetAt };
  }
  current.count += 1;
  return { allowed: current.count <= limit, remaining: Math.max(0, limit - current.count), resetAt: current.resetAt };
}

export function resetRateLimits() {
  buckets.clear();
}
