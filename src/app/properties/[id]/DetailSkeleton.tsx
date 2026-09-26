'use client';

import React from 'react';
import { GalleryHero } from '@/components/listing-detail/GalleryHero';

/**
 * Listing page placeholder with the real page's geometry. When the visitor came from a card,
 * the card's photo is already in place, so the morph transition lands on a real image.
 */
export function DetailSkeleton({ handoff }: { handoff: { src: string; preview: string } | null }) {
  return (
    <div className="min-h-screen bg-navy-50/50 pb-32 pt-[84px] sm:pt-24 md:pb-20" aria-busy="true" aria-label="Loading property">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="skeleton-shimmer h-10 w-36 rounded-full" />
          <div className="flex gap-2">
            <div className="skeleton-shimmer h-10 w-10 rounded-full sm:w-24" />
            <div className="skeleton-shimmer h-10 w-10 rounded-full sm:w-24" />
          </div>
        </div>

        <GalleryHero
          images={handoff ? [handoff.src] : []}
          title=""
          placeholders={handoff ? 4 : 5}
          coverPreview={handoff?.preview}
        />

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-16">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="skeleton-shimmer h-6 w-20 rounded-full" />
              <div className="skeleton-shimmer h-6 w-20 rounded-full" />
            </div>
            <div className="skeleton-shimmer h-12 w-4/5 rounded-2xl" />
            <div className="skeleton-shimmer h-5 w-1/2 rounded-full" />
            <div className="skeleton-shimmer mt-6 h-11 w-64 rounded-2xl" />
            <div className="skeleton-shimmer mt-8 h-32 w-full rounded-[24px]" />
          </div>
          <div className="skeleton-shimmer hidden h-[380px] rounded-[28px] lg:block" />
        </div>
      </div>
    </div>
  );
}
