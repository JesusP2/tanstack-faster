import Redis from "ioredis";
import { env } from "@/shared/env";

// Create Redis client singleton
let redisClient: Redis | null = null;

function getRedisClient(): Redis {
	if (!redisClient) {
		redisClient = new Redis(env.REDIS_URL, {
			maxRetriesPerRequest: 3,
			retryStrategy: (times) => {
				const delay = Math.min(times * 50, 2000);
				return delay;
			},
		});

		redisClient.on("error", (error) => {
			console.error("Redis connection error:", error);
		});

		redisClient.on("connect", () => {
			console.log("Redis connected successfully");
		});
	}
	return redisClient;
}

/**
 * Generate a cache key from function name and input data
 */
function generateCacheKey(functionName: string, input?: unknown): string {
	const inputStr = input ? JSON.stringify(input) : "";
	return `cache:${functionName}:${inputStr}`;
}

/**
 * Cache wrapper for server functions
 * @param fn - The function to cache (should be a no-arg function that returns a Promise)
 * @param functionName - Unique name for the function (used in cache key)
 * @param ttlSeconds - Time to live in seconds (default: 7200 = 2 hours)
 * @param input - The input data to use for cache key generation
 * @returns A Promise with the cached or fresh result
 */
export async function withCache<T>(
	fn: () => Promise<T>,
	functionName: string,
	input?: unknown,
	ttlSeconds = 7200, // 2 hours default
): Promise<T> {
	const redis = getRedisClient();
	const cacheKey = generateCacheKey(functionName, input);

	try {
		// Try to get from cache
		const cached = await redis.get(cacheKey);
		if (cached) {
			return JSON.parse(cached) as T;
		}

		// Cache miss - execute function
		const result = await fn();

		// Store in cache
		await redis.setex(cacheKey, ttlSeconds, JSON.stringify(result));

		return result;
	} catch (error) {
		// If Redis fails, fall back to executing the function
		console.error(`Cache error for ${functionName}:`, error);
		return fn();
	}
}

/**
 * Invalidate cache entries matching a pattern
 * @param pattern - Redis key pattern (e.g., "cache:getProductDetails:*")
 */
export async function invalidateCache(pattern: string): Promise<void> {
	const redis = getRedisClient();
	try {
		const keys = await redis.keys(pattern);
		if (keys.length > 0) {
			await redis.del(...keys);
		}
	} catch (error) {
		console.error(`Cache invalidation error for pattern ${pattern}:`, error);
	}
}

/**
 * Clear all cache entries for a specific function
 * @param functionName - The function name to clear cache for
 */
export async function clearFunctionCache(functionName: string): Promise<void> {
	await invalidateCache(`cache:${functionName}:*`);
}

