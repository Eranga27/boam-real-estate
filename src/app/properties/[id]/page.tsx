import type { Metadata } from 'next';
import { properties as staticProperties, getSimilarProperties } from '@/data/properties';
import { getPropertyUrl, getOgImageUrl, SITE_SEO, getSiteUrl } from '@/lib/site';
import PropertyDetailsClient from './PropertyDetailsClient';

interface Props {
  params: { id: string };
}

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
  let localMatch: any = staticProperties.find((p) => p.id === id);

  if (!localMatch) {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://boam-real-estate.onrender.com';
      const res = await fetch(`${apiUrl}/api/v1/properties/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
        localMatch = {
          id: p.id,
          title: p.title,
          city: p.city,
          district: p.district,
          images: p.images || [],
        };
      }
    } catch (err) {
      console.error('Failed fetching dynamic metadata from API:', err);
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

  const localMatch = staticProperties.find((p) => p.id === id);

  if (localMatch) {
    propertyData = staticToApi(localMatch);
    similar = getSimilarProperties(localMatch, 4).map(staticToApi);
  } else {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://boam-real-estate.onrender.com';
      const res = await fetch(`${apiUrl}/api/v1/properties/${id}`, { cache: 'no-store' });
      const data = await res.json();
      if (data.success && data.data) {
        const p = data.data;
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
