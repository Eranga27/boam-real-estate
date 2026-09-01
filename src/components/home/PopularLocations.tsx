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

import { properties as staticProperties } from '@/data/properties';

function assignCoords(city: string, title: string, id?: string) {
  const t = title.toLowerCase();
  const c = city.toLowerCase();

  if (id === 'polgolla-house' || t.includes('polgolla') || c.includes('polgolla')) return { lat: 7.3210, lng: 80.6410 };
  if (id === 'katugastota-double-storey-house' || t.includes('balangoda road') || t.includes('double-storey')) return { lat: 7.3310, lng: 80.6250 };
  if (id === 'katugastota-station-road-land' || t.includes('station road')) return { lat: 7.3310, lng: 80.6240 };
  if (id === 'katugastota-land' || t.includes('kahalla')) return { lat: 7.3275, lng: 80.6219 };
  if (t.includes('udathalawinna') || c.includes('udathalawinna') || t.includes('thungadhura') || c.includes('thungadhura')) return { lat: 7.3385, lng: 80.6480 };
  if (t.includes('amunugama') || c.includes('amunugama')) return { lat: 7.3050, lng: 80.6720 };
  if (t.includes('nugegoda') || c.includes('nugegoda') || c.includes('thalapathpitiya')) return { lat: 6.8625, lng: 79.9125 };
  if (t.includes('upkot') || c.includes('maskeliya')) return { lat: 6.8347, lng: 80.5732 };
  if (t.includes('three-storey') || t.includes('george e')) return { lat: 7.2783, lng: 80.6321 };
  if (c.includes('nillamba')) return { lat: 7.1850, lng: 80.6025 };
  if (c.includes('bulathsinhala') || c.includes('kalutara')) return { lat: 6.6478, lng: 80.1458 };
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

const INITIAL_PROPERTIES: PropertyMapItem[] = staticProperties.map((p) => {
  const coords = assignCoords(p.city || p.district || '', p.title || '', p.id);
  return {
    id: p.id,
    title: p.title,
    propertyType: p.type || 'Land',
    price: p.price,
    city: p.city || p.district || 'Sri Lanka',
    address: p.address,
    images: p.images || [],
    lat: typeof p.lat === 'number' ? p.lat : coords.lat,
    lng: typeof p.lng === 'number' ? p.lng : coords.lng,
    description: p.description,
  };
});

export function PopularLocations() {
  const [properties, setProperties] = useState<PropertyMapItem[]>(INITIAL_PROPERTIES);
  const [filter, setFilter] = useState<'All' | 'House' | 'Land'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    // Keep map synced with canonical static catalogue and merge any optional API items
    const fetchAll = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (!apiUrl) return;

        const res = await fetch(`${apiUrl}/api/v1/properties?limit=50`);
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const apiProperties: PropertyMapItem[] = data.data.map((p: any) => {
            const coords = assignCoords(p.city || p.district || '', p.title || '', p.id);
            return {
              id: p.id,
              title: p.title,
              propertyType: p.propertyType || 'Land',
              price: p.price,
              city: p.city || p.district || 'Sri Lanka',
              address: p.address,
              images: p.images || [],
              lat: typeof p.latitude === 'number' ? p.latitude : (p.lat || coords.lat),
              lng: typeof p.longitude === 'number' ? p.longitude : (p.lng || coords.lng),
              description: p.description,
            };
          });

          // Merge API properties with INITIAL_PROPERTIES, ensuring no duplicates by ID
          const existingIds = new Set(INITIAL_PROPERTIES.map((p) => p.id));
          const newApiItems = apiProperties.filter((p) => !existingIds.has(p.id));
          if (newApiItems.length > 0) {
            setProperties([...INITIAL_PROPERTIES, ...newApiItems]);
          }
        }
      } catch {
        // Fall back to INITIAL_PROPERTIES
      }
    };

    // Ensure properties state stays in sync with INITIAL_PROPERTIES
    setProperties(INITIAL_PROPERTIES);
    fetchAll();
  }, []);

  const filteredProperties = properties.filter((p) => {
    if (filter === 'All') return true;
    return p.propertyType.toLowerCase() === filter.toLowerCase();
  });

  const houseCount = properties.filter((p) => p.propertyType.toLowerCase() === 'house').length;
  const landCount = properties.filter((p) => p.propertyType.toLowerCase() === 'land').length;

  return (
    <section className="relative overflow-hidden bg-navy-50/60 py-16 lg:py-24">
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
          <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-2xl bg-white p-1.5 shadow-sm border border-navy-100 no-scrollbar">
            <button
              onClick={() => setFilter('All')}
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
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
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
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
              className={`flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
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