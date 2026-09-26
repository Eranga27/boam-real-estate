/**
 * Listings uploaded without Cloudinary store their photos as Base64 data URIs. Sent inline,
 * those make list and detail payloads (and the HTML that embeds them) megabytes large, so
 * pages that render listings swap each data URI for a small URL served by
 * /api/listing-image/[id]/[index], which the CDN caches per listing version.
 * Plain module so server pages, route handlers and client code can all use it.
 */

/** Changes whenever the listing is edited, so cached image URLs never go stale */
export function listingVersion(p: any): string {
  const stamp = Date.parse(p?.updatedAt || p?.createdAt || '') || 0;
  return stamp.toString(36);
}

export function listingImagePath(id: string, index: number, version: string): string {
  return `/api/listing-image/${encodeURIComponent(id)}/${index}?v=${version}`;
}

/** Replace inline data URIs in a listing's images with cacheable image URLs */
export function withImageRoutes<T extends { id?: string; images?: string[] }>(p: T): T {
  if (!p || !p.id || !Array.isArray(p.images) || !p.images.some(isDataUri)) return p;
  const version = listingVersion(p);
  return {
    ...p,
    images: p.images.map((src, i) => (isDataUri(src) ? listingImagePath(p.id!, i, version) : src)),
  };
}

function isDataUri(src: unknown): boolean {
  return typeof src === 'string' && src.startsWith('data:');
}

// Widths must be in Next's default deviceSizes/imageSizes, or the optimizer rejects them
export type ImageWidth = 384 | 640 | 828 | 1080 | 1200 | 1920;

/**
 * A resized, re-encoded (AVIF/WebP) copy of a listing photo via Next's image optimizer.
 * Listing photos are phone originals of up to half a megabyte; cards need a fraction of that.
 * Data URIs and unknown hosts are returned unchanged.
 */
export function optimizedImage(src: string | null | undefined, width: ImageWidth, quality = 72): string {
  if (!src) return '';
  // Already an optimizer URL (e.g. a card's currentSrc handed to the listing page)
  if (src.startsWith('/_next/image')) return src;
  const local = src.startsWith('/') && !src.startsWith('//');
  if (!local && !src.startsWith('https://res.cloudinary.com/')) return src;
  return `/_next/image?url=${encodeURIComponent(src)}&w=${width}&q=${quality}`;
}

export function optimizedSrcSet(src: string | null | undefined, widths: ImageWidth[], quality = 72): string | undefined {
  if (!src) return undefined;
  const first = optimizedImage(src, widths[0], quality);
  if (first === src) return undefined;
  return widths.map((w) => `${optimizedImage(src, w, quality)} ${w}w`).join(', ');
}
