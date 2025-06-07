import { ObserveResult, Page } from "@browserbasehq/stagehand";
import { getCache, setCache } from "../services/redis";

/**
 * A wrapper for page.act() that first checks Redis for the observation before inferencing it.
 * 
 * @param page - The Stagehand page object
 * @param prompt - The instruction to act with
 * @param options - Optional configuration
 * @param options.cacheKey - Custom cache key, defaults to the prompt
 * @param options.expireSeconds - Time in seconds until the cache entry expires
 * @param options.selfHeal - Whether to attempt self-healing if the action fails
 */
export async function actWithCache(
  page: Page,
  prompt: string,
  options: {
    cacheKey?: string;
    expireSeconds?: number;
    selfHeal?: boolean;
  } = {}
): Promise<void> {
  const { cacheKey, expireSeconds, selfHeal = false } = options;
  try {
    // Use the provided cache key or the prompt itself
    const key = cacheKey || prompt;

    // Try to get the action from cache
    const cachedAction = await getCache<ObserveResult>(key);

    let action: ObserveResult;
    if (cachedAction) {
      // Use the cached action
      action = cachedAction;
      console.log(`Using cached action for: ${prompt}`);
    } else {
      // Get the observe result (the action)
      const results = await page.observe(prompt);
      action = results[0];

      // Cache the action with optional expiration
      await setCache(key, action, expireSeconds);
      console.log(`Cached action for: ${prompt}${expireSeconds ? ` (expires in ${expireSeconds}s)` : ''}`);
    }

    // Run the action (no LLM inference)
    await page.act(action);
  } catch (e) {
    console.error(e);
    // In selfHeal mode, we'll retry the action
    if (selfHeal) {
      console.log("Attempting to self-heal action...");
      await page.act(prompt);
    } else {
      throw e;
    }
  }
}