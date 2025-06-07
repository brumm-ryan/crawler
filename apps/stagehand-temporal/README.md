# 🤘 Welcome to Stagehand!

Hey! This is a project built with [Stagehand](https://github.com/browserbase/stagehand).

You can build your own web agent using: `npx create-browser-app`!

## Setting the Stage

Stagehand is an SDK for automating browsers. It's built on top of [Playwright](https://playwright.dev/) and provides a higher-level API for better debugging and AI fail-safes.

## Curtain Call

Get ready for a show-stopping development experience. Just run:

```bash
npm install && npm start
```

## What's Next?

### Stagehand Pooling

This project uses a pooling mechanism for Stagehand instances to improve performance and resource utilization. The pool is implemented using the `generic-pool` library and is configured in `stagehand-pooler.ts`.

Key features of the Stagehand pool:
- Maintains a minimum of 2 and maximum of 10 Stagehand instances
- Automatically creates instances when needed and destroys idle ones
- Validates instances before reuse to ensure they're still functional
- Properly handles cleanup during worker shutdown

To use the pool in your activities:
1. **Using the `withStagehand` helper (recommended):**
   ```typescript
   import { withStagehand } from "../stagehand-helper";

   async function myActivity(stagehand: Stagehand): Promise<any> {
     // Use stagehand instance here
     // No need to worry about acquiring or releasing
   }

   export const exportedActivity = withStagehand(myActivity);
   ```

2. **Manual pool management:**
   ```typescript
   import { acquireStagehand, releaseStagehand } from "../stagehand-helper";

   export async function manualPoolActivity(): Promise<any> {
     const stagehand = await acquireStagehand();
     try {
       // Use stagehand instance here
       return result;
     } finally {
       await releaseStagehand(stagehand);
     }
   }
   ```

### Add your API keys

Required API keys/environment variables are in the `.env.example` file. Copy it to `.env` and add your API keys.

```bash
cp .env.example .env && nano .env # Add your API keys to .env
```

### Custom .cursorrules

We have custom .cursorrules for this project. It'll help quite a bit with writing Stagehand easily.

### Run on Browserbase

To run on Browserbase, add your API keys to .env and change `env: "LOCAL"` to `env: "BROWSERBASE"` in [stagehand.config.ts](stagehand.config.ts).

### Use Anthropic Claude 3.5 Sonnet

1. Add your API key to .env
2. Change `modelName: "gpt-4o"` to `modelName: "claude-3-5-sonnet-latest"` in [stagehand.config.ts](stagehand.config.ts)
3. Change `modelClientOptions: { apiKey: process.env.OPENAI_API_KEY }` to `modelClientOptions: { apiKey: process.env.ANTHROPIC_API_KEY }` in [stagehand.config.ts](stagehand.config.ts)

## Redis Integration

This project includes Redis for caching and data storage. Redis is configured in the Docker Compose setup and can be used throughout the application.

### Configuration

Redis is configured with the following environment variables:
- `REDIS_HOST`: Redis server hostname (default: "localhost")
- `REDIS_PORT`: Redis server port (default: "6379")
- `REDIS_PASSWORD`: Redis password (optional)
- `REDIS_DB`: Redis database number (default: "0")
- `REDIS_KEY_PREFIX`: Prefix for all Redis keys (default: "stagehand:")

### Using Redis in Activities

The project includes several Redis-related activities in `src/temporal/activities/shared/redis-cache.ts`:

1. **Basic Cache Operations:**
   ```typescript
   import { getCachedValue, setCachedValue, deleteCachedValue, hasCachedValue } from '../activities';

   // Get a value from cache
   const value = await getCachedValue<YourType>("your-key");

   // Set a value in cache (with optional expiration in seconds)
   await setCachedValue("your-key", yourValue, 3600); // Expires in 1 hour

   // Delete a value from cache
   await deleteCachedValue("your-key");

   // Check if a key exists in cache
   const exists = await hasCachedValue("your-key");
   ```

2. **Compute-if-absent Pattern:**
   ```typescript
   import { getCachedOrCompute } from '../activities';

   // Get from cache or compute if not found
   const result = await getCachedOrCompute<YourType>(
     "your-key",
     async () => {
       // This function is only called if the key is not in cache
       return await yourExpensiveOperation();
     },
     3600 // Optional: cache for 1 hour
   );
   ```

### Direct Redis Access

For more advanced Redis operations, you can use the Redis client directly:

```typescript
import { getRedisClient } from '../../services/redis';

async function customRedisOperation() {
  const redis = getRedisClient();

  // Use any Redis commands
  await redis.hset("user:123", "name", "John");
  await redis.hincrby("user:123", "visits", 1);

  // Get all user data
  const userData = await redis.hgetall("user:123");
}
```
