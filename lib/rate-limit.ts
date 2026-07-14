const requestLog = new Map<string, number[]>();

export function checkRateLimit(key: string, windowMs = 60_000, max = 15) {
  const now = Date.now();
  const bucket = requestLog.get(key) ?? [];
  const recent = bucket.filter((timestamp) => now - timestamp < windowMs);

  if (recent.length >= max) {
    return false;
  }

  recent.push(now);
  requestLog.set(key, recent);
  return true;
}
