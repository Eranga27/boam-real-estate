'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Home, Trees, Building2, ChevronRight, Layers } from 'lucide-react';
import { formatFullPrice, formatPrice, getImageUrl } from '@/lib/format';
import type { PropertyMapItem } from './SriLankaMap';
import { approximateLocation } from '@/lib/geo';

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

import { fetchLivePropertiesList, getCachedProperties, onPropertiesInvalidated } from '@/lib/api';
import { EASE_OUT_EXPO, Eyebrow, Reveal, RevealText } from '@/components/motion/Reveal';

const FILTERS = [
  { value: 'All', label: 'All', icon: Layers, active: 'bg-navy-900', text: 'text-white' },
  { value: 'House', label: 'Houses', icon: Home, active: 'bg-amber-500', text: 'text-navy-950' },
  { value: 'Land', label: 'Lands', icon: Trees, active: 'bg-emerald-600', text: 'text-white' },
] as const;

const toMapItems = (rows: any[]): PropertyMapItem[] =>
  rows.map(mapToPropertyMapItem).filter((item): item is PropertyMapItem => item !== null);

/** Map pin for a listing: its saved coordinates, or its town's approximate position */
function mapToPropertyMapItem(p: any): PropertyMapItem | null {
  const exact = typeof p.latitude === 'number' && typeof p.longitude === 'number' ? { lat: p.latitude, lng: p.longitude } : null;
  const coords = exact || (typeof p.lat === 'number' && typeof p.lng === 'number' ? { lat: p.lat, lng: p.lng } : approximateLocation(p));
  if (!coords) return null;
  return {
    id: p.id,
    title: p.title,
    propertyType: p.propertyType || p.type || 'Land',
    price: p.price,
    city: p.city || p.district || 'Sri Lanka',
    address: p.address,
    images: p.images || [],
    lat: coords.lat,
    lng: coords.lng,
    description: p.description,
    saleOrRent: p.saleOrRent,
    district: p.district,
  };
}

export function PopularLocations() {
  // Database is the authoritative source of truth: start empty (matching the server HTML),
  // then fill from the browser cache and the live API after mount
  const [properties, setProperties] = useState<PropertyMapItem[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [filter, setFilter] = useState<'All' | 'House' | 'Land'>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  // Hovering a listing in the sidebar highlights its pin (or its group bubble) on the map
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef(new Map<string, HTMLDivElement>());

  useEffect(() => {
    let isMounted = true;

    const cached = getCachedProperties();
    if (cached && cached.length > 0) {
      setProperties(toMapItems(cached));
      setHasLoaded(true);
    }

    const fetchAll = async () => {
      try {
        const liveData = await fetchLivePropertiesList();
        if (isMounted && Array.isArray(liveData) && liveData.length > 0) {
          setProperties(toMapItems(liveData));
        }
      } catch {
        // Keep cached properties if the backend is unreachable; with none, pin the bundled listings
        if (isMounted) {
          const { getBundledListings } = await import('@/lib/fallbackListings');
          if (isMounted) setProperties((current) => (current.length > 0 ? current : toMapItems(getBundledListings())));
        }
      } finally {
        if (isMounted) setHasLoaded(true);
      }
    };

    fetchAll();

    const unsubscribe = onPropertiesInvalidated(fetchAll);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Memoized so the map only regroups its markers when the listings or the filter change
  const filteredProperties = useMemo(
    () =>
      properties.filter((p) => {
        if (filter === 'All') return true;
        return p.propertyType.toLowerCase() === filter.toLowerCase();
      }),
    [properties, filter]
  );

  // A pin picked on the map scrolls its listing into view (inside the list only, not the page)
  useEffect(() => {
    const list = listRef.current;
    const item = selectedId ? itemRefs.current.get(selectedId) : null;
    if (!list || !item) return;
    const top = item.offsetTop - list.offsetTop;
    if (top < list.scrollTop || top + item.offsetHeight > list.scrollTop + list.clientHeight) {
      list.scrollTo({ top: Math.max(0, top - 12), behavior: 'smooth' });
    }
  }, [selectedId]);

  const houseCount = properties.filter((p) => p.propertyType.toLowerCase() === 'house').length;
  const landCount = properties.filter((p) => p.propertyType.toLowerCase() === 'land').length;

  return (
    <section className="bg-navy-50/60 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <Eyebrow>Where We Operate</Eyebrow>
            <RevealText
              text="Explore Available Listings Across Sri Lanka"
              className="mt-3 text-3xl font-extrabold tracking-tight text-navy-900 sm:text-4xl"
              delay={0.1}
            />
            <Reveal delay={0.35} y={14}>
              <p className="mt-2 text-sm text-navy-600 max-w-xl">
                Tap a group to explore it, or a price tag to see the property. Every listing sits on its real location.
              </p>
            </Reveal>
          </div>

          {/* Filter Tabs: one highlight glides between the options */}
          <Reveal delay={0.3} y={14}>
            <div className="flex items-center gap-1 rounded-2xl bg-white p-1.5 shadow-sm border border-navy-100">
              {FILTERS.map(({ value, label, icon: Icon, active, text }) => {
                const isActive = filter === value;
                const count = value === 'All' ? properties.length : value === 'House' ? houseCount : landCount;
                return (
                  <button
                    key={value}
                    onClick={() => setFilter(value)}
                    className={`relative flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold transition-colors duration-300 ${
                      isActive ? text : 'text-navy-700 hover:bg-navy-50'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="popular-filter-pill"
                        className={`absolute inset-0 rounded-xl shadow-sm ${active}`}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <Icon className="relative h-3.5 w-3.5" />
                    <span className="relative">
                      {label}
                      {hasLoaded && ` (${count})`}
                    </span>
                  </button>
                );
              })}
            </div>
          </Reveal>
        </div>

        {/* Map & Listings Sidebar Container */}
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          {/* Main Interactive Map: settles up into place (no scaling: that would rescale every
              map tile and marker layer during the entrance) */}
          <motion.div
            className="lg:col-span-8"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
          >
            <SriLankaMap
              properties={filteredProperties}
              selectedId={selectedId}
              hoveredId={hoveredId}
              onSelectProperty={(id) => setSelectedId(id)}
            />
          </motion.div>

          {/* Quick Property Selector Sidebar: slides in beside the map */}
          <motion.div
            className="lg:col-span-4 flex flex-col h-[580px] rounded-3xl bg-white p-4 shadow-xl border border-navy-100"
            initial={{ opacity: 0, x: 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.1, delay: 0.15, ease: EASE_OUT_EXPO }}
          >
            <div className="flex items-center justify-between px-2 pb-3 border-b border-navy-100">
              <h3 className="text-sm font-extrabold text-navy-900">
                Available Locations{hasLoaded && ` (${filteredProperties.length})`}
              </h3>
              <span className="text-[11px] font-semibold text-amber-600">
                Click listing to view on map
              </span>
            </div>

            <div
              ref={listRef}
              className="mt-3 flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar"
              onMouseLeave={() => setHoveredId(null)}
            >
              {filteredProperties.map((item) => {
                const isSelected = selectedId === item.id;
                const isHouse = item.propertyType.toLowerCase() === 'house';

                return (
                  <div
                    key={item.id}
                    ref={(el) => {
                      if (el) itemRefs.current.set(item.id, el);
                      else itemRefs.current.delete(item.id);
                    }}
                    onClick={() => setSelectedId(item.id)}
                    onMouseEnter={() => setHoveredId(item.id)}
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
          </motion.div>
        </div>
      </div>
    </section>
  );
}