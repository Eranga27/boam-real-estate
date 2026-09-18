/**
 * BOAM Real Estates — Resilient Backend API Client
 * 
 * Provides fail-safe property data fetching with:
 * 1. Automatic multi-endpoint fallback (Next.js proxy rewrite -> Direct Render backend).
 * 2. Extended timeout (25s) to safely absorb Render free-tier container cold starts.
 * 3. Client-side Stale-While-Revalidate caching (sessionStorage / localStorage) for instant loads.
 * 4. Cache-busting mechanism for instant synchronization when listings are modified via the Admin Portal.
 */

export const PRODUCTION_BACKEND_URL = 'https://boam-real-estate.onrender.com';

const CACHE_KEY = 'boam_properties_cache_v2';
const CACHE_TIMESTAMP_KEY = 'boam_properties_cache_time_v2';

export function getBaseApiUrl(): string {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    // In browser, use relative path so Next.js rewrites can proxy without CORS issues
    return '';
  }
  return PRODUCTION_BACKEND_URL;
}

/**
 * Invalidate the client-side properties cache.
 * Call this whenever an admin creates, updates, or deletes a property.
 */
export function invalidatePropertiesCache(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(CACHE_KEY);
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
    sessionStorage.removeItem(CACHE_KEY);
    sessionStorage.removeItem(CACHE_TIMESTAMP_KEY);
    // Dispatch a custom event so any open tabs / listeners update immediately
    window.dispatchEvent(new CustomEvent('boam:properties_invalidated'));
  } catch {
    // Ignore storage restrictions
  }
}

/**
 * Retrieve cached properties if available (for instant first-paint).
 */
export function getCachedProperties(): any[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch {
    // Ignore parse error
  }
  return null;
}

/**
 * Save fresh properties to cache.
 */
export function setCachedProperties(data: any[]): void {
  if (typeof window === 'undefined' || !Array.isArray(data) || data.length === 0) return;
  try {
    const serialized = JSON.stringify(data);
    sessionStorage.setItem(CACHE_KEY, serialized);
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_KEY, serialized);
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Storage quota or restriction
  }
}

/**
 * Fetch a URL with an AbortSignal timeout.
 */
async function fetchWithTimeout(url: string, timeoutMs: number, init: RequestInit = {}): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...init,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resilient multi-endpoint fetch for properties:
 * Tries the primary configured endpoint, and falls back to direct production backend
 * if the primary fails, returns a non-200 status, or times out.
 */
export async function fetchLivePropertiesList(limit = 100): Promise<any[]> {
  const query = `limit=${limit}&sort=newest&_t=${Date.now()}`;
  const primaryBase = getBaseApiUrl();

  const candidates: string[] = [];
  if (primaryBase) {
    candidates.push(`${primaryBase}/api/v1/properties?${query}`);
  } else {
    // In browser with empty primaryBase, candidate 1 is relative
    candidates.push(`/api/v1/properties?${query}`);
  }

  // Ensure direct production backend is always in the candidates list
  const directUrl = `${PRODUCTION_BACKEND_URL}/api/v1/properties?${query}`;
  if (!candidates.includes(directUrl)) {
    candidates.push(directUrl);
  }

  for (const url of candidates) {
    try {
      // 25-second timeout to allow Render container to wake up from cold sleep
      const res = await fetchWithTimeout(url, 25000, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          setCachedProperties(json.data);
          return json.data;
        }
      }
    } catch {
      // Try next candidate
      continue;
    }
  }

  throw new Error('All property API endpoints failed or timed out');
}

/**
 * Fetch a single property by ID with live database priority and fallback.
 */
export async function fetchLivePropertyById(id: string): Promise<any | null> {
  const primaryBase = getBaseApiUrl();
  const candidates: string[] = [];

  if (primaryBase) {
    candidates.push(`${primaryBase}/api/v1/properties/${encodeURIComponent(id)}`);
  } else {
    candidates.push(`/api/v1/properties/${encodeURIComponent(id)}`);
  }

  const directUrl = `${PRODUCTION_BACKEND_URL}/api/v1/properties/${encodeURIComponent(id)}`;
  if (!candidates.includes(directUrl)) {
    candidates.push(directUrl);
  }

  for (const url of candidates) {
    try {
      const res = await fetchWithTimeout(url, 20000, {
        headers: { 'Accept': 'application/json' },
        cache: 'no-store',
      });

      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          return json.data;
        }
      }
    } catch {
      continue;
    }
  }

  return null;
}
