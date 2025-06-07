import Redis from 'ioredis';

/**
 * Redis client configuration options
 */
interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
}

/**
 * Default Redis configuration
 */
const defaultRedisConfig: RedisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD,
  db: parseInt(process.env.REDIS_DB || '0', 10),
  keyPrefix: process.env.REDIS_KEY_PREFIX || 'stagehand:'
};

/**
 * Redis client singleton instance
 */
let redisClient: Redis | null = null;

/**
 * Get the Redis client instance
 * Creates a new client if one doesn't exist
 * 
 * @param customConfig - Optional custom Redis configuration
 * @returns Redis client instance
 */
export function getRedisClient(customConfig?: Partial<RedisConfig>): Redis {
  if (!redisClient) {
    const config = { ...defaultRedisConfig, ...customConfig };
    redisClient = new Redis(config);

    // Handle Redis connection events
    redisClient.on('error', (err) => {
      console.error('Redis connection error:', err);
    });

    redisClient.on('connect', () => {
      console.log('Connected to Redis');
    });
  }

  return redisClient;
}

/**
 * Close the Redis connection
 */
export async function closeRedisConnection(): Promise<void> {
  if (redisClient) {
    await redisClient.quit();
    redisClient = null;
    console.log('Redis connection closed');
  }
}

/**
 * Set a value in Redis with optional expiration
 * 
 * @param key - The key to set
 * @param value - The value to store
 * @param expireSeconds - Optional expiration time in seconds
 * @returns Promise resolving to "OK" if successful
 */
export async function setCache(key: string, value: any, expireSeconds?: number): Promise<string> {
  const client = getRedisClient();
  const serializedValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

  if (expireSeconds) {
    return client.set(key, serializedValue, 'EX', expireSeconds);
  }

  return client.set(key, serializedValue);
}

/**
 * Get a value from Redis
 * 
 * @param key - The key to retrieve
 * @param parseJson - Whether to parse the result as JSON (default: true)
 * @returns Promise resolving to the stored value or null if not found
 */
export async function getCache<T = any>(key: string, parseJson = true): Promise<T | null> {
  const client = getRedisClient();
  const value = await client.get(key);

  if (!value) return null;

  if (parseJson) {
    try {
      return JSON.parse(value) as T;
    } catch (e) {
      return value as unknown as T;
    }
  }

  return value as unknown as T;
}

/**
 * Delete a key from Redis
 * 
 * @param key - The key to delete
 * @returns Promise resolving to the number of keys removed
 */
export async function deleteCache(key: string): Promise<number> {
  const client = getRedisClient();
  return client.del(key);
}

/**
 * Check if a key exists in Redis
 * 
 * @param key - The key to check
 * @returns Promise resolving to true if the key exists, false otherwise
 */
export async function hasCache(key: string): Promise<boolean> {
  const client = getRedisClient();
  const exists = await client.exists(key);
  return exists === 1;
}

/**
 * Set a key's time to live in seconds
 * 
 * @param key - The key to set expiration on
 * @param seconds - The expiration time in seconds
 * @returns Promise resolving to 1 if successful, 0 if key doesn't exist
 */
export async function expireCache(key: string, seconds: number): Promise<number> {
  const client = getRedisClient();
  return client.expire(key, seconds);
}
