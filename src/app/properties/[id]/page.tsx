import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { properties as staticProperties } from '@/data/properties';
import { getPropertyUrl, getOgImageUrl, SITE_SEO } from '@/lib/site';
import { fetchLivePropertiesList, fetchLivePropertyById } from '@/lib/api';
import { pickSimilar, toListing, toListingDetail, type Listing, type ListingDetail } from '@/lib/listings';
import { descriptionExcerpt } from '@/lib/description';
import PropertyDetailsClient from './PropertyDetailsClient';

// Enable Next.js ISR (Incremental Static Regeneration) for instant edge loading
export const revalidate = 60;

// No listings are pre-built at deploy time (keeps builds fast when Render is cold);
// each detail page is rendered on its first visit, then cached and revalidated like ISR
export async function generateStaticParams() {
  return [];
}

interface Props {
  params: { id: string };
}

// Deduplicate server-side fetch calls between generateMetadata and PropertyDetailsPage
const getCachedPropertyById = cache(async (id: string) => {
  return fetchLivePropertyById(id);
});

/**
 * Live listing first, so admin edits show. The bundled dataset is only a stand-in while the
 * backend is unreachable: a listing the backend reports missing (deleted) is `gone`.
 */
async function loadListing(id: string): Promise<{ listing: ListingDetail | null; gone: boolean }> {
  try {
    const live = await getCachedPropertyById(id);
    return live ? { listing: toListingDetail(live), gone: false } : { listing: null, gone: true };
  } catch (err) {
    console.error('Failed fetching dynamic property details from API', err);
  }
  const staticMatch = staticProperties.find((p) => p.id === id);
  return { listing: staticMatch ? toListingDetail(staticMatch) : null, gone: false };
}

async function loadAllListings(): Promise<Listing[]> {
  try {
    const live = await fetchLivePropertiesList(100);
    if (live.length > 0) return live.map(toListing);
  } catch {
    // Backend cold or unreachable: suggest from the bundled dataset instead
  }
  return staticProperties.map(toListing);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { listing } = await loadListing(params.id);

  if (!listing) {
    return {
      title: 'Property Not Found',
      description: 'The requested property listing was not found or is no longer available.',
    };
  }

  const title = listing.title;
  const summary = descriptionExcerpt(listing.description, 150);
  const description =
    summary ||
    `Explore ${listing.title} in ${listing.city}, ${listing.district}. View detailed property specifications, images, location and contact BOAM Real Estates.`;
  const canonical = getPropertyUrl(listing.id);
  const mainImage = getOgImageUrl(listing.images[0]);

  return {
    title,
    description,
    // Drafts and listings awaiting approval can be opened by link, but stay out of search engines
    ...(listing.status !== 'PUBLISHED' ? { robots: { index: false, follow: false } } : {}),
    alternates: {
      canonical,
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      siteName: SITE_SEO.siteName,
      images: [
        {
          url: mainImage,
          width: 1200,
          height: 630,
          alt: listing.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [mainImage],
    },
  };
}

export default async function PropertyDetailsPage({ params }: Props) {
  const { id } = params;
  const [{ listing, gone }, all] = await Promise.all([loadListing(id), loadAllListings()]);

  if (gone) notFound();
  if (!listing) {
    return <PropertyDetailsClient listing={null} similar={[]} propertyId={id} />;
  }

  const similar = pickSimilar(all, listing, 3);
  return <PropertyDetailsClient listing={listing} similar={similar} />;
}
