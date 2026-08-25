/**
 * BOAM Real Estates — Centralized Site & Production URL Helpers
 */

/**
 * Returns the base production or local site URL without trailing slashes.
 */
export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/+$/, '');
  }
  return 'https://boamrealestates.com';
}

/**
 * Returns the canonical URL for a specific property listing.
 */
export function getPropertyUrl(id: string): string {
  const base = getSiteUrl();
  return `${base}/properties/${encodeURIComponent(id)}`;
}

/**
 * Returns an absolute URL for Open Graph & Twitter Card images.
 * Safe fallback ensured if image path is missing or invalid.
 */
export function getOgImageUrl(imagePath?: string | null): string {
  const base = getSiteUrl();
  if (!imagePath) {
    return `${base}/images/hero-bg.jpg`; // High quality BOAM luxury hero fallback
  }
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${base}${cleanPath}`;
}

/**
 * Global Site SEO Constants
 */
export const SITE_SEO = {
  siteName: 'BOAM Real Estates',
  defaultTitle: 'BOAM Real Estates | Property in Sri Lanka',
  titleTemplate: '%s | BOAM Real Estates',
  description:
    'Discover luxury houses, apartments, villas and prime land opportunities across Sri Lanka with BOAM Real Estates.',
  contactPhone: '+94 777 80 1470',
  contactEmail: 'anilbwt26@yahoo.com',
  whatsappNumber: '94777801470',
  address: 'No. 326, George E. De Silva Mawatha, Kandy, Sri Lanka',
};
