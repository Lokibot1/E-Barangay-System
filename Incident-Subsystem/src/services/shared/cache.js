/**
 * Lightweight in-memory TTL cache for frontend service calls.
 * Avoids redundant API hits for data that changes infrequently.
 *
 * Usage:
 *   import { memCache } from './cache';
 *   const data = memCache.get('my:key');
 *   if (!data) {
 *     const fresh = await fetchSomething();
 *     memCache.set('my:key', fresh, 5 * 60 * 1000); // 5 min
 *   }
 *
 * Or use the helper:
 *   const data = await memCache.remember('my:key', 5 * 60 * 1000, fetchSomething);
 */

const store = new Map(); // key → { value, expiresAt }

export const memCache = {
  /**
   * Return the cached value for `key` if it exists and has not expired.
   * Returns null on miss or expiry.
   */
  get(key) {
    const entry = store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      store.delete(key);
      return null;
    }
    return entry.value;
  },

  /**
   * Store `value` under `key` with a TTL of `ttlMs` milliseconds.
   */
  set(key, value, ttlMs) {
    store.set(key, { value, expiresAt: Date.now() + ttlMs });
  },

  /**
   * Remove all entries whose key starts with `prefix` (or exactly matches it).
   */
  invalidate(prefix) {
    for (const key of store.keys()) {
      if (key === prefix || key.startsWith(prefix)) {
        store.delete(key);
      }
    }
  },

  /**
   * Return the cached value if fresh, otherwise call `fetcher()`, cache
   * the result, and return it.
   */
  async remember(key, ttlMs, fetcher) {
    const cached = this.get(key);
    if (cached !== null) return cached;
    const fresh = await fetcher();
    this.set(key, fresh, ttlMs);
    return fresh;
  },
};
