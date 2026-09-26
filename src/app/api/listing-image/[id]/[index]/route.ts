import { PRODUCTION_BACKEND_URL } from '@/lib/api';
import { listingVersion } from '@/lib/listingImages';

/**
 * Serves one photo of a listing whose images are stored as Base64 data URIs, as a real
 * image response. URLs carry the listing version (?v=), so the CDN and browsers can keep
 * each response forever; an edited listing gets new URLs.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 20;

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const RECENT_TTL_MS = 60_000;

// One backend fetch per listing when a page requests several of its photos at once
const recent = new Map<string, { at: number; images: Promise<string[] | null> }>();

function backendBase(): string {
  return (process.env.NEXT_PUBLIC_API_URL || PRODUCTION_BACKEND_URL).replace(/\/+$/, '');
}

async function fetchImages(id: string): Promise<string[] | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${backendBase()}/api/v1/properties/${encodeURIComponent(id)}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    return Array.isArray(json?.data?.images) ? json.data.images : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

function loadImages(id: string): Promise<string[] | null> {
  const hit = recent.get(id);
  if (hit && Date.now() - hit.at < RECENT_TTL_MS) return hit.images;

  const images = fetchImages(id).then((result) => {
    if (!result) recent.delete(id);
    return result;
  });
  recent.set(id, { at: Date.now(), images });
  if (recent.size > 50) recent.delete(recent.keys().next().value as string);
  return images;
}

/*
 * Cover photos (index 0) come from the list endpoint, which carries every listing's first
 * photo: one fetch serves a whole results page of thumbnails, where fetching each listing's
 * full record (every photo, megabytes each) took seconds per card on a cold cache.
 */
let coversCache: { at: number; covers: Promise<Map<string, { version: string; src: string }> | null> } | null = null;

async function fetchCovers(): Promise<Map<string, { version: string; src: string }> | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 15_000);
  try {
    const res = await fetch(`${backendBase()}/api/v1/properties?limit=100&sort=newest`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!Array.isArray(json?.data)) return null;
    const covers = new Map<string, { version: string; src: string }>();
    for (const p of json.data) {
      if (p?.id && typeof p.images?.[0] === 'string') {
        covers.set(String(p.id), { version: listingVersion(p), src: p.images[0] });
      }
    }
    return covers;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

async function loadCover(id: string, version: string | null): Promise<string | null> {
  if (!coversCache || Date.now() - coversCache.at > RECENT_TTL_MS) {
    coversCache = { at: Date.now(), covers: fetchCovers() };
  }
  const covers = await coversCache.covers;
  if (!covers) coversCache = null;
  const cover = covers?.get(id);
  // A version mismatch means the listing changed since the list was fetched
  return cover && (!version || cover.version === version) ? cover.src : null;
}

function notFound(status = 404): Response {
  return new Response(null, { status, headers: { 'Cache-Control': 'no-store' } });
}

export async function GET(request: Request, { params }: { params: { id: string; index: string } }) {
  const index = Number.parseInt(params.index, 10);
  if (!params.id || !Number.isInteger(index) || index < 0 || index > 200) return notFound();

  const version = new URL(request.url).searchParams.get('v');
  let src: string | null | undefined = index === 0 ? await loadCover(params.id, version) : null;
  if (!src) {
    const images = await loadImages(params.id);
    if (!images) return notFound(503);
    src = images[index];
  }
  if (typeof src !== 'string' || !src) return notFound();

  // Hosted photos (Cloudinary, /uploads) are already cacheable URLs
  if (!src.startsWith('data:')) {
    return Response.redirect(new URL(src, request.url), 307);
  }

  const match = /^data:([^;,]+)(;base64)?,/.exec(src);
  const type = match?.[1]?.toLowerCase();
  if (!match || !type || !ALLOWED_TYPES.has(type)) return notFound(415);

  const payload = src.slice(match[0].length);
  const body = match[2] ? Buffer.from(payload, 'base64') : Buffer.from(decodeURIComponent(payload));
  const versioned = !!version;

  return new Response(body, {
    headers: {
      'Content-Type': type === 'image/jpg' ? 'image/jpeg' : type,
      'Content-Length': String(body.length),
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': versioned
        ? 'public, max-age=31536000, s-maxage=31536000, immutable'
        : 'public, max-age=300, s-maxage=3600',
    },
  });
}
