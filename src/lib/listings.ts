import { getImageUrl } from './format';
import { descriptionExcerpt } from './description';

/**
 * One listing shape for the search results, similar-listing rails and anything else that
 * shows listing cards, built from live API rows (or the static dataset). Plain module so
 * server pages and client components can both use it.
 */
export interface Listing {
  id: string;
  title: string;
  propertyType: string;
  saleOrRent: 'Sale' | 'Rent';
  price: number;
  pricePerPerch: string | null;
  city: string;
  district: string;
  address: string;
  lat: number | null;
  lng: number | null;
  beds: number;
  baths: number;
  houseSize: number;
  landSize: number;
  landUnit: string;
  /** Primary photo, if any; cards always prefer it over the video */
  image: string | null;
  /** Only set when the listing has no photo and its video is fit to show on a card */
  video: string | null;
  negotiable: boolean;
  featured: boolean;
  /** Milliseconds; the later of created/updated, used for "Newest first" */
  listedAt: number;
  /** Listed (created) within the last two weeks */
  isNew: boolean;
  /** First lines of the description as plain text */
  excerpt: string;
}

// Listings whose uploaded video is a walkthrough that shouldn't stand in for a photo
const VIDEO_HIDDEN_IDS = new Set(['ekala-house', 'katukithula-nuwaraeliya-land']);

const NEW_WINDOW_MS = 14 * 24 * 3600 * 1000;

/** Whether a listing's video may be shown (as a stand-in or as a tour) */
export function canShowVideo(id: string, video?: string | null): boolean {
  return !!video && !VIDEO_HIDDEN_IDS.has(id);
}

function time(value: unknown): number {
  const t = typeof value === 'string' || typeof value === 'number' ? new Date(value).getTime() : NaN;
  return Number.isFinite(t) ? t : 0;
}

export function toListing(p: any): Listing {
  const createdAt = time(p.createdAt);
  const listedAt = Math.max(createdAt, time(p.updatedAt));
  const firstImage = Array.isArray(p.images) && p.images.length > 0 ? p.images[0] : null;
  const saleOrRent = String(p.saleOrRent || (p.listingType === 'rent' ? 'Rent' : 'Sale'));
  const lat = Number(p.latitude ?? p.lat);
  const lng = Number(p.longitude ?? p.lng);

  return {
    id: String(p.id),
    title: p.title || 'Untitled property',
    propertyType: p.propertyType || p.type || 'Property',
    saleOrRent: saleOrRent.toLowerCase() === 'rent' ? 'Rent' : 'Sale',
    price: Number(p.price) || 0,
    pricePerPerch: p.pricePerPerch || null,
    city: p.city || '',
    district: p.district || '',
    address: p.address || p.city || '',
    lat: Number.isFinite(lat) && lat !== 0 ? lat : null,
    lng: Number.isFinite(lng) && lng !== 0 ? lng : null,
    beds: Number(p.bedrooms || p.beds) || 0,
    baths: Number(p.bathrooms || p.baths) || 0,
    houseSize: Number(p.houseSize) || 0,
    landSize: Number(p.landSize) || 0,
    landUnit: p.landUnit || 'perches',
    image: firstImage ? getImageUrl(firstImage) : null,
    video: !firstImage && canShowVideo(String(p.id), p.video) ? getImageUrl(p.video) : null,
    negotiable: !!p.negotiable,
    featured: !!(p.isFeatured || p.featured),
    listedAt,
    isNew: createdAt > 0 && Date.now() - createdAt < NEW_WINDOW_MS,
    excerpt: typeof p.description === 'string' ? descriptionExcerpt(p.description) : '',
  };
}

/** "Colombo 05, Colombo" without repeating a city that is also the district */
export function formatPlace(city: string, district: string): string {
  if (!district || city.toLowerCase().includes(district.toLowerCase())) return city || district;
  if (!city) return district;
  return `${city}, ${district}`;
}

/** Land size with its unit, e.g. "40 perches" or "2.5 acres" */
export function formatLand(size: number, unit: string): string {
  const label = unit === 'acres' ? (size === 1 ? 'acre' : 'acres') : size === 1 ? 'perch' : 'perches';
  return `${size.toLocaleString('en-LK')} ${label}`;
}

/**
 * Listings most like `ref`: same type first, then same district, then nearest in price.
 */
export function pickSimilar(
  all: Listing[],
  ref: { id: string; propertyType?: string; district?: string; price?: number },
  count = 3
): Listing[] {
  const price = ref.price || 0;
  const score = (l: Listing) =>
    (l.propertyType === ref.propertyType ? 0 : 2) +
    (ref.district && l.district === ref.district ? 0 : 1) +
    (price > 0 ? Math.min(1, Math.abs(l.price - price) / price) : 0);

  return all
    .filter((l) => l.id !== ref.id)
    .map((l) => ({ l, s: score(l) }))
    .sort((a, b) => a.s - b.s)
    .slice(0, count)
    .map(({ l }) => l);
}

/** Everything the listing page shows */
export interface ListingDetail extends Listing {
  images: string[];
  /** Walkthrough video, when it is fit to show */
  tour: string | null;
  description: string;
  amenities: string[];
  nearby: string[];
  parking: number;
  yearBuilt: number;
  /** PUBLISHED, PENDING_APPROVAL, DRAFT or REJECTED (bundled listings count as published) */
  status: string;
}

export function toListingDetail(p: any): ListingDetail {
  const base = toListing(p);
  const images: string[] = Array.isArray(p.images) ? p.images.filter(Boolean).map((src: string) => getImageUrl(src)) : [];
  return {
    ...base,
    images,
    tour: canShowVideo(base.id, p.video) ? getImageUrl(p.video) : null,
    description: typeof p.description === 'string' ? p.description : '',
    amenities: Array.isArray(p.amenities) ? p.amenities.filter(Boolean) : [],
    nearby: Array.isArray(p.nearbyFacilities) ? p.nearbyFacilities.filter(Boolean) : Array.isArray(p.nearby) ? p.nearby.filter(Boolean) : [],
    parking: Number(p.parking) || 0,
    yearBuilt: Number(p.yearBuilt) || 0,
    status: typeof p.status === 'string' ? p.status : 'PUBLISHED',
  };
}
