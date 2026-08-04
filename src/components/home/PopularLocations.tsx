'use client';
import React from 'react';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { ArrowUpRightIcon } from 'lucide-react';
import { locationTiles } from '@/data/locations';

export function PopularLocations() {
  const [primary, ...rest] = locationTiles;

  return (
    <section className="bg-navy-50/60 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
            Where we operate
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-800 sm:text-[2.5rem]">
            Popular Sri Lanka locations
          </h2>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-3 lg:grid-rows-2">
          <LocationTileCard tile={primary} className="lg:row-span-2 lg:min-h-[520px]" large />
          {rest.map((tile, i) =>
          <LocationTileCard key={tile.city} tile={tile} delay={(i + 1) * 0.08} />
          )}
        </div>
      </div>
    </section>);

}

function LocationTileCard({
  tile,
  className = '',
  large = false,
  delay = 0





}: {tile: (typeof locationTiles)[number];className?: string;large?: boolean;delay?: number;}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay }}
      className={`group relative min-h-[220px] overflow-hidden rounded-3xl bg-navy-800 ${className}`}>
      
      <Link
        href={`/search?location=${encodeURIComponent(tile.city)}`}
        className="absolute inset-0"
        aria-label={`Browse ${tile.listings} listings in ${tile.city}`}>
        
        <img
          src={tile.image}
          alt={`${tile.city}, Sri Lanka`}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-[900ms] group-hover:scale-[1.07]" />
        
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-6">
          <div>
            <h3
              className={`font-extrabold tracking-tight text-white ${
              large ? 'text-3xl sm:text-4xl' : 'text-2xl'}`
              }>
              
              {tile.city}
            </h3>
            <p className="mt-1.5 text-sm font-semibold text-amber-400">
              {tile.listings} listings
            </p>
            {large &&
            <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/70">{tile.blurb}</p>
            }
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/15 text-white backdrop-blur transition-all group-hover:bg-amber-500 group-hover:text-navy-900">
            <ArrowUpRightIcon className="h-5 w-5" aria-hidden="true" />
          </span>
        </div>
      </Link>
    </motion.div>);

}