'use client';
import React, { useState } from 'react';
import Link from 'next/link';

import { motion } from 'framer-motion';
import {
  BathIcon,
  BedDoubleIcon,
  HeartIcon,
  LandPlotIcon,
  MapPinIcon,
  RulerIcon } from
'lucide-react';
import type { Property } from '@/types/property';
import { formatDaysAgo, formatNumber, formatPrice, getImageUrl } from '@/lib/format';

interface PropertyCardProps {
  property: Property;
  view?: 'grid' | 'list';
}

export function ListingBadge({ listingType }: {listingType: Property['listingType'];}) {
  const isSale = listingType === 'sale';
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm ${
      isSale ? 'bg-amber-500 text-navy-900' : 'bg-sea-500'}`
      }>
      
      {isSale ? 'For Sale' : 'For Rent'}
    </span>);

}

function StatItem({
  icon: Icon,
  value,
  label




}: {icon: typeof BedDoubleIcon;value: string;label: string;}) {
  return (
    <div className="flex min-w-0 items-center gap-1.5">
      <Icon className="h-4 w-4 shrink-0 text-navy-300" aria-hidden="true" />
      <span className="truncate text-[13px] font-semibold text-navy-800">
        {value}
        <span className="ml-1 font-medium text-navy-800/50">{label}</span>
      </span>
    </div>);

}

export function PropertyCard({ property, view = 'grid' }: PropertyCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const isList = view === 'list';

  const stats = (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-navy-100/70 pt-3 ${
        isList ? 'sm:gap-x-6' : ''
      }`}
    >
      {property.beds > 0 && (
        <StatItem icon={BedDoubleIcon} value={String(property.beds)} label="beds" />
      )}
      {property.baths > 0 && (
        <StatItem icon={BathIcon} value={String(property.baths)} label="baths" />
      )}
      {property.landSize > 0 && (
        <StatItem icon={LandPlotIcon} value={String(property.landSize)} label="perch" />
      )}
      {property.houseSize > 0 && (
        <StatItem icon={RulerIcon} value={formatNumber(property.houseSize)} label="sq ft" />
      )}
    </div>
  );

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 350, damping: 25 }}
      className={`group flex overflow-hidden rounded-2xl bg-white shadow-card border border-navy-100/80 transition-all duration-300 hover:shadow-lift hover:border-navy-200/90 ${
        isList ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      {/* 1. Image Container */}
      <div
        className={`relative overflow-hidden bg-navy-100/50 ${
          isList ? 'aspect-[4/3] sm:aspect-auto sm:w-[300px] sm:shrink-0' : 'aspect-[4/3]'
        }`}
      >
        <Link href={`/properties/${property.id}`} aria-label={property.title}>
          <img
            src={getImageUrl(property.images[imageIndex])}
            alt={property.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/10 to-transparent" />
        </Link>

        {/* Listing Type Badge */}
        <div className="absolute left-3.5 top-3.5">
          <ListingBadge listingType={property.listingType} />
        </div>

        {/* Save / Favorite Action */}
        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-label={saved ? `Remove ${property.title} from saved` : `Save ${property.title}`}
          aria-pressed={saved}
          className="absolute right-3.5 top-3.5 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-navy-800 shadow-sm backdrop-blur transition-all duration-200 hover:scale-110 hover:bg-white"
        >
          <motion.span
            key={String(saved)}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <HeartIcon
              className={`h-[18px] w-[18px] transition-colors ${
                saved ? 'fill-red-500 text-red-500' : 'text-navy-700'
              }`}
              aria-hidden="true"
            />
          </motion.span>
        </button>

        {/* Price Tag Prominent Display */}
        <div className="absolute bottom-3.5 left-4">
          <p className="text-xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
            {formatPrice(property.price, property.listingType)}
          </p>
        </div>

        {/* Multi-image indicator dots */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3.5 right-4 flex gap-1.5">
            {property.images.slice(0, 5).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === imageIndex ? 'w-4 bg-amber-500' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* 2. Content & Specs Details */}
      <div className="flex flex-1 flex-col justify-between gap-3.5 p-5">
        <div>
          {/* Location First Hierarchy */}
          <p className="flex items-center gap-1.5 text-xs font-semibold text-navy-800/60">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            <span>{property.district}, {property.city}</span>
            <span className="mx-1 text-navy-300">•</span>
            <span className="font-bold uppercase tracking-wider text-sea-600 text-[10px]">{property.type}</span>
          </p>

          {/* Title Second Hierarchy */}
          <h3 className="mt-2 text-base font-bold leading-snug text-navy-900 transition-colors group-hover:text-navy-700">
            <Link href={`/properties/${property.id}`}>
              {property.title}
            </Link>
          </h3>
        </div>

        {isList && (
          <p className="line-clamp-2 text-sm leading-relaxed text-navy-800/60">
            {property.description}
          </p>
        )}

        {/* 3. Specs & Inquiry Footer */}
        <div className="mt-auto space-y-3 pt-1">
          {stats}
          <div className="flex items-center justify-between gap-3 pt-1">
            <span className="text-[11px] font-medium text-navy-800/45">
              {formatDaysAgo(property.listedDaysAgo)}
            </span>
            <Link
              href={`/properties/${property.id}`}
              className="rounded-full border border-navy-200 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-navy-800 transition-all duration-200 hover:border-navy-900 hover:bg-navy-900 hover:text-white"
            >
              Inquire
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}