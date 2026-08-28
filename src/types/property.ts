export type ListingType = 'sale' | 'rent';

export type PropertyType = 'House' | 'Apartment' | 'Condo' | 'Land' | 'Commercial';

export interface Property {
  id: string;
  title: string;
  type: PropertyType;
  listingType: ListingType;
  /** Price in LKR. For rentals this is the monthly rent. */
  price: number;
  negotiable: boolean;
  city: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  beds: number;
  baths: number;
  parking: number;
  /** perches (Sri Lankan land unit) */
  landSize: number;
  /** 'perches' or 'acres' */
  landUnit?: 'perches' | 'acres' | string;
  /** square feet */
  houseSize: number;
  yearBuilt: number;
  description: string;
  amenities: string[];
  nearby: string[];
  images: string[];
  listedDaysAgo: number;
  featured: boolean;
  /** Price per perch or per unit text e.g. "Rs. 2.5 Mn per perch" */
  pricePerPerch?: string;
  /** Optional video URL or path e.g. "/uploads/ekala1vid.mp4" */
  video?: string;
}

export interface LocationTile {
  city: string;
  listings: number;
  image: string;
  blurb: string;
}