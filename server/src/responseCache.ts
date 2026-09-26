/**
 * In-memory cache for public listing responses. The site asks for the same listings on every
 * visit, page refresh and image request; serving repeats from memory means the database is
 * only read after something changes, so it can sleep (and stop billing) between edits.
 *
 * Every write to listings clears the cache (see index.ts). A generation counter stops a read
 * that started before a write from caching the old data after the clear.
 */

const TTL_MS = 10 * 60 * 1000; // Safety net for changes made outside this API (seeds, SQL)
const MAX_ENTRIES = 60;

const store = new Map<string, { at: number; body: unknown }>();
let generation = 0;

/** Stable key for a request, ignoring the site's cache-busting `_t` parameter */
export function cacheKey(prefix: string, query: Record<string, unknown> = {}): string {
  const params = Object.entries(query)
    .filter(([key, value]) => key !== '_t' && value !== undefined)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${String(value)}`)
    .join('&');
  return `${prefix}?${params}`;
}

export function currentGeneration(): number {
  return generation;
}

export function getCached<T>(key: string): T | undefined {
  const hit = store.get(key);
  if (!hit) return undefined;
  if (Date.now() - hit.at > TTL_MS) {
    store.delete(key);
    return undefined;
  }
  return hit.body as T;
}

/** Stores `body` unless listings changed since the request began (`startedAt` generation) */
export function setCached(key: string, body: unknown, startedAt: number): void {
  if (startedAt !== generation) return;
  store.delete(key);
  store.set(key, { at: Date.now(), body });
  if (store.size > MAX_ENTRIES) store.delete(store.keys().next().value as string);
}

export function clearListingCache(): void {
  generation += 1;
  store.clear();
}
