'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon } from 'lucide-react';
import { PropertyCard } from '../property/PropertyCard';
import { EASE_OUT_EXPO, Eyebrow, Reveal, RevealText } from '@/components/motion/Reveal';

export function FeaturedProperties({ properties = [], loading = false }: { properties?: any[], loading?: boolean }) {
  const featured = properties.slice(0, 3);

  return (
    <section className="relative bg-white px-4 py-16 sm:px-6 lg:px-8 lg:py-24 overflow-hidden">
      <div className="mx-auto max-w-7xl">
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <Eyebrow>Handpicked Listings</Eyebrow>
          <RevealText
            text="Featured Properties"
            className="mt-3 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl"
            delay={0.1}
          />
          <Reveal delay={0.3} y={16}>
            <p className="mt-2.5 max-w-xl text-base leading-relaxed text-navy-800/70">
              A curated selection of homes and land across Sri Lanka.
            </p>
          </Reveal>
        </div>
        <Reveal delay={0.4} y={16}>
        <Link
          href="/search"
          className="group inline-flex items-center gap-2 rounded-full border border-navy-200 px-5 py-2.5 text-sm font-bold text-navy-900 transition-all hover:border-navy-900 hover:bg-navy-900 hover:text-white"
        >
          <span>View All</span>
          <ArrowRightIcon
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            aria-hidden="true"
          />
        </Link>
        </Reveal>
      </div>

      <div className="-mx-4 mt-10 flex [perspective:1400px] snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-4 rail-scroll sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 sm:pb-0 lg:grid-cols-3">
        {loading && featured.length === 0
          ? // Skeleton cards while live listings load on a first, uncached visit
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="min-w-[290px] max-w-[88vw] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
              >
                <div className="animate-pulse overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-navy-100/90">
                  <div className="aspect-[16/10] bg-navy-100 sm:aspect-[4/3]" />
                  <div className="space-y-3 p-4 sm:p-5">
                    <div className="h-3 w-16 rounded-full bg-navy-100" />
                    <div className="h-4 w-3/4 rounded-full bg-navy-100" />
                    <div className="h-3 w-1/2 rounded-full bg-navy-100" />
                  </div>
                </div>
              </div>
            ))
          : featured.map((property, i) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 70, rotateX: 14, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 1.1, delay: i * 0.12, ease: EASE_OUT_EXPO }}
                style={{ transformOrigin: '50% 100%' }}
                className="min-w-[290px] max-w-[88vw] shrink-0 snap-start sm:min-w-0 sm:max-w-none sm:shrink"
              >
                <PropertyCard property={property} />
              </motion.div>
            ))}
      </div>
      </div>
    </section>
  );
}
