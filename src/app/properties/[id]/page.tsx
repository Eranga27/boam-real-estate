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
    parking: p.parking || null,
    landSize: p.landSize || null,
    houseSize: p.houseSize || null,
    yearBuilt: p.yearBuilt || null,
    description: p.description,
    amenities: p.amenities,
    nearbyFacilities: p.nearby,
    images: p.images,
    listedDaysAgo: p.listedDaysAgo,
    featured: p.featured,
    contactPhone: '+94 777 80 1470',
    contactEmail: 'anilbwt26@yahoo.com',
    whatsappNumber: '94777801470',
    user: { fullName: 'BOAM Real Estates' },
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = params;
  const localMatch = staticProperties.find((p) => p.id === id);

  if (!localMatch) {
    return {
      title: 'Property Not Found | BOAM Real Estates',
      description: 'The requested property listing was not found or is no longer available.',
    };
  }

  const title = `${localMatch.title} | BOAM Real Estates`;
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

export default function PropertyDetailsPage({ params }: Props) {
  const { id } = params;
  const localMatch = staticProperties.find((p) => p.id === id);

  if (!localMatch) {
    return <PropertyDetailsClient property={null} relatedProperties={[]} />;
  }

  const propertyData = staticToApi(localMatch);
  const similar = getSimilarProperties(localMatch, 4).map(staticToApi);

  const siteUrl = getSiteUrl();
  const canonicalUrl = getPropertyUrl(localMatch.id);
  const mainImage = getOgImageUrl(localMatch.images?.[0]);

  // Structured Data (JSON-LD) for Property & Breadcrumbs
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: siteUrl,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Properties',
        item: `${siteUrl}/search`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: localMatch.type,
        item: `${siteUrl}/search?type=${encodeURIComponent(localMatch.type)}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: localMatch.title,
        item: canonicalUrl,
      },
    ],
  };

  const propertyJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateListing',
    name: localMatch.title,
    description: localMatch.description,
    url: canonicalUrl,
    image: mainImage,
    offers: {
      '@type': 'Offer',
      price: localMatch.price,
      priceCurrency: 'LKR',
      availability: 'https://schema.org/InStock',
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: localMatch.address,
      addressLocality: localMatch.city,
      addressRegion: localMatch.district,
      addressCountry: 'LK',
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(propertyJsonLd) }}
      />
      <PropertyDetailsClient property={propertyData} relatedProperties={similar} />
    </>
  );
}
