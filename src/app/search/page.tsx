import type { Metadata } from 'next';
import { getSiteUrl, SITE_SEO, getOgImageUrl } from '@/lib/site';
import SearchClient from './SearchClient';

const canonicalUrl = `${getSiteUrl()}/search`;

export const metadata: Metadata = {
  title: 'Search Properties | BOAM Real Estates',
  description:
    'Search and filter houses, apartments, commercial properties, and land for sale and rent in Sri Lanka.',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    type: 'website',
    url: canonicalUrl,
    title: 'Search Properties | BOAM Real Estates',
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
    title: 'Search Properties | BOAM Real Estates',
    description:
      'Search and filter houses, apartments, commercial properties, and land for sale and rent in Sri Lanka.',
    images: [getOgImageUrl('/images/hero-bg.jpg')],
  },
};

export default function SearchPage() {
  return <SearchClient />;
}
