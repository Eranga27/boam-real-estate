import type { Listing } from '@/lib/listings';

/**
 * Search filters, their URL form (so a search can be shared or bookmarked), and the
 * filtering/sorting applied to listings. Plain module, no React.
 */

export type SortKey = 'newest' | 'price_asc' | 'price_desc' | 'land_desc';
export type ViewMode = 'grid' | 'map';

export interface SearchState {
  location: string;
  type: string;
  purpose: '' | 'Sale' | 'Rent';
  /** LKR */
  minPrice: number | null;
  maxPrice: number | null;
  beds: number;
  /** Minimum land size in perches */
  land: number;
  /** Only the visitor's shortlisted listings */
  saved: boolean;
  sort: SortKey;
  view: ViewMode;
}

export const DEFAULT_STATE: SearchState = {
  location: '',
  type: '',
  purpose: '',
  minPrice: null,
  maxPrice: null,
  beds: 0,
  land: 0,
  saved: false,
  sort: 'newest',
  view: 'grid',
};

const MN = 1_000_000;

export const PRICE_PRESETS: { key: string; label: string; min: number | null; max: number | null }[] = [
  { key: 'u25', label: 'Under 25 Mn', min: null, max: 25 * MN },
  { key: '25-50', label: '25 – 50 Mn', min: 25 * MN, max: 50 * MN },
  { key: '50-100', label: '50 – 100 Mn', min: 50 * MN, max: 100 * MN },
  { key: '100+', label: '100 Mn +', min: 100 * MN, max: null },
];

export const BED_OPTIONS = [0, 1, 2, 3, 4, 5];

export const LAND_OPTIONS: { value: number; label: string }[] = [
  { value: 0, label: 'Any' },
  { value: 10, label: '10+ perches' },
  { value: 20, label: '20+ perches' },
  { value: 40, label: '40+ perches' },
  { value: 160, label: '1+ acre' },
];

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'land_desc', label: 'Largest land' },
];

const PERCHES_PER_ACRE = 160;

function landInPerches(l: Listing): number {
  return l.landUnit === 'acres' ? l.landSize * PERCHES_PER_ACRE : l.landSize;
}

function positiveInt(value: string | null): number {
  const n = Number.parseInt(value || '', 10);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function optionalPrice(value: string | null): number | null {
  const n = Number(value);
  return value && Number.isFinite(n) && n > 0 ? n : null;
}

export function parseState(query: string): SearchState {
  const p = new URLSearchParams(query);
  const purpose = p.get('purpose');
  const sort = p.get('sort') as SortKey | null;
  return {
    ...DEFAULT_STATE,
    location: p.get('location') || '',
    type: p.get('type') || '',
    purpose: purpose === 'Sale' || purpose === 'Rent' ? purpose : '',
    minPrice: optionalPrice(p.get('min')),
    maxPrice: optionalPrice(p.get('max')),
    beds: positiveInt(p.get('beds')),
    land: positiveInt(p.get('land')),
    sort: SORT_OPTIONS.some((o) => o.value === sort) ? (sort as SortKey) : 'newest',
    view: p.get('view') === 'map' ? 'map' : 'grid',
  };
}

/** Query string for a state, leaving out defaults (the shortlist stays private) */
export function toQuery(s: SearchState): string {
  const p = new URLSearchParams();
  if (s.location.trim()) p.set('location', s.location.trim());
  if (s.type) p.set('type', s.type);
  if (s.purpose) p.set('purpose', s.purpose);
  if (s.minPrice) p.set('min', String(s.minPrice));
  if (s.maxPrice) p.set('max', String(s.maxPrice));
  if (s.beds) p.set('beds', String(s.beds));
  if (s.land) p.set('land', String(s.land));
  if (s.sort !== 'newest') p.set('sort', s.sort);
  if (s.view !== 'grid') p.set('view', s.view);
  return p.toString();
}

export function matches(l: Listing, s: SearchState, savedIds: ReadonlySet<string>, ignore?: 'type'): boolean {
  if (s.purpose && l.saleOrRent !== s.purpose) return false;
  if (ignore !== 'type' && s.type && l.propertyType.toLowerCase() !== s.type.toLowerCase()) return false;
  const q = s.location.trim().toLowerCase();
  if (
    q &&
    !l.city.toLowerCase().includes(q) &&
    !l.district.toLowerCase().includes(q) &&
    !l.address.toLowerCase().includes(q) &&
    !l.title.toLowerCase().includes(q)
  ) {
    return false;
  }
  if (s.minPrice != null && l.price < s.minPrice) return false;
  if (s.maxPrice != null && l.price > s.maxPrice) return false;
  if (s.beds && l.beds < s.beds) return false;
  if (s.land && landInPerches(l) < s.land) return false;
  if (s.saved && !savedIds.has(l.id)) return false;
  return true;
}

// On equal dates, homes come before land and commercial plots
const typeOrder = (type: string) => (/^(land|commercial)$/i.test(type) ? 2 : 1);

export function sortListings(list: Listing[], sort: SortKey): Listing[] {
  const sorted = [...list];
  switch (sort) {
    case 'price_asc':
      return sorted.sort((a, b) => a.price - b.price);
    case 'price_desc':
      return sorted.sort((a, b) => b.price - a.price);
    case 'land_desc':
      return sorted.sort((a, b) => landInPerches(b) - landInPerches(a));
    default:
      return sorted.sort((a, b) => b.listedAt - a.listedAt || typeOrder(a.propertyType) - typeOrder(b.propertyType));
  }
}

/** Label for the current price filter, e.g. "25 – 50 Mn" or "From 30 Mn" */
export function priceLabel(min: number | null, max: number | null): string | null {
  if (min == null && max == null) return null;
  const preset = PRICE_PRESETS.find((p) => p.min === min && p.max === max);
  if (preset) return preset.label;
  const mn = (v: number) => `${+(v / MN).toFixed(1)} Mn`;
  if (min != null && max != null) return `${mn(min)} – ${mn(max)}`;
  return min != null ? `From ${mn(min)}` : `Up to ${mn(max!)}`;
}

/** How many filters (beyond location and type) are narrowing the results */
export function advancedFilterCount(s: SearchState): number {
  return (s.purpose ? 1 : 0) + (s.minPrice != null || s.maxPrice != null ? 1 : 0) + (s.beds ? 1 : 0) + (s.land ? 1 : 0);
}

export function pluralType(type: string): string {
  if (/^land$/i.test(type) || /^commercial$/i.test(type)) return type;
  return `${type}s`;
}
