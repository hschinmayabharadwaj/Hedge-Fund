import { redis } from "./redis";

const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 100;

export async function rateLimit(identifier) {
  const key = `ratelimit:${identifier}`;
  const now = Date.now();

  try {
    const windowStart = now - WINDOW_MS;
    await redis.zremrangebyscore(key, 0, windowStart);
    const count = await redis.zcard(key);

    if (count >= MAX_REQUESTS) {
      return { allowed: false, remaining: 0, ttl: WINDOW_MS };
    }

    await redis.zadd(key, now, `${now}-${Math.random()}`);
    await redis.expire(key, Math.ceil(WINDOW_MS / 1000));

    return { allowed: true, remaining: MAX_REQUESTS - count - 1, ttl: WINDOW_MS };
  } catch {
    return { allowed: true, remaining: MAX_REQUESTS };
  }
}
