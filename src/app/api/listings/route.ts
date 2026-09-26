import { fetchLivePropertiesList } from '@/lib/api';

/**
 * Public listings for the browser. Same data as the backend list endpoint, but with inline
 * Base64 photos swapped for cacheable image URLs, so the page downloads kilobytes instead of
 * megabytes. Not cached, so admin edits show up on the next refresh.
 */

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function GET(request: Request) {
  const requested = Number.parseInt(new URL(request.url).searchParams.get('limit') || '100', 10);
  const limit = Number.isFinite(requested) ? Math.min(Math.max(requested, 1), 100) : 100;

  try {
    // Longer than page renders allow, so a waking backend can still answer
    const data = await fetchLivePropertiesList(limit, 25_000);
    return Response.json(
      { success: true, count: data.length, data },
      { headers: { 'Cache-Control': 'no-store' } }
    );
  } catch {
    return Response.json(
      { success: false, message: 'Listings are temporarily unavailable' },
      { status: 503, headers: { 'Cache-Control': 'no-store' } }
    );
  }
}
