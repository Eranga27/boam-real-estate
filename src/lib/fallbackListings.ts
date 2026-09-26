import { properties } from '@/data/properties';

/**
 * The listings bundled with the site, in the live API's row shape. Shown only when the
 * backend can't be reached and the visitor has nothing cached, so pages never say
 * "0 properties" during an outage. Loaded with a dynamic import, so it stays out of the
 * normal page bundle. Listings added through the admin panel since this dataset was last
 * updated won't be in it.
 */
export function getBundledListings(): any[] {
  return properties.map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    propertyType: p.type,
    saleOrRent: p.listingType === 'rent' ? 'Rent' : 'Sale',
    price: p.price,
    pricePerPerch: p.pricePerPerch ?? null,
    city: p.city,
    district: p.district,
    address: p.address,
    latitude: p.lat,
    longitude: p.lng,
    bedrooms: p.beds || null,
    bathrooms: p.baths || null,
    parking: p.parking || null,
    landSize: p.landSize || null,
    landUnit: p.landUnit || 'perches',
    houseSize: p.houseSize || null,
    images: p.images,
    video: p.video ?? null,
    negotiable: p.negotiable,
    isFeatured: p.featured,
    status: 'PUBLISHED',
  }));
}
