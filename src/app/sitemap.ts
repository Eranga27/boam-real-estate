import { MetadataRoute } from 'next';
import { properties as staticProperties } from '@/data/properties';
import { fetchLivePropertiesList } from '@/lib/api';
import { getSiteUrl } from '@/lib/site';

// Rebuilt hourly, so listings added or removed in the admin panel reach search engines
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = getSiteUrl();

  // Static core public pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
  ];

  // Published listings from the live database; the bundled dataset only if it's unreachable
  let listings: { id: string; lastModified: Date }[];
  try {
    // Generous timeout: this runs rarely (build, then hourly), so waiting beats a stale fallback
    const live = await fetchLivePropertiesList(100, 20_000);
    listings = live.map((p: any) => ({
      id: String(p.id),
      lastModified: new Date(p.updatedAt || p.createdAt || Date.now()),
    }));
  } catch {
    listings = staticProperties.map((p) => ({ id: p.id, lastModified: new Date() }));
  }

  const propertyPages: MetadataRoute.Sitemap = listings.map((listing) => ({
    url: `${baseUrl}/properties/${encodeURIComponent(listing.id)}`,
    lastModified: listing.lastModified,
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticPages, ...propertyPages];
}
