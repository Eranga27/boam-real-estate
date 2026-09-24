import type { Metadata } from 'next';
import { getSiteUrl, SITE_SEO, getOgImageUrl } from '@/lib/site';
import { fetchLivePropertiesList } from '@/lib/api';
import SearchClient from './SearchClient';

// Enable Next.js ISR (Incremental Static Regeneration) for instant edge page loads
export const revalidate = 60;

const canonicalUrl = `${getSiteUrl()}/search`;

export const metadata: Metadata = {
  title: 'Search Properties',
  description:
    'Search and filter houses, apartments, commercial properties, and land for sale and rent in Sri Lanka.',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    type: 'website',
    url: canonicalUrl,
    title: 'Search Properties',
    description:
      'Search and filter houses, apartments, commercial properties, and land for sale and rent in Sri Lanka.',
    siteName: SITE_SEO.siteName,
    images: [
      {
        url: getOgImageUrl('/images/hero-bg.jpg'),
        width: 1200,
        height: 630,
        alt: 'BOAM Real Estates Property Search',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Search Properties',
    description:
      'Search and filter houses, apartments, commercial properties, and land for sale and rent in Sri Lanka.',
    images: [getOgImageUrl('/images/hero-bg.jpg')],
  },
};

export default async function SearchPage() {
  let initialProperties: any[] = [];
  try {
    initialProperties = await fetchLivePropertiesList(100);
  } catch (err) {
    // If server fetch times out or backend is cold, client-side SWR takes over seamlessly
    console.warn('Server pre-fetch skipped (client SWR will fetch):', err);
  }

  return <SearchClient initialProperties={initialProperties} />;
}
