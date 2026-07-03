import Redis from "ioredis";

const globalForRedis = globalThis;

const redis = globalForRedis.redis ?? new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => Math.min(times * 50, 2000),
  enableOfflineQueue: false,
  lazyConnect: true,
});

redis.on("error", (err) => console.error("[Redis Error]", err.message));

if (process.env.NODE_ENV !== "production") globalForRedis.redis = redis;

const CACHE_TTL = 30;
const MARKET_CACHE_TTL = 5;

export async function getCachedOrFetch(key, fetchFn, ttl = CACHE_TTL) {
  try {
    const cached = await redis.get(key);
    if (cached) return JSON.parse(cached);
  } catch {}
  const data = await fetchFn();
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch {}
  return data;
}

export async function invalidateCache(pattern) {
  const stream = redis.scanStream({ match: pattern, count: 100 });
  for await (const keys of stream) {
    if (keys.length) await redis.del(...keys);
  }
}

export async function publishMarketUpdate(channel, data) {
  await redis.publish(`market:${channel}`, JSON.stringify(data));
}

export { redis };
