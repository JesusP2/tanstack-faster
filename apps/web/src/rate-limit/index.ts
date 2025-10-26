import { env } from 'cloudflare:workers';
import {
  getRequestHeader,
  getResponseStatus,
  setResponseStatus,
} from '@tanstack/react-start/server';
import {
  setDraft6Headers,
  setDraft7Headers,
  setRetryAfterHeader,
} from './headers';
import { WorkersKVStore } from './kv-store';
import type {
  GeneralConfigType,
  RateLimitConfiguration,
  RateLimitInfo,
} from './types';
import { getKeyAndIncrement, initStore } from './utils';

/**
 *
 * Create an instance of rate-limiting middleware for Hono.
 *
 * @param config {ConfigType} - Options to configure the rate limiter.
 *
 * @returns - The middleware that rate-limits clients based on your configuration.
 *
 * @public
 */
export function rateLimiter<E extends Env = Env, P extends string = string>(
  config: GeneralConfigType<RateLimitConfiguration<E, P>>
) {
  const {
    windowMs = 60_000,
    limit = 5,
    message = 'Too many requests, please try again later.',
    statusCode = 429,
    standardHeaders = 'draft-6',
    requestPropertyName = 'rateLimit',
    requestStorePropertyName = 'rateLimitStore',
    skipFailedRequests = false,
    skipSuccessfulRequests = false,
    keyGenerator,
    requestWasSuccessful = (status) => status < 400,
    handler = (options) => {
      setResponseStatus(options.statusCode);

      const responseMessage = options.message;

      if (typeof responseMessage === 'string') {
        return new Response(responseMessage, {
          status: options.statusCode,
        });
      }

      return new Response(JSON.stringify(responseMessage), {
        status: options.statusCode,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    },
    store,
  } = config;

  if (!store) throw new Error('store is required');
  const options = {
    windowMs,
    limit,
    message,
    statusCode,
    standardHeaders,
    requestPropertyName,
    requestStorePropertyName,
    skipFailedRequests,
    skipSuccessfulRequests,
    keyGenerator,
    requestWasSuccessful,
    handler,
    store,
  };

  initStore(store, options);

  return async () => {
    const { key, totalHits, resetTime } = await getKeyAndIncrement(
      keyGenerator,
      store
    );
    console.log(key, totalHits, resetTime);

    // Define the rate limit info for the client.
    const info: RateLimitInfo = {
      limit,
      used: totalHits,
      remaining: Math.max(limit - totalHits, 0),
      resetTime,
    };

    // Set the standardized `RateLimit-*` headers on the response object
    // if (standardHeaders && !c.finalized) {
    if (standardHeaders) {
      if (standardHeaders === 'draft-7') {
        setDraft7Headers(info, windowMs);
      } else {
        // For true and draft-6
        setDraft6Headers(info, windowMs);
      }
    }

    // If we are to skip failed/successfull requests, decrement the
    // counter accordingly once we know the status code of the request
    let decremented = false;
    const decrementKey = async () => {
      if (!decremented) {
        await store.decrement(key);
        decremented = true;
      }
    };

    const shouldSkipRequest = async () => {
      if (skipFailedRequests || skipSuccessfulRequests) {
        const wasRequestSuccessful = await requestWasSuccessful(
          getResponseStatus()
        );

        if (
          (skipFailedRequests && !wasRequestSuccessful) ||
          (skipSuccessfulRequests && wasRequestSuccessful)
        )
          await decrementKey();
      }
    };
    // If the client has exceeded their rate limit, set the Retry-After header
    // and call the `handler` function.
    if (totalHits > limit) {
      if (standardHeaders) {
        setRetryAfterHeader(info, windowMs);
      }
      await shouldSkipRequest();
      return handler(options);
    }
    await shouldSkipRequest();
  };
}

export const rateLimit = rateLimiter({
  windowMs: 60_000,
  limit: 5,
  standardHeaders: 'draft-6',
  keyGenerator: () => getRequestHeader('cf-connecting-ip') ?? '',
  store: new WorkersKVStore({ namespace: env.TEMPLATE_CACHE }),
});
