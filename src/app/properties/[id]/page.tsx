import type { Metadata } from 'next';
import { cache } from 'react';
import { properties as staticProperties, getSimilarProperties } from '@/data/properties';
import { getPropertyUrl, getOgImageUrl, SITE_SEO, getSiteUrl } from '@/lib/site';
import { fetchLivePropertyById } from '@/lib/api';
import PropertyDetailsClient from './PropertyDetailsClient';

// Enable Next.js ISR (Incremental Static Regeneration) for instant edge loading
export const revalidate = 60;

interface Props {
  params: { id: string };
}

// Deduplicate server-side fetch calls between generateMetadata and PropertyDetailsPage
const getCachedPropertyById = cache(async (id: string) => {
  return fetchLivePropertyById(id);
});

function staticToApi(p: any): any {
  return {
    id: p.id,
    title: p.title,
    propertyType: p.type,
    saleOrRent: p.listingType === 'sale' ? 'Sale' : 'Rent',
    price: p.price,
    pricePerPerch: p.pricePerPerch,
    video: p.video,
    negotiable: p.negotiable,
    city: p.city,
    district: p.district,
    address: p.address,
    latitude: p.lat,
    longitude: p.lng,
    bedrooms: p.beds || null,
    bathrooms: p.baths || null,
    beds: p.beds || 0,
    baths: p.baths || 0,
    parking: p.parking || null,
    landSize: p.landSize || null,
    landUnit: p.landUnit || 'perches',
    houseSize: p.houseSize || null,
    yearBuilt: p.yearBuilt || null,
    description: p.description,
    amenities: p.amenities,
    nearbyFacilities: p.nearby,
    images: p.images,
    listedDaysAgo: p.listedDaysAgo,
    featured: p.featured,
    user: { fullName: 'BOAM Real Estates' },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  let localMatch: any = null;

  // 1. Prioritize live database details so amended titles, images and details appear
  try {
    const liveProperty = await getCachedPropertyById(id);
    if (liveProperty) {
      localMatch = {
        id: liveProperty.id,
        title: liveProperty.title,
        city: liveProperty.city,
        district: liveProperty.district,
        images: liveProperty.images || [],
      };
    }
  } catch (err) {
    console.error('Failed fetching dynamic metadata from API:', err);
  }

  // 2. Fall back to static dataset only if live API returns nothing / offline
  if (!localMatch) {
    const staticMatch = staticProperties.find((p) => p.id === id);
    if (staticMatch) {
      localMatch = {
        id: staticMatch.id,
        title: staticMatch.title,
        city: staticMatch.city,
        district: staticMatch.district,
        images: staticMatch.images || [],
      };
    }
  }

  if (!localMatch) {
    return {
      title: 'Property Not Found',
      description: 'The requested property listing was not found or is no longer available.',
    };
  }

  const title = localMatch.title;
  const description = `Explore ${localMatch.title} in ${localMatch.city}, ${localMatch.district}. View detailed property specifications, images, location and contact BOAM Real Estates.`;
  const canonical = getPropertyUrl(localMatch.id);
  const mainImage = getOgImageUrl(localMatch.images?.[0]);

  return {
    title,
    description,
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
          alt: localMatch.title,
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
  let propertyData = null;
  let similar: any[] = [];

  // 1. Check live API first so that any amended property displays live database content
  try {
    const p = await getCachedPropertyById(id);
    if (p) {
      propertyData = {
        id: p.id,
        title: p.title,
        propertyType: p.propertyType,
        saleOrRent: p.saleOrRent || 'Sale',
        price: p.price,
        pricePerPerch: p.pricePerPerch,
        video: p.video,
        negotiable: p.negotiable,
        city: p.city,
        district: p.district,
        address: p.address,
        latitude: p.latitude,
        longitude: p.longitude,
        bedrooms: p.bedrooms || null,
        bathrooms: p.bathrooms || null,
        beds: p.bedrooms || 0,
        baths: p.bathrooms || 0,
        parking: p.parking || null,
        landSize: p.landSize || null,
        landUnit: p.landUnit || 'perches',
        houseSize: p.houseSize || null,
        yearBuilt: p.yearBuilt || null,
        description: p.description,
        amenities: p.amenities || [],
        nearbyFacilities: p.nearbyFacilities || [],
        images: p.images || [],
        listedDaysAgo: 'Recently',
        featured: p.isFeatured || false,
        user: p.user || { fullName: 'BOAM Real Estates' },
      };
    }
  } catch (err) {
    console.error('Failed fetching dynamic property details from API', err);
  }

  // 2. Fall back to static dataset if live API does not find the property
  const staticMatch = staticProperties.find((p) => p.id === id);
  if (!propertyData && staticMatch) {
    propertyData = staticToApi(staticMatch);
  }

  // Calculate similar properties
  if (staticMatch) {
    similar = getSimilarProperties(staticMatch, 4).map(staticToApi);
  } else if (propertyData) {
    const dummyRef = {
      id: propertyData.id,
      type: propertyData.propertyType,
      district: propertyData.district,
      price: propertyData.price,
    };
    similar = getSimilarProperties(dummyRef as any, 4).map(staticToApi);
  }

  if (!propertyData) {
    return <PropertyDetailsClient property={null} relatedProperties={[]} propertyId={id} />;
  }

  return (
    <>
      <PropertyDetailsClient property={propertyData} relatedProperties={similar} />
    </>
  );
}
