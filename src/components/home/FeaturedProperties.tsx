'use client';
import React from 'react';
import Link from 'next/link';

import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { properties } from '@/data/properties';
import { PropertyCard } from '../property/PropertyCard';

export function FeaturedProperties({ properties = [], loading = false }: { properties?: any[], loading?: boolean }) {
  const featured = properties.slice(0, 3);

  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      <div className="pointer-events-none absolute inset-x-0 -top-12 h-16 bg-gradient-to-b from-navy-50/40 via-white/80 to-transparent" />

      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
            Handpicked this week
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-800 sm:text-[2.5rem]">
            Featured Properties
          </h2>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-navy-800/60">
            A curated selection of homes and land across Sri Lanka.
          </p>
        </div>
        <Link
          href="/search"
          className="group inline-flex items-center gap-2 rounded-full border border-navy-200 px-5 py-2.5 text-sm font-bold text-navy-800 transition-all hover:border-navy-800 hover:bg-navy-800 hover:text-white">
          
          View All
          <ArrowRightIcon
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true" />
          
        </Link>
      </div>

      <div className="-mx-4 mt-10 flex snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 rail-scroll sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {featured.map((property, i) =>
        <motion.div
          key={property.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: i * 0.1 }}
          className="min-w-[290px] max-w-[88vw] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink">
          
            <PropertyCard property={property} />
          </motion.div>
        )}
      </div>
    </section>);

}