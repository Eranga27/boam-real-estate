import { getImageUrl } from '@/lib/format';

/** Shape a live database listing into what PropertyCard expects */
function mapDbToCard(p: any): any {
  const createdTime = p.createdAt ? new Date(p.createdAt).getTime() : Date.now();
  const daysAgo = Math.max(0, Math.floor((Date.now() - createdTime) / (1000 * 3600 * 24)));
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    listingType: p.saleOrRent?.toLowerCase() === 'sale' ? 'sale' : 'rent',
    type: p.propertyType,
    city: p.city,
    district: p.district,
    beds: p.bedrooms || p.beds || 0,
    baths: p.bathrooms || p.baths || 0,
    houseSize: p.houseSize || 0,
    landSize: p.landSize || 0,
    images: (p.images || []).map((img: string) => getImageUrl(img)),
    video: p.video || null,
    listedDaysAgo: daysAgo,
    negotiable: p.negotiable || false,
  };
}

/**
 * Pick the homepage's three featured cards from a live listings array.
 * Falls back to the newest listings when none are marked featured.
 * Plain (non-client) module so both the server page and the client can use it.
 */
export function toFeaturedCards(listings: any[]): any[] {
  const featured = listings.filter((p) => p.isFeatured || p.featured);
  return (featured.length > 0 ? featured : listings).slice(0, 3).map(mapDbToCard);
}
