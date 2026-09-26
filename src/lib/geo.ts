/**
 * Approximate map positions for listings saved without coordinates (the admin form leaves
 * latitude/longitude optional). Matches the town in the listing's city, address or title,
 * then falls back to its district, so every listing can still appear on a map, at its
 * town rather than its exact plot. Plain module so any map can use it.
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

// Specific towns first; broad city names (which also appear inside other places) last
const TOWNS: [RegExp, number, number][] = [
  [/hikkaduwa/, 6.1395, 80.1063],
  [/dickwella|hiriketiyawa|kottagoda/, 5.962, 80.6974],
  [/wattegama/, 7.3502, 80.7015],
  [/katukithula|nuwara eliya/, 6.97, 80.75],
  [/maskeliya|upkot/, 6.8347, 80.5732],
  [/polgolla/, 7.321, 80.641],
  [/katugastota/, 7.3275, 80.6219],
  [/aniwatte/, 7.2785, 80.6318],
  [/matale/, 7.4675, 80.6234],
  [/athurugiriya/, 6.8789, 79.9956],
  [/boralasgamuwa/, 6.8436, 79.9018],
  [/kalubowila|dehiwala/, 6.8631, 79.8824],
  [/mount lavinia/, 6.8301, 79.8654],
  [/nugegoda/, 6.8649, 79.8997],
  [/rajagiriya/, 6.9083, 79.8967],
  [/malabe/, 6.9061, 79.9647],
  [/kelaniya|kohawila/, 6.9553, 79.9186],
  [/welisara/, 7.027, 79.9048],
  [/ekala/, 7.0863, 79.9041],
  [/kadawatha/, 7.0016, 79.9515],
  [/negombo/, 7.2083, 79.8358],
  [/panadura/, 6.7106, 79.9074],
  [/bulathsinhala/, 6.6667, 80.1667],
  [/velipenna|aluthgama/, 6.4258, 80.0521],
  [/ratnapura/, 6.6828, 80.3992],
  [/kurunegala/, 7.4863, 80.3647],
  [/\bgalle\b/, 6.0535, 80.221],
  [/\bmatara\b/, 5.9549, 80.555],
  [/\bkandy\b/, 7.2906, 80.6337],
  [/\bcolombo\b/, 6.9271, 79.8612],
];

// District capitals, plus provinces (some listings record a province as the district)
const DISTRICTS: Record<string, [number, number]> = {
  colombo: [6.9271, 79.8612],
  gampaha: [7.0873, 80.0144],
  kalutara: [6.5854, 79.9607],
  kandy: [7.2906, 80.6337],
  matale: [7.4675, 80.6234],
  'nuwara eliya': [6.9497, 80.7891],
  galle: [6.0535, 80.221],
  matara: [5.9549, 80.555],
  hambantota: [6.1241, 81.1185],
  jaffna: [9.6615, 80.0255],
  kilinochchi: [9.3803, 80.377],
  mannar: [8.981, 79.9044],
  vavuniya: [8.7514, 80.4971],
  mullaitivu: [9.2671, 80.8142],
  batticaloa: [7.731, 81.6747],
  ampara: [7.2912, 81.6724],
  trincomalee: [8.5874, 81.2152],
  kurunegala: [7.4863, 80.3647],
  puttalam: [8.0362, 79.8283],
  anuradhapura: [8.3114, 80.4037],
  polonnaruwa: [7.9403, 81.0188],
  badulla: [6.9934, 81.055],
  moneragala: [6.8728, 81.3507],
  monaragala: [6.8728, 81.3507],
  ratnapura: [6.6828, 80.3992],
  kegalle: [7.2513, 80.3464],
  'western province': [6.9271, 79.8612],
  'central province': [7.2906, 80.6337],
  'southern province': [6.0535, 80.221],
  'northern province': [9.6615, 80.0255],
  'eastern province': [8.5874, 81.2152],
  'north western province': [7.4863, 80.3647],
  'north central province': [8.3114, 80.4037],
  'uva province': [6.9934, 81.055],
  'sabaragamuwa province': [6.6828, 80.3992],
};

/** Approximate position from a listing's place names, or null if none is recognised */
export function approximateLocation(p: { city?: string | null; district?: string | null; address?: string | null; title?: string | null }): GeoPoint | null {
  const text = `${p.city || ''} | ${p.address || ''} | ${p.title || ''}`.toLowerCase();
  for (const [pattern, lat, lng] of TOWNS) {
    if (pattern.test(text)) return { lat, lng };
  }
  const district = (p.district || '').toLowerCase().replace(/\s+district$/, '').trim();
  const hit = DISTRICTS[district];
  return hit ? { lat: hit[0], lng: hit[1] } : null;
}
