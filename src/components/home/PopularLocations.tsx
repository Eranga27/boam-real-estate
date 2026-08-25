'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Home, Trees, Building2, ChevronRight, Layers } from 'lucide-react';
import { formatPrice, getImageUrl } from '@/lib/format';
import { properties as staticProperties } from '@/data/properties';
import type { PropertyMapItem } from './SriLankaMap';

const SriLankaMap = dynamic(() => import('./SriLankaMap').then((m) => m.SriLankaMap), {
  ssr: false,
  loading: () => (
    <div className="flex h-[520px] sm:h-[580px] w-full items-center justify-center rounded-3xl bg-navy-950 text-white border border-navy-800">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-amber-500 border-t-transparent" />
        <span className="text-xs font-bold tracking-wider uppercase text-white/80">
          Loading Sri Lanka Property Map…
        </span>
      </div>
    </div>
  ),
});

/** Build initial static property map items directly from data/properties.ts */
const INITIAL_PROPERTIES: PropertyMapItem[] = staticProperties.map((p) => ({
  id: p.id,
  title: p.title,
  propertyType: p.type,
  price: p.price,
  city: p.city,
  lat: p.lat,
  lng: p.lng,
  images: p.images,
  description: p.description,
}));

export function PopularLocations() {
  const [properties, setProperties] = useState<PropertyMapItem[]>(INITIAL_PROPERTIES);
  const [filter, setFilter] = useState<'All' | 'House' | 'Land'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
        const res = await fetch(`${apiUrl}/api/v1/properties?limit=50`, { signal: AbortSignal.timeout(4000) });
        const data = await res.json();
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
          const mapped: PropertyMapItem[] = data.data.map((p: any) => {
            const staticMatch = staticProperties.find((sp) => sp.id === p.id);
            return {
              id: p.id,
              title: p.title,
              propertyType: p.propertyType || 'Land',
              price: p.price,
              city: p.city || p.district || 'Sri Lanka',
              address: p.address,
              images: (p.images || []).map((img: string) => getImageUrl(img)),
              lat: p.latitude || staticMatch?.lat || 7.8731,
              lng: p.longitude || staticMatch?.lng || 80.7718,
              description: p.description,
            };
          });
          setProperties(mapped);
        }
      } catch {
        // Fallback to INITIAL_PROPERTIES if API offline
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
    <section className="relative bg-navy-50/50 py-16 sm:py-20 lg:py-24 border-t border-navy-100/60 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Heading & Transition into Explorer */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-600">
              Interactive Explorer
            </p>
            <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl">
              Property, by place.
            </h2>
            <p className="mt-2 text-sm sm:text-base text-navy-800/70 max-w-xl leading-relaxed">
              Explore verified opportunities across Sri Lanka.
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 rounded-2xl bg-white p-1.5 shadow-sm border border-navy-100 self-start md:self-auto">
            <button
              onClick={() => setFilter('All')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === 'All'
                  ? 'bg-navy-950 text-white shadow-sm ring-1 ring-navy-900/20'
                  : 'text-navy-700 hover:bg-navy-50'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>ALL ({properties.length})</span>
            </button>

            <button
              onClick={() => setFilter('House')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === 'House'
                  ? 'bg-navy-900 text-amber-400 shadow-sm ring-1 ring-amber-400/40'
                  : 'text-navy-700 hover:bg-navy-50'
              }`}
            >
              <Home className="h-3.5 w-3.5 text-amber-500" />
              <span>HOMES ({houseCount})</span>
            </button>

            <button
              onClick={() => setFilter('Land')}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                filter === 'Land'
                  ? 'bg-emerald-700 text-white shadow-sm ring-1 ring-emerald-600/40'
                  : 'text-navy-700 hover:bg-navy-50'
              }`}
            >
              <Trees className="h-3.5 w-3.5 text-emerald-400" />
              <span>LAND ({landCount})</span>
            </button>
          </div>
        </div>

        {/* Desktop Layout: Left Map, Right Property Discovery Rail */}
        {/* Mobile Layout: 1. Heading, 2. Filter, 3. Map, 4. Horizontal Rail */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Interactive Sri Lanka Map */}
          <div className="lg:col-span-7 lg:order-1 order-1">
            <SriLankaMap
              properties={filteredProperties}
              selectedId={selectedId}
              onSelectProperty={(id) => setSelectedId(id)}
            />
          </div>

          {/* Property Discovery Rail */}
          <div className="lg:col-span-5 lg:order-2 order-2">
            {/* Desktop Rail View: Vertical Scrollable Column */}
            <div className="hidden lg:flex lg:flex-col lg:h-[580px] rounded-3xl bg-white p-4 shadow-sm border border-navy-100">
              <div className="flex items-center justify-between px-2 pb-3 border-b border-navy-100">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-navy-950">
                  Verified Listings ({filteredProperties.length})
                </h3>
                <span className="text-[11px] font-semibold text-amber-600">
                  Select listing to focus on map
                </span>
              </div>

              <div className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1.5 custom-scrollbar">
                {filteredProperties.map((item) => {
                  const isSelected = selectedId === item.id;
                  const isHouse = item.propertyType.toLowerCase() === 'house';

                  return (
                    <div
                      key={item.id}
                      onClick={() => setSelectedId(item.id)}
                      className={`group relative flex items-center gap-3.5 rounded-2xl p-3 transition-all cursor-pointer border ${
                        isSelected
                          ? 'border-amber-400 bg-amber-50/70 shadow-sm ring-1 ring-amber-400/30'
                          : 'border-navy-100/80 bg-white hover:border-navy-200 hover:bg-navy-50/40'
                      }`}
                    >
                      <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-navy-100">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={getImageUrl(item.images[0])}
                            alt={item.title}
                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-navy-900 text-white/40">
                            <Building2 className="h-6 w-6" />
                          </div>
                        )}
                        <span className={`absolute top-1 left-1 rounded-full px-1.5 py-0.5 text-[9px] font-bold shadow ${
                          isHouse ? 'bg-navy-900 text-amber-400 border border-amber-400/30' : 'bg-emerald-700 text-white'
                        }`}>
                          {isHouse ? 'House' : 'Land'}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                          <MapPin className="h-3 w-3 shrink-0" />
                          <span className="truncate">{item.city}</span>
                        </div>
                        <h4 className="text-xs sm:text-sm font-bold text-navy-950 truncate mt-0.5">
                          {item.title}
                        </h4>
                        <p className="text-xs sm:text-sm font-extrabold text-navy-900 mt-0.5">
                          {formatPrice(item.price, 'sale')}
                        </p>
                      </div>

                      <Link
                        href={`/properties/${item.id}`}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={`View ${item.title}`}
                        className="p-1.5 text-navy-400 hover:text-amber-600 transition-colors"
                      >
                        <ChevronRight className={`h-5 w-5 transition-transform group-hover:translate-x-0.5 ${
                          isSelected ? 'text-amber-600' : ''
                        }`} />
                      </Link>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile Rail View: Horizontal Scrollable Row */}
            <div className="lg:hidden flex gap-3.5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-none">
              {filteredProperties.map((item) => {
                const isSelected = selectedId === item.id;
                const isHouse = item.propertyType.toLowerCase() === 'house';

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedId(item.id)}
                    className={`snap-start shrink-0 w-72 rounded-2xl p-3 transition-all cursor-pointer border bg-white ${
                      isSelected
                        ? 'border-amber-400 bg-amber-50/70 shadow-md ring-1 ring-amber-400/30'
                        : 'border-navy-100 shadow-sm'
                    }`}
                  >
                    <div className="relative h-32 w-full overflow-hidden rounded-xl bg-navy-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={getImageUrl(item.images[0])}
                          alt={item.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-navy-900 text-white/40">
                          <Building2 className="h-8 w-8" />
                        </div>
                      )}
                      <span className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-bold shadow ${
                        isHouse ? 'bg-navy-900 text-amber-400 border border-amber-400/30' : 'bg-emerald-700 text-white'
                      }`}>
                        {isHouse ? 'House' : 'Land'}
                      </span>
                    </div>

                    <div className="mt-2.5">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="truncate">{item.city}</span>
                      </div>
                      <h4 className="text-xs font-bold text-navy-950 truncate mt-0.5">
                        {item.title}
                      </h4>
                      <div className="mt-1.5 flex items-center justify-between">
                        <p className="text-xs font-extrabold text-navy-900">
                          {formatPrice(item.price, 'sale')}
                        </p>
                        <Link
                          href={`/properties/${item.id}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[11px] font-bold text-amber-600 flex items-center gap-0.5 hover:underline"
                        >
                          <span>View</span>
                          <ChevronRight className="h-3 w-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Soft dissolve → warm ivory WhyChooseUs */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: 'linear-gradient(to bottom, transparent, #F7F5F0)' }}
        aria-hidden="true"
      />
    </section>
  );
}