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

  const stats =
  <div
    className={`flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-navy-100 pt-3 ${
    isList ? 'sm:gap-x-6' : ''}`
    }>
    
      {property.beds > 0 &&
    <StatItem icon={BedDoubleIcon} value={String(property.beds)} label="beds" />
    }
      {property.baths > 0 &&
    <StatItem icon={BathIcon} value={String(property.baths)} label="baths" />
    }
      {property.landSize > 0 &&
    <StatItem icon={LandPlotIcon} value={String(property.landSize)} label={['ratnapura-land', 'kalutara-estate-land'].includes(property.id) ? 'acres' : 'perches'} />
    }
      {property.houseSize > 0 &&
    <StatItem icon={RulerIcon} value={formatNumber(property.houseSize)} label="sq ft" />
    }
    </div>;


  return (
    <motion.article
      whileHover={{ y: -6 }}
      transition={{ type: 'spring', stiffness: 320, damping: 26 }}
      className={`group flex overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-100 transition-shadow hover:shadow-lift ${
      isList ? 'flex-col sm:flex-row' : 'flex-col'}`
      }>
      
      <div
        className={`relative overflow-hidden bg-navy-100 ${
        isList ? 'aspect-[4/3] sm:aspect-auto sm:w-[300px] sm:shrink-0' : 'aspect-[4/3]'}`
        }>
        
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
            <div className="h-full w-full flex items-center justify-center text-navy-400 bg-navy-900/40 font-medium text-xs">
              No Preview
            </div>
          )}
          
          <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/5 to-transparent" />
        </Link>

        <div className="absolute left-3 top-3">
          <ListingBadge listingType={property.listingType} />
        </div>

        <button
          type="button"
          onClick={() => setSaved((v) => !v)}
          aria-label={saved ? `Remove ${property.title} from saved` : `Save ${property.title}`}
          aria-pressed={saved}
          className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-white/90 backdrop-blur transition-all hover:scale-110 hover:bg-white">
          
          <motion.span
            key={String(saved)}
            initial={{ scale: 0.6 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}>
            
            <HeartIcon
              className={`h-[18px] w-[18px] transition-colors ${
              saved ? 'fill-red-500 text-red-500' : 'text-navy-700'}`
              }
              aria-hidden="true" />
            
          </motion.span>
        </button>

        <p className="absolute bottom-3 left-4 text-lg font-extrabold tracking-tight text-white drop-shadow">
          {formatPrice(property.price, property.listingType)}
        </p>

        {property.images.length > 1 &&
        <div className="absolute bottom-3.5 right-4 flex gap-1.5">
            {property.images.slice(0, 5).map((_, i) =>
          <button
            key={i}
            type="button"
            onClick={() => setImageIndex(i)}
            aria-label={`View image ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${
            i === imageIndex ? 'w-4 bg-amber-500' : 'w-1.5 bg-white/60 hover:bg-white'}`
            } />

          )}
          </div>
        }
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sea-600">
            {property.type}
          </p>
          <h3 className="mt-1.5 text-[17px] font-bold leading-snug text-navy-800">
            <Link
              href={`/properties/${property.id}`}
              className="transition-colors hover:text-navy-600">
              
              {property.title}
            </Link>
          </h3>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-navy-800/55">
            <MapPinIcon className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            {property.district}, {property.city}
          </p>
        </div>

        {isList &&
        <p className="line-clamp-2 text-sm leading-relaxed text-navy-800/60">
            {property.description}
          </p>
        }

        <div className="mt-auto space-y-3">
          {stats}
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-navy-800/45">
              {formatDaysAgo(property.listedDaysAgo)}
            </span>
            <Link
              href={`/properties/${property.id}`}
              className="rounded-full border border-navy-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy-800 transition-all hover:border-navy-800 hover:bg-navy-800 hover:text-white">
              
              Inquire
            </Link>
          </div>
        </div>
      </div>
    </motion.article>);

}