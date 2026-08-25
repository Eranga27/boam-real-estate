'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  BathIcon,
  BedDoubleIcon,
  ImageOffIcon,
  LandPlotIcon,
  MapPinIcon,
  RulerIcon,
} from 'lucide-react';
import type { Property } from '@/types/property';
import { formatDaysAgo, formatNumber, formatPrice, getImageUrl } from '@/lib/format';

interface PropertyCardProps {
  property: Property;
  view?: 'grid' | 'list';
}

export function ListingBadge({ listingType }: { listingType: Property['listingType'] }) {
  const isSale = listingType === 'sale';
  return (
    <span
      className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider text-navy-950 shadow-sm ${
        isSale ? 'bg-amber-500' : 'bg-sea-400 text-navy-950'
      }`}
    >
      For {isSale ? 'Sale' : 'Rent'}
    </span>
  );
}

function StatItem({
  icon: Icon,
  value,
  label,
}: {
  icon: typeof BedDoubleIcon;
  value: string;
  label: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-navy-800">
      <Icon className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
      <span className="truncate">
        {value} <span className="font-normal text-navy-800/60">{label}</span>
      </span>
    </div>
  );
}

export function PropertyCard({ property, view = 'grid' }: PropertyCardProps) {
  const [imageIndex, setImageIndex] = useState(0);
  const isList = view === 'list';

  const stats = (
    <div
      className={`flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 border-t border-navy-100/80 pt-2.5 ${
        isList ? 'sm:gap-x-6' : ''
      }`}
    >
      {property.beds > 0 && <StatItem icon={BedDoubleIcon} value={String(property.beds)} label="beds" />}
      {property.baths > 0 && <StatItem icon={BathIcon} value={String(property.baths)} label="baths" />}
      {property.landSize > 0 && (
        <StatItem
          icon={LandPlotIcon}
          value={String(property.landSize)}
          label={['ratnapura-land', 'kalutara-estate-land'].includes(property.id) ? 'acres' : 'perches'}
        />
      )}
      {property.houseSize > 0 && (
        <StatItem icon={RulerIcon} value={formatNumber(property.houseSize)} label="sq ft" />
      )}
    </div>
  );

  return (
    <motion.article
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={`group flex overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-100/90 transition-shadow hover:shadow-lift ${
        isList ? 'flex-col sm:flex-row' : 'flex-col'
      }`}
    >
      {/* Property Image Container */}
      <div
        className={`relative overflow-hidden bg-navy-900 ${
          isList ? 'aspect-[16/10] sm:aspect-auto sm:w-[280px] sm:shrink-0' : 'aspect-[16/10] sm:aspect-[4/3]'
        }`}
      >
        <Link href={`/properties/${property.id}`} aria-label={property.title}>
          {property.video ? (
            <video
              src={getImageUrl(property.video)}
              muted
              loop
              autoPlay
              playsInline
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : property.images && property.images.length > 0 ? (
            <img
              src={getImageUrl(property.images[imageIndex])}
              alt={property.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
          ) : (
            /* BOAM Refined Empty Visual State */
            <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-4 text-center">
              <div className="w-10 h-10 rounded-full bg-navy-800/80 flex items-center justify-center mb-2 border border-navy-700/50">
                <ImageOffIcon className="w-5 h-5 text-amber-400/80" aria-hidden="true" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">Image Unavailable</span>
              <span className="text-[10px] text-white/40 mt-0.5">Contact broker for details</span>
            </div>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent pointer-events-none" />
        </Link>

        {/* Listing Status Badge */}
        <div className="absolute left-3 top-3 pointer-events-none">
          <ListingBadge listingType={property.listingType} />
        </div>

        {/* Price Overlay */}
        <p className="absolute bottom-2.5 left-3.5 text-base sm:text-lg font-extrabold tracking-tight text-white drop-shadow">
          {formatPrice(property.price, property.listingType)}
        </p>

        {/* Image Dots */}
        {property.images && property.images.length > 1 && (
          <div className="absolute bottom-3 right-3 flex gap-1 pointer-events-auto">
            {property.images.slice(0, 5).map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setImageIndex(i)}
                aria-label={`View image ${i + 1}`}
                className={`h-1.5 rounded-full transition-all ${
                  i === imageIndex ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/60 hover:bg-white'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Property Info Content */}
      <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
        <div>
          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-600">
            {property.type}
          </p>
          <h3 className="mt-1 text-base sm:text-[17px] font-bold leading-snug text-navy-950 line-clamp-1">
            <Link href={`/properties/${property.id}`} className="transition-colors hover:text-amber-600">
              {property.title}
            </Link>
          </h3>
          <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-navy-800/65 line-clamp-1">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            {property.district}, {property.city}
          </p>
        </div>

        {isList && (
          <p className="mt-2 line-clamp-2 text-xs sm:text-sm leading-relaxed text-navy-800/65">
            {property.description}
          </p>
        )}

        <div className="mt-3 space-y-2.5">
          {stats}
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <span className="text-[11px] font-medium text-navy-800/50">
              {formatDaysAgo(property.listedDaysAgo)}
            </span>
            <Link
              href={`/properties/${property.id}`}
              className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-navy-950 transition-all hover:bg-amber-400 active:scale-[0.98]"
            >
              View Details
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}
