import type { RateLimitConfiguration, Promisify, Store } from "./types";

export const isValidStore = <
  E extends Env = Env,
  P extends string = string,
>(
  value: Store<E, P>,
): value is Store<E, P> => !!value?.increment;

export function initStore<E extends Env, P extends string>(
  store: Store<E, P>,
  options: RateLimitConfiguration<E, P>,
) {
  // Checking if store is valid
  if (!isValidStore(store)) {
    throw new Error("The store is not correctly implemented!");
  }

  // Call the `init` method on the store, if it exists
  if (typeof store.init === "function") {
    store.init(options);
  }
}

export async function getKeyAndIncrement<
  E extends Env,
  P extends string,
>(
  keyGenerator: () => Promisify<string>,
  store: Store<E, P>,
): Promise<{ key: string; totalHits: number; resetTime: Date | undefined }> {
  const key = await keyGenerator();
  const { totalHits, resetTime } = await store.increment(key);

  return { key, totalHits, resetTime };
}
