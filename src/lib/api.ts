/**
 * BOAM Real Estates — High-Performance Resilient Backend API Client
 * 
 * Provides fail-safe property data fetching with:
 * 1. Automatic multi-endpoint fallback (Next.js proxy rewrite -> Direct Render backend).
 * 2. Next.js ISR & edge cache headers for lightning-fast server pre-renders.
 * 3. In-memory runtime cache for 0ms client-side page transitions.
 * 4. Storage-safe payload slimming preventing browser localStorage QuotaExceededError.
 * 5. Concurrent in-flight request deduplication for property detail queries.
 * 6. Cache-busting mechanism for instant synchronization when listings are modified via the Admin Portal.
 */

export const PRODUCTION_BACKEND_URL = 'https://boam-real-estate.onrender.com';

const CACHE_KEY = 'boam_properties_cache_v3';
const CACHE_TIMESTAMP_KEY = 'boam_properties_cache_time_v3';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes freshness window

// In-memory runtime cache for instant zero-latency transitions
let memoryPropertiesCache: any[] | null = null;
let memoryCacheTimestamp = 0;
const memoryDetailCache = new Map<string, { data: any; timestamp: number }>();
const inFlightDetailRequests = new Map<string, Promise<any | null>>();

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
  memoryPropertiesCache = null;
  memoryCacheTimestamp = 0;
  memoryDetailCache.clear();
  inFlightDetailRequests.clear();

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
 * Create a lightweight representation of property listings for client storage.
 * Keeps all search/filtering/card fields while trimming multi-megabyte payloads
 * so that localStorage/sessionStorage quotas (~5MB) are never exceeded.
 */
function toSlimListing(p: any): any {
  return {
    id: p.id,
    title: p.title,
    propertyType: p.propertyType || p.type,
    saleOrRent: p.saleOrRent || 'Sale',
    price: p.price,
    pricePerPerch: p.pricePerPerch || null,
    city: p.city,
    district: p.district,
    address: p.address || p.city,
    latitude: p.latitude || null,
    longitude: p.longitude || null,
    bedrooms: p.bedrooms || p.beds || null,
    bathrooms: p.bathrooms || p.baths || null,
    beds: p.bedrooms || p.beds || 0,
    baths: p.bathrooms || p.baths || 0,
    parking: p.parking || null,
    landSize: p.landSize || null,
    landUnit: p.landUnit || 'perches',
    houseSize: p.houseSize || null,
    // Keep only the primary thumbnail image for cards to ensure it fits safely in storage
    images: Array.isArray(p.images) && p.images.length > 0 ? [p.images[0]] : [],
    video: p.video || null,
    negotiable: p.negotiable || false,
    featured: p.isFeatured || p.featured || false,
    isFeatured: p.isFeatured || p.featured || false,
    createdAt: p.createdAt || new Date().toISOString(),
  };
}

/**
 * Retrieve cached properties if available (for instant first-paint).
 */
export function getCachedProperties(): any[] | null {
  // 1. Instant in-memory cache check (0.0ms)
  if (memoryPropertiesCache && memoryPropertiesCache.length > 0) {
    return memoryPropertiesCache;
  }

  if (typeof window === 'undefined') return null;

  // 2. Browser storage check
  try {
    const raw = sessionStorage.getItem(CACHE_KEY) || localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      memoryPropertiesCache = parsed;
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
  if (!Array.isArray(data) || data.length === 0) return;

  // Save to memory cache immediately
  memoryPropertiesCache = data;
  memoryCacheTimestamp = Date.now();

  if (typeof window === 'undefined') return;

  try {
    const slimListings = data.map(toSlimListing);
    const serialized = JSON.stringify(slimListings);
    sessionStorage.setItem(CACHE_KEY, serialized);
    sessionStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    localStorage.setItem(CACHE_KEY, serialized);
    localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch {
    // Gracefully handle storage quota
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

  const isServer = typeof window === 'undefined';
  const fetchOptions: any = {
    headers: { Accept: 'application/json' },
    ...(isServer
      ? { next: { revalidate: 60, tags: ['properties'] } }
      : { cache: 'no-store' }),
  };

  for (const url of candidates) {
    try {
      // 25-second timeout to allow Render container to wake up from cold sleep
      const res = await fetchWithTimeout(url, 25000, fetchOptions);

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
 * Fetch a single property by ID with live database priority, fallback,
 * in-memory caching, and request deduplication.
 */
export async function fetchLivePropertyById(id: string): Promise<any | null> {
  // 1. Check memory cache for instant response
  const cached = memoryDetailCache.get(id);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    return cached.data;
  }

  // 2. Deduplicate in-flight requests (prevents duplicate metadata + page fetch)
  if (inFlightDetailRequests.has(id)) {
    return inFlightDetailRequests.get(id)!;
  }

  const fetchPromise = (async () => {
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

    const isServer = typeof window === 'undefined';
    const fetchOptions: any = {
      headers: { Accept: 'application/json' },
      ...(isServer
        ? { next: { revalidate: 60, tags: [`property-${id}`, 'properties'] } }
        : { cache: 'no-store' }),
    };

    for (const url of candidates) {
      try {
        const res = await fetchWithTimeout(url, 20000, fetchOptions);

        if (res.ok) {
          const json = await res.json();
          if (json.success && json.data) {
            memoryDetailCache.set(id, { data: json.data, timestamp: Date.now() });
            return json.data;
          }
        }
      } catch {
        continue;
      }
    }

    return null;
  })().finally(() => {
    inFlightDetailRequests.delete(id);
  });

  inFlightDetailRequests.set(id, fetchPromise);
  return fetchPromise;
}
