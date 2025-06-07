import { ObserveResult, Page } from "@browserbasehq/stagehand";
import { getCache, setCache } from "../services/redis";

/**
 * A wrapper for page.observe() that first checks Redis for the observation before inferencing it.
 * 
 * @param page - The Stagehand page object
 * @param prompt - The instruction to observe with
 * @param options - Optional configuration
 * @param options.cacheKey - Custom cache key, defaults to the prompt
 * @param options.expireSeconds - Time in seconds until the cache entry expires
 * @param options.selfHeal - Whether to attempt self-healing if the observation fails
 * @returns An array of ObserveResult objects
 */
export async function observeWithCache(
  page: Page,
  prompt: string,
  options: {
    cacheKey?: string;
    expireSeconds?: number;
    selfHeal?: boolean;
  } = {}
): Promise<ObserveResult[]> {
  const { cacheKey, expireSeconds, selfHeal = false } = options;
  try {
    // Use the provided cache key or the prompt itself
    const key = cacheKey || prompt;

    // Try to get the observation from cache
    const cachedResults = await getCache<ObserveResult[]>(key);

    let results: ObserveResult[];
    if (cachedResults) {
      // Use the cached observation
      results = cachedResults;
      console.log(`Using cached observation for: ${prompt}`);
    } else {
      // Get the observe result by inferencing
      results = await page.observe(prompt);

      // Cache the observation with optional expiration
      await setCache(key, results, expireSeconds);
      console.log(`Cached observation for: ${prompt}${expireSeconds ? ` (expires in ${expireSeconds}s)` : ''}`);
    }

    return results;
  } catch (e) {
    console.error(e);
    // In selfHeal mode, we'll retry the observation without caching
    if (selfHeal) {
      console.log("Attempting to self-heal observation...");
      return await page.observe(prompt);
    } else {
      throw e;
    }
  }
}
