import type { Metadata } from 'next';
import { getSiteUrl, SITE_SEO, getOgImageUrl } from '@/lib/site';
import PropertyRequestClient from './PropertyRequestClient';

const canonicalUrl = `${getSiteUrl()}/request`;

export const metadata: Metadata = {
  title: 'Request a Property | BOAM Real-Estates',
  description:
    'Can’t find the property you are looking for? Submit a buyer request for a house or land in Sri Lanka and our team will match your needs.',
  alternates: {
    canonical: canonicalUrl,
  },
  openGraph: {
    type: 'website',
    url: canonicalUrl,
    title: 'Request a Property | BOAM Real-Estates',
    description:
      'Submit a buyer request for a house or land in Sri Lanka and our team will match your exact requirements.',
    siteName: SITE_SEO.siteName,
    images: [
      {
        url: getOgImageUrl('/images/hero-bg.jpg'),
        width: 1200,
        height: 630,
        alt: 'BOAM Real Estates Property Request',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Request a Property | BOAM Real-Estates',
    description:
      'Submit a buyer request for a house or land in Sri Lanka and our team will match your exact requirements.',
    images: [getOgImageUrl('/images/hero-bg.jpg')],
  },
};

export default function RequestPropertyPage() {
  return <PropertyRequestClient />;
}
