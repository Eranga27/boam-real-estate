'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Home, Trees, Building2, ChevronRight, Layers } from 'lucide-react';
import { formatFullPrice, formatPrice, getImageUrl } from '@/lib/format';
import type { PropertyMapItem } from './SriLankaMap';

const SriLankaMap = dynamic(() => import('./SriLankaMap').then((m) => m.SriLankaMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[580px] w-full items-center justify-center rounded-3xl bg-navy-900 text-white">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <span className="text-sm font-semibold tracking-wide text-white/80">
          Loading Sri Lanka Property Map…
        </span>
      </div>
    </div>
  ),
});

const INITIAL_PROPERTIES: PropertyMapItem[] = [
  {
    id: 'upkot-maskeliya-house',
    title: 'Luxury House in Upkot Maskeliya',
    propertyType: 'House',
    price: 115000000,
    city: 'Upkot, Maskeliya',
    lat: 6.8347,
    lng: 80.5732,
    images: ['property-1787331334740-upkotmaskeliya1.jpeg'],
  },
  {
    id: 'kandy-three-storey-house',
    title: 'Three-Storey House in Kandy',
    propertyType: 'House',
    price: 210000000,
    city: 'Kandy',
    lat: 7.2783,
    lng: 80.6321,
    images: ['property-1787331336449-kandy1.jpeg'],
  },
  {
    id: 'ekala-house',
    title: 'House in Ekala',
    propertyType: 'House',
    price: 45000000,
    city: 'Ekala',
    lat: 7.0863,
    lng: 79.9041,
    images: ['property-1787331341909-ekala1.jpeg'],
  },
  {
    id: 'kadawatha-house',
    title: 'House in Kadawatha',
    propertyType: 'House',
    price: 48000000,
    city: 'Kadawatha',
    lat: 7.0016,
    lng: 79.9515,
    images: ['property-1787331343370-kadawatha1.jpeg'],
  },
  {
    id: 'rajagiriya-land',
    title: 'Land in Rajagiriya',
    propertyType: 'Land',
    price: 43750000,
    city: 'Rajagiriya',
    lat: 6.9083,
    lng: 79.8967,
    images: [],
  },
  {
    id: 'welisara-land',
    title: 'Land in Welisara',
    propertyType: 'Land',
    price: 21000000,
    city: 'Welisara',
    lat: 7.0270,
    lng: 79.9048,
    images: [],
  },
  {
    id: 'malabe-land',
    title: 'Land in Malabe',
    propertyType: 'Land',
    price: 21750000,
    city: 'Malabe',
    lat: 6.9061,
    lng: 79.9647,
    images: [],
  },
  {
    id: 'kandy-land',
    title: 'Land in Kandy',
    propertyType: 'Land',
    price: 84000000,
    city: 'Kandy',
    lat: 7.2950,
    lng: 80.6380,
    images: [],
  },
  {
    id: 'mount-lavinia-land',
    title: 'Land in Mount Lavinia',
    propertyType: 'Land',
    price: 82500000,
    city: 'Mount Lavinia',
    lat: 6.8301,
    lng: 79.8654,
    images: [],
  },
  {
    id: 'panadura-land',
    title: 'Land in Panadura',
    propertyType: 'Land',
    price: 20000000,
    city: 'Panadura',
    lat: 6.7106,
    lng: 79.9074,
    images: [],
  },
  {
    id: 'katugastota-land',
    title: 'Land in Katugastota',
    propertyType: 'Land',
    price: 80000000,
    city: 'Katugastota',
    lat: 7.3275,
    lng: 80.6219,
    images: [],
  },
  {
    id: 'ratnapura-land',
    title: 'Land in Ratnapura',
    propertyType: 'Land',
    price: 85200000,
    city: 'Ratnapura',
    lat: 6.6828,
    lng: 80.3992,
    images: [],
  },
  {
    id: 'velipenna-land',
    title: 'Land in Velipenna/ Aluthgama',
    propertyType: 'Land',
    price: 20000000,
    city: 'Velipenna',
    lat: 6.4258,
    lng: 80.0521,
    images: [],
  },
  {
    id: 'kurunegala-land',
    title: 'Land in Kurunegala',
    propertyType: 'Land',
    price: 150000000,
    city: 'Kurunegala',
    lat: 7.4863,
    lng: 80.3647,
    images: [],
  },
];

function assignCoords(city: string, title: string) {
  const t = title.toLowerCase();
  const c = city.toLowerCase();

  if (t.includes('upkot') || c.includes('maskeliya')) return { lat: 6.8347, lng: 80.5732 };
  if (t.includes('three-storey') || t.includes('george e')) return { lat: 7.2783, lng: 80.6321 };
  if (c.includes('kandy')) return { lat: 7.2950, lng: 80.6380 };
  if (c.includes('ekala')) return { lat: 7.0863, lng: 79.9041 };
  if (c.includes('kadawatha')) return { lat: 7.0016, lng: 79.9515 };
  if (c.includes('rajagiriya')) return { lat: 6.9083, lng: 79.8967 };
  if (c.includes('welisara')) return { lat: 7.0270, lng: 79.9048 };
  if (c.includes('malabe')) return { lat: 6.9061, lng: 79.9647 };
  if (c.includes('mount lavinia')) return { lat: 6.8301, lng: 79.8654 };
  if (c.includes('panadura')) return { lat: 6.7106, lng: 79.9074 };
  if (c.includes('katugastota')) return { lat: 7.3275, lng: 80.6219 };
  if (c.includes('ratnapura')) return { lat: 6.6828, lng: 80.3992 };
  if (c.includes('velipenna') || c.includes('aluthgama')) return { lat: 6.4258, lng: 80.0521 };
  if (c.includes('kurunegala')) return { lat: 7.4863, lng: 80.3647 };

  return { lat: 6.9271, lng: 79.8612 };
}

export function PopularLocations() {
  const [properties, setProperties] = useState<PropertyMapItem[]>(INITIAL_PROPERTIES);
  const [filter, setFilter] = useState<'All' | 'House' | 'Land'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/v1/properties?limit=50`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: PropertyMapItem[] = data.data.map((p: any) => {
            const coords = assignCoords(p.city || p.district || '', p.title || '');
            return {
              id: p.id,
              title: p.title,
              propertyType: p.propertyType || 'Land',
              price: p.price,
              city: p.city || p.district || 'Sri Lanka',
              address: p.address,
              images: p.images || [],
              lat: p.latitude || coords.lat,
              lng: p.longitude || coords.lng,
              description: p.description,
            };
          });
          setProperties(mapped);
        }
      } catch {
        // Fall back to INITIAL_PROPERTIES if offline
      }
    };
    fetchAll();
  }, []);

  const filteredProperties = properties.filter((p) => {
    if (filter === 'All') return true;
    return p.propertyType.toLowerCase() === filter.toLowerCase();
  });

  const houseCount = properties.filter((p) => p.propertyType.toLowerCase() === 'house').length;
  const landCount = properties.filter((p) => p.propertyType.toLowerCase() === 'land').length;

  return (
    <section className="bg-navy-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
              Where We Operate
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl">
              Explore Available Listings Across Sri Lanka
            </h2>
            <p className="mt-2 text-sm text-navy-600 max-w-xl">
              Click on any location marker on the interactive map to view property details, photos, and explore listings directly.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 rounded-2xl bg-white p-1.5 shadow-sm border border-navy-100">
            <button
              onClick={() => setFilter('All')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === 'All'
                  ? 'bg-navy-900 text-white shadow-sm'
                  : 'text-navy-700 hover:bg-navy-50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All ({properties.length})</span>
            </button>

            <button
              onClick={() => setFilter('House')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === 'House'
                  ? 'bg-amber-500 text-navy-950 shadow-sm'
                  : 'text-navy-700 hover:bg-navy-50'
              }`}
            >
              <Home className="h-3.5 w-3.5" />
              <span>Houses ({houseCount})</span>
            </button>

            <button
              onClick={() => setFilter('Land')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === 'Land'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-navy-700 hover:bg-navy-50'
              }`}
            >
              <Trees className="h-3.5 w-3.5" />
              <span>Lands ({landCount})</span>
            </button>
          </div>
        </div>

        {/* Map & Listings Sidebar Container */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Main Interactive Map */}
          <div className="lg:col-span-8">
            <SriLankaMap
              properties={filteredProperties}
              selectedId={selectedId}
              onSelectProperty={(id) => setSelectedId(id)}
            />
          </div>

          {/* Quick Property Selector Sidebar */}
          <div className="lg:col-span-4 flex flex-col h-[580px] rounded-3xl bg-white p-4 shadow-xl border border-navy-100">
            <div className="flex items-center justify-between px-2 pb-3 border-b border-navy-100">
              <h3 className="text-sm font-extrabold text-navy-900">
                Available Locations ({filteredProperties.length})
              </h3>
              <span className="text-[11px] font-semibold text-amber-600">
                Click listing to view on map
              </span>
            </div>

            <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {filteredProperties.map((item) => {
                const isSelected = selectedId === item.id;
                const isHouse = item.propertyType.toLowerCase() === 'house';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`group relative flex items-center gap-3 rounded-2xl p-2.5 transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 shadow-md ring-2 ring-amber-400/20'
                        : 'border-navy-100/80 bg-white hover:border-navy-200 hover:bg-navy-50/50'
                    }`}
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-navy-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.images[0])}
                          alt={item.title}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-navy-800 text-white/50">
                          <Building2 className="h-6 w-6" />
                        </div>
                      )}
                      <span className={`absolute top-1 left-1 rounded-full p-1 shadow ${
                        isHouse ? 'bg-amber-500 text-navy-950' : 'bg-emerald-600 text-white'
                      }`}>
                        {isHouse ? <Home className="h-2.5 w-2.5" /> : <Trees className="h-2.5 w-2.5" />}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-600">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.city}</span>
                      </div>
                      <h4 className="text-xs font-bold text-navy-900 truncate mt-0.5">
                        {item.title}
                      </h4>
                      <p className="text-xs font-extrabold text-navy-900 mt-1">
                        {formatPrice(item.price, 'sale')}
                      </p>
                    </div>

                    <ChevronRight className={`h-4 w-4 text-navy-400 transition-transform group-hover:translate-x-1 ${
                      isSelected ? 'text-amber-600' : ''
                    }`} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}