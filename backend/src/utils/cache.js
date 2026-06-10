const Redis = require('ioredis');
const logger = require('./Logger');

let redisClient = null;

const getRedisClient = () => {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD || undefined,
      retryStrategy: (times) => {
        if (times > 3) {
          logger.warn('Redis connection failed after 3 retries. Caching disabled.');
          return null; // stop retrying
        }
        return Math.min(times * 200, 2000);
      },
      lazyConnect: true,
    });

    redisClient.on('connect', () => logger.info('Redis connected'));
    redisClient.on('error', (err) => logger.warn(`Redis error: ${err.message}`));
  }
  return redisClient;
};

/**
 * Get a cached value by key
 */
const cacheGet = async (key) => {
  try {
    const client = getRedisClient();
    const value = await client.get(key);
    return value ? JSON.parse(value) : null;
  } catch (err) {
    logger.warn(`Cache GET failed for key ${key}: ${err.message}`);
    return null;
  }
};

/**
 * Set a cached value with TTL (seconds)
 */
const cacheSet = async (key, value, ttlSeconds = 300) => {
  try {
    const client = getRedisClient();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch (err) {
    logger.warn(`Cache SET failed for key ${key}: ${err.message}`);
  }
};




module.exports = {
  getRedisClient,
  cacheGet,
  cacheSet,
};