'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { MapPinOff } from 'lucide-react';
import { ListingCard } from '@/components/listing/ListingCard';
import { EASE_OUT_EXPO } from '@/components/motion/Reveal';
import type { PropertyMapItem } from '@/components/home/SriLankaMap';
import type { Listing } from '@/lib/listings';

const SriLankaMap = dynamic(() => import('@/components/home/SriLankaMap').then((m) => m.SriLankaMap), {
  ssr: false,
  loading: () => <div className="skeleton-shimmer h-full min-h-[360px] w-full rounded-3xl" />,
});

interface MapResultsProps {
  listings: Listing[];
  /** Space taken by the site header and the docked filter bar */
  stickyTop: number;
}

function toMapItem(l: Listing): PropertyMapItem {
  return {
    id: l.id,
    title: l.title,
    propertyType: l.propertyType,
    price: l.price,
    city: l.city,
    address: l.address,
    district: l.district,
    saleOrRent: l.saleOrRent,
    images: l.image ? [l.image] : [],
    lat: l.lat as number,
    lng: l.lng as number,
  };
}

/** Split view: listings beside a sticky map; hovering a card lights up its pin */
export function MapResults({ listings, stickyTop }: MapResultsProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

  const mapped = useMemo(() => listings.filter((l) => l.lat != null && l.lng != null).map(toMapItem), [listings]);
  const unmapped = listings.length - mapped.length;

  const onHover = useCallback((id: string | null) => setHoveredId(id), []);

  // Picking a pin brings its card into view beside the map (wide screens, where they sit side by side)
  const onSelect = useCallback((id: string) => {
    setSelectedId(id);
    if (!window.matchMedia('(min-width: 1024px)').matches) return;
    itemRefs.current.get(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  useEffect(() => {
    if (selectedId && !listings.some((l) => l.id === selectedId)) setSelectedId(null);
  }, [listings, selectedId]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        className="order-1 lg:order-2"
      >
        <div className="lg:sticky" style={{ top: stickyTop, ['--map-offset' as string]: `${stickyTop + 24}px` }}>
          <SriLankaMap
            properties={mapped}
            hoveredId={hoveredId}
            selectedId={selectedId}
            onSelectProperty={onSelect}
            heightClassName="h-[52vh] min-h-[340px] lg:h-[calc(100vh-var(--map-offset))] lg:min-h-[480px]"
          />
          {unmapped > 0 && (
            <p className="mt-3 flex items-center gap-2 text-xs font-medium text-navy-800/55">
              <MapPinOff className="h-3.5 w-3.5 text-navy-400" aria-hidden="true" />
              {unmapped} {unmapped === 1 ? 'listing has' : 'listings have'} no map location yet and {unmapped === 1 ? 'appears' : 'appear'} in the list only.
            </p>
          )}
        </div>
      </motion.div>

      <ul className="order-2 space-y-4 lg:order-1">
        {listings.map((listing, i) => (
          <motion.li
            key={listing.id}
            ref={(el) => {
              if (el) itemRefs.current.set(listing.id, el);
              else itemRefs.current.delete(listing.id);
            }}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: Math.min(i, 6) * 0.05, ease: EASE_OUT_EXPO }}
          >
            <ListingCard listing={listing} variant="row" onHover={onHover} active={listing.id === selectedId} eager={i < 3} />
          </motion.li>
        ))}
      </ul>
    </div>
  );
}
