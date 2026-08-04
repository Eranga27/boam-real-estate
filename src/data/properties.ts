import type { Property } from '../types/property';

const u = (id: string) => `https://images.unsplash.com/${id}?auto=format&fit=crop&q=80&w=1400`;

export const properties: Property[] = [
{
  id: 'bre-101',
  title: 'Ocean-Facing Modern Villa with Infinity Pool',
  type: 'House',
  listingType: 'sale',
  price: 185000000,
  negotiable: true,
  city: 'Galle',
  district: 'Southern Province',
  address: '14 Rampart Lane, Galle Fort, Galle',
  lat: 6.0269,
  lng: 80.2168,
  beds: 5,
  baths: 5,
  parking: 3,
  landSize: 42,
  houseSize: 5400,
  yearBuilt: 2021,
  description:
  'A rare architect-designed residence set on the coastal ridge above Galle Fort. Floor-to-ceiling glazing frames uninterrupted Indian Ocean views, while a 14-metre infinity pool wraps the living pavilion. Interiors combine polished cement, teak joinery and locally quarried stone, with a fully fitted German kitchen and staff quarters to the rear.',
  amenities: ['Infinity Pool', 'Ocean View', 'Landscaped Garden', 'Staff Quarters', 'Solar Power', 'Air Conditioning', 'CCTV Security', 'Backup Generator'],
  nearby: ['Galle Fort — 1.2 km', 'Unawatuna Beach — 4 km', 'Southern Expressway — 6 km', 'Closenberg Hospital — 3 km', "Richmond College — 2.5 km"],
  images: [
  u('photo-1613490493576-7fde63acd811'),
  u('photo-1600607687939-ce8a6c25118c'),
  u('photo-1600566753086-00f18fb6b3ea'),
  u('photo-1600585154340-be6161a56a0c'),
  u('photo-1560448204-e02f11c3d0e2')],

  listedDaysAgo: 3,
  featured: true
},
{
  id: 'bre-102',
  title: 'Luxury Sky Residence at Colombo 03',
  type: 'Apartment',
  listingType: 'sale',
  price: 96500000,
  negotiable: false,
  city: 'Colombo',
  district: 'Colombo 03',
  address: '278 Galle Road, Kollupitiya, Colombo 03',
  lat: 6.9105,
  lng: 79.8503,
  beds: 3,
  baths: 3,
  parking: 2,
  landSize: 0,
  houseSize: 2380,
  yearBuilt: 2022,
  description:
  'A high-floor corner residence in one of Kollupitiya’s most sought-after towers, delivering panoramic sea and city views from a wrap-around balcony. Fully fitted with imported kitchen appliances, built-in wardrobes and centralised air conditioning, with access to a rooftop infinity pool, gym and residents’ lounge.',
  amenities: ['Rooftop Pool', 'Gymnasium', 'Sea View', '24/7 Concierge', 'Elevator', 'Air Conditioning', 'Covered Parking', 'Residents Lounge'],
  nearby: ['Galle Face Green — 1.5 km', 'One Galle Face Mall — 1.8 km', 'Colombo General Hospital — 3 km', 'Royal College — 2 km'],
  images: [
  u('photo-1545324418-cc1a3fa10c00'),
  u('photo-1502672260266-1c1ef2d93688'),
  u('photo-1522708323590-d24dbb6b0267'),
  u('photo-1560185007-cde436f6a4d0')],

  listedDaysAgo: 8,
  featured: true
},
{
  id: 'bre-103',
  title: 'Colonial Estate Bungalow with Tea Views',
  type: 'House',
  listingType: 'sale',
  price: 132000000,
  negotiable: true,
  city: 'Kandy',
  district: 'Central Province',
  address: 'Hantana Estate Road, Kandy',
  lat: 7.2765,
  lng: 80.6238,
  beds: 4,
  baths: 4,
  parking: 4,
  landSize: 120,
  houseSize: 4600,
  yearBuilt: 1936,
  description:
  'A meticulously restored planter’s bungalow on 120 perches of mature garden, overlooking the Hantana range. Original teak floors, six-panel doors and fireplaces have been preserved alongside rewired services, a new roof and modern bathrooms. A separate garden cottage offers guest or rental potential.',
  amenities: ['Mountain View', 'Mature Garden', 'Fireplace', 'Guest Cottage', 'Well Water', 'Servant Quarters', 'Fruit Orchard'],
  nearby: ['Kandy Lake — 4 km', 'Temple of the Tooth — 4.5 km', 'Peradeniya University — 5 km', 'Kandy General Hospital — 5 km'],
  images: [
  u('photo-1600596542815-ffad4c1539a9'),
  u('photo-1600585154526-990dced4db0d'),
  u('photo-1600573472550-8090b5e0745e'),
  u('photo-1449844908441-8829872d2607')],

  listedDaysAgo: 14,
  featured: true
},
{
  id: 'bre-104',
  title: 'Beachfront Family Home, Negombo Lagoon',
  type: 'House',
  listingType: 'rent',
  price: 425000,
  negotiable: true,
  city: 'Negombo',
  district: 'Western Province',
  address: '52 Lewis Place, Negombo',
  lat: 7.2083,
  lng: 79.8358,
  beds: 4,
  baths: 3,
  parking: 2,
  landSize: 28,
  houseSize: 3100,
  yearBuilt: 2018,
  description:
  'Fully furnished beachfront home with direct sand access, ideal for expatriate families or long-stay tenants. Open-plan living flows to a shaded veranda and plunge pool, and the property includes a caretaker, weekly garden service and fibre internet.',
  amenities: ['Beach Access', 'Plunge Pool', 'Fully Furnished', 'Fibre Internet', 'Caretaker Included', 'Air Conditioning', 'Outdoor Shower'],
  nearby: ['Negombo Beach — steps away', 'Bandaranaike Airport — 18 km', 'Negombo Fish Market — 3 km', 'British School — 4 km'],
  images: [
  u('photo-1512917774080-9991f1c4c750'),
  u('photo-1493809842364-78817add7ffb'),
  u('photo-1600210492486-724fe5c67fb0'),
  u('photo-1600607687920-4e2a09cf159d')],

  listedDaysAgo: 2,
  featured: true
},
{
  id: 'bre-105',
  title: 'Garden Apartment near Independence Square',
  type: 'Apartment',
  listingType: 'rent',
  price: 265000,
  negotiable: false,
  city: 'Colombo',
  district: 'Colombo 07',
  address: '9 Guildford Crescent, Cinnamon Gardens, Colombo 07',
  lat: 6.9018,
  lng: 79.8656,
  beds: 2,
  baths: 2,
  parking: 1,
  landSize: 0,
  houseSize: 1450,
  yearBuilt: 2016,
  description:
  'A quiet ground-floor apartment in a boutique four-unit block, opening onto a private walled garden shaded by mara trees. Recently repainted with new kitchen fittings, in the heart of Colombo 07’s embassy district.',
  amenities: ['Private Garden', 'Pet Friendly', 'Air Conditioning', 'Security', 'Backup Water Tank', 'Covered Parking'],
  nearby: ['Independence Square — 900 m', 'Nelum Pokuna Theatre — 1.4 km', 'Asiri Hospital — 1.8 km', 'Colombo 07 shops — 500 m'],
  images: [
  u('photo-1560448075-bb485b067938'),
  u('photo-1586023492125-27b2c045efd7'),
  u('photo-1567767292278-a4f21aa2d36e'),
  u('photo-1616486338812-3dadae4b4ace')],

  listedDaysAgo: 21,
  featured: false
},
{
  id: 'bre-106',
  title: 'Prime Commercial Land on Baseline Road',
  type: 'Land',
  listingType: 'sale',
  price: 74000000,
  negotiable: true,
  city: 'Colombo',
  district: 'Colombo 09',
  address: 'Baseline Road, Dematagoda, Colombo 09',
  lat: 6.9333,
  lng: 79.8783,
  beds: 0,
  baths: 0,
  parking: 0,
  landSize: 36,
  houseSize: 0,
  yearBuilt: 0,
  description:
  'Flat, rectangular commercial block with 55 ft of frontage onto Baseline Road, cleared and ready to build. Clear title with approved commercial zoning — suited to showroom, clinic or mixed-use development.',
  amenities: ['Clear Title', 'Road Frontage', 'Commercial Zoning', 'Mains Water', 'Three-Phase Electricity', 'Flat Terrain'],
  nearby: ['Colombo Fort — 5 km', 'Borella Junction — 2 km', 'Kelani Valley Railway — 1 km', 'Outer Circular Highway — 7 km'],
  images: [
  u('photo-1500382017468-9049fed747ef'),
  u('photo-1464822759023-fed622ff2c3b'),
  u('photo-1470071459604-3b5ec3a7fe05')],

  listedDaysAgo: 34,
  featured: false
},
{
  id: 'bre-107',
  title: 'Contemporary Townhouse in Nugegoda',
  type: 'House',
  listingType: 'sale',
  price: 58500000,
  negotiable: false,
  city: 'Colombo',
  district: 'Nugegoda',
  address: '31/4 Pagoda Road, Nugegoda',
  lat: 6.8649,
  lng: 79.8997,
  beds: 4,
  baths: 3,
  parking: 2,
  landSize: 12,
  houseSize: 2600,
  yearBuilt: 2023,
  description:
  'Brand new three-storey townhouse in a gated cluster of six, finished with porcelain tiling, quartz counters and aluminium windows throughout. Rooftop terrace with sunset views over the suburb, walking distance to schools and rail.',
  amenities: ['Rooftop Terrace', 'Gated Community', 'Solar Water Heater', 'Air Conditioning', 'Store Room', 'CCTV Security'],
  nearby: ['Nugegoda Railway — 800 m', 'Isipathana College — 3 km', 'Asiri Surgical — 4 km', 'Nugegoda shopping — 1 km'],
  images: [
  u('photo-1568605114967-8130f3a36994'),
  u('photo-1600585154340-be6161a56a0c'),
  u('photo-1583608205776-bfd35f0d9f83'),
  u('photo-1600121848594-d8644e57abab')],

  listedDaysAgo: 6,
  featured: false
},
{
  id: 'bre-108',
  title: 'Hillside Condo with Panoramic Valley Views',
  type: 'Condo',
  listingType: 'sale',
  price: 44000000,
  negotiable: true,
  city: 'Kandy',
  district: 'Central Province',
  address: 'Sirimalwatta Road, Kundasale, Kandy',
  lat: 7.2896,
  lng: 80.6934,
  beds: 3,
  baths: 2,
  parking: 1,
  landSize: 0,
  houseSize: 1780,
  yearBuilt: 2020,
  description:
  'Corner condominium unit on the fourth floor with double-aspect windows capturing the Mahaweli valley. Shared podium garden, standby generator and secure basement parking.',
  amenities: ['Valley View', 'Elevator', 'Standby Generator', 'Shared Garden', 'Security', 'Basement Parking'],
  nearby: ['Kandy City Centre — 9 km', 'Kundasale Market — 1 km', 'Trinity College — 8 km', 'Digana Industrial Zone — 6 km'],
  images: [
  u('photo-1580587771525-78b9dba3b914'),
  u('photo-1600607688969-a5bfcd646154'),
  u('photo-1600566752355-35792bedcfea')],

  listedDaysAgo: 11,
  featured: false
},
{
  id: 'bre-109',
  title: 'Boutique Retail & Office Building, Jaffna',
  type: 'Commercial',
  listingType: 'rent',
  price: 385000,
  negotiable: true,
  city: 'Jaffna',
  district: 'Northern Province',
  address: '120 Hospital Road, Jaffna',
  lat: 9.6615,
  lng: 80.0255,
  beds: 0,
  baths: 4,
  parking: 6,
  landSize: 22,
  houseSize: 4200,
  yearBuilt: 2019,
  description:
  'Two-floor commercial building on Jaffna’s busiest retail street, currently configured as ground-floor showroom with open-plan offices above. Lift-ready shaft, three-phase power and dedicated customer parking to the rear.',
  amenities: ['Street Frontage', 'Three-Phase Power', 'Customer Parking', 'Air Conditioning', 'Fire Safety System', 'Signage Rights'],
  nearby: ['Jaffna Teaching Hospital — 600 m', 'Jaffna Bus Stand — 1.5 km', 'Nallur Kandaswamy Temple — 3 km', 'Jaffna Railway — 2 km'],
  images: [
  u('photo-1497366754035-f200968a6e72'),
  u('photo-1497366811353-6870744d04b2'),
  u('photo-1524758631624-e2822e304c36')],

  listedDaysAgo: 27,
  featured: false
},
{
  id: 'bre-110',
  title: 'Lagoon-Side Land Plot with Building Approval',
  type: 'Land',
  listingType: 'sale',
  price: 29500000,
  negotiable: true,
  city: 'Negombo',
  district: 'Western Province',
  address: 'Kadolkele Road, Negombo',
  lat: 7.1958,
  lng: 79.8489,
  beds: 0,
  baths: 0,
  parking: 0,
  landSize: 48,
  houseSize: 0,
  yearBuilt: 0,
  description:
  'Elevated 48-perch plot with 90 ft of lagoon frontage and approved plans for a four-bedroom villa. Mangrove buffer on the northern boundary keeps the outlook permanently open.',
  amenities: ['Lagoon Frontage', 'Approved Plans', 'Clear Title', 'Mains Water', 'Electricity at Boundary', 'Gated Access Road'],
  nearby: ['Negombo Lagoon — frontage', 'Airport Expressway — 8 km', 'Negombo town — 4 km', 'Dutch Canal — 1 km'],
  images: [
  u('photo-1502082553048-f009c37129b9'),
  u('photo-1441974231531-c6227db76b6e'),
  u('photo-1501785888041-af3ef285b470')],

  listedDaysAgo: 45,
  featured: false
},
{
  id: 'bre-111',
  title: 'Serviced Penthouse on the Galle Face Skyline',
  type: 'Apartment',
  listingType: 'rent',
  price: 780000,
  negotiable: false,
  city: 'Colombo',
  district: 'Colombo 02',
  address: 'Union Place, Slave Island, Colombo 02',
  lat: 6.9218,
  lng: 79.8562,
  beds: 4,
  baths: 4,
  parking: 3,
  landSize: 0,
  houseSize: 3900,
  yearBuilt: 2023,
  description:
  'Duplex penthouse with private lift lobby, double-height living volume and a 900 sq ft entertaining terrace facing the ocean. Let fully serviced with housekeeping, valet parking and access to the tower’s spa and lap pool.',
  amenities: ['Private Lift Lobby', 'Ocean View', 'Housekeeping', 'Lap Pool', 'Spa Access', 'Smart Home', 'Valet Parking'],
  nearby: ['Galle Face Green — 1 km', 'Colombo Port City — 2 km', 'Cinnamon Grand — 900 m', 'Nawaloka Hospital — 1.5 km'],
  images: [
  u('photo-1600607687644-c7171b42498b'),
  u('photo-1600566753190-17f0baa2a6c3'),
  u('photo-1600585152220-90363fe7e115'),
  u('photo-1600210492493-0946911123ea')],

  listedDaysAgo: 4,
  featured: false
},
{
  id: 'bre-112',
  title: 'Restored Fort Courtyard House',
  type: 'House',
  listingType: 'sale',
  price: 118000000,
  negotiable: true,
  city: 'Galle',
  district: 'Southern Province',
  address: '6 Leyn Baan Street, Galle Fort',
  lat: 6.0257,
  lng: 80.2172,
  beds: 3,
  baths: 3,
  parking: 1,
  landSize: 14,
  houseSize: 2900,
  yearBuilt: 1890,
  description:
  'A Dutch-period townhouse within the Fort walls, restored under conservation guidance around a planted central courtyard and plunge pool. Lime-plastered walls, satinwood columns and antique floor tiles throughout.',
  amenities: ['Heritage Property', 'Courtyard Plunge Pool', 'Antique Fittings', 'Air Conditioning', 'Roof Terrace', 'Rental History'],
  nearby: ['Galle Lighthouse — 300 m', 'Fort Ramparts — 200 m', 'Galle Cricket Stadium — 1 km', 'Galle Railway — 1.5 km'],
  images: [
  u('photo-1600047509807-ba8f99d2cdde'),
  u('photo-1600566753051-f0b89df2dd90'),
  u('photo-1600573472592-401b489a3cdc')],

  listedDaysAgo: 18,
  featured: false
}];


export function getProperty(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getSimilarProperties(property: Property, count = 3): Property[] {
  const sameCity = properties.filter((p) => p.id !== property.id && p.city === property.city);
  const rest = properties.filter((p) => p.id !== property.id && p.city !== property.city);
  return [...sameCity, ...rest].slice(0, count);
}

export const propertyTypes = ['House', 'Apartment', 'Condo', 'Land', 'Commercial'] as const;

export const districts = [
'Colombo 01 – 15',
'Nugegoda',
'Dehiwala',
'Mount Lavinia',
'Negombo',
'Kandy',
'Galle',
'Jaffna',
'Kurunegala',
'Matara'];