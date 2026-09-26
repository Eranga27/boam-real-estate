'use client';

import React from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Heart, MessageCircle, RotateCcw, SearchX } from 'lucide-react';
import { ListingCard } from '@/components/listing/ListingCard';
import { EASE_OUT_EXPO } from '@/components/motion/Reveal';
import { getWhatsAppHref } from '@/lib/contact';
import type { Listing } from '@/lib/listings';

interface ResultsGridProps {
  listings: Listing[];
  visible: number;
  onShowMore: () => void;
  /** Whether the lead result gets the wide editorial tile */
  feature: boolean;
}

/** Position of the concierge tile: closing the third row on desktop */
const CONCIERGE_AFTER = 7;

/**
 * Cards present on first paint rise in with a CSS animation (.results-rise), which starts
 * before hydration; cards that arrive later (filters, show more) animate in with Framer,
 * which also glides the remaining cards into their new places.
 */
const itemMotion = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, scale: 0.94, transition: { duration: 0.25 } },
};

function ConciergeTile() {
  return (
    <div className="relative flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-[26px] bg-navy-950 p-7 text-white shadow-card">
      <div aria-hidden="true" className="search-glow absolute -bottom-32 -right-32 h-80 w-80 rounded-full opacity-80" />
      <div aria-hidden="true" className="intro-grid absolute inset-0 opacity-60" />
      <div className="relative">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-amber-400">BOAM Concierge</p>
        <h3 className="mt-3 text-[26px] font-extrabold leading-tight tracking-tight">
          Not seeing <span className="text-amber-400">the one?</span>
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/65">
          Tell us what you&apos;re after. Our brokers search listings that never reach the market and
          call you back with a shortlist.
        </p>
      </div>
      <div className="relative mt-6 flex flex-col gap-2.5">
        <Link
          href="/request"
          className="group inline-flex h-12 items-center justify-between rounded-full bg-amber-500 pl-5 pr-2 text-sm font-extrabold text-navy-950 transition hover:bg-amber-400"
        >
          Request a property
          <span className="grid h-8 w-8 place-items-center rounded-full bg-navy-950 text-amber-400 transition-transform duration-500 group-hover:translate-x-0.5">
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </span>
        </Link>
        <a
          href={getWhatsAppHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-12 items-center justify-center gap-2 rounded-full text-sm font-bold text-white/85 ring-1 ring-white/15 transition hover:bg-white/5 hover:text-white"
        >
          <MessageCircle className="h-4 w-4" aria-hidden="true" />
          Chat on WhatsApp
        </a>
      </div>
    </div>
  );
}

export function ResultsGrid({ listings, visible, onShowMore, feature }: ResultsGridProps) {
  const shown = listings.slice(0, visible);
  const conciergeAt = shown.length > CONCIERGE_AFTER ? CONCIERGE_AFTER : shown.length;

  const items: React.ReactNode[] = [];
  shown.forEach((listing, i) => {
    if (i === conciergeAt) {
      items.push(
        <motion.li key="concierge" layout="position" {...itemMotion} transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}>
          <ConciergeTile />
        </motion.li>
      );
    }
    const isFeature = feature && i === 0;
    items.push(
      <motion.li
        key={listing.id}
        layout="position"
        {...itemMotion}
        transition={{ duration: 0.8, delay: (i % 3) * 0.06, ease: EASE_OUT_EXPO, layout: { duration: 0.6, ease: EASE_OUT_EXPO } }}
        className={isFeature ? 'lg:col-span-2' : undefined}
      >
        <ListingCard listing={listing} variant={isFeature ? 'feature' : 'grid'} eager={i < 3} />
      </motion.li>
    );
  });
  if (conciergeAt === shown.length) {
    items.push(
      <motion.li key="concierge" layout="position" {...itemMotion} transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}>
        <ConciergeTile />
      </motion.li>
    );
  }

  const progress = listings.length ? Math.min(1, shown.length / listings.length) : 1;

  return (
    <>
      <ul className="results-rise grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
        <AnimatePresence mode="popLayout" initial={false}>
          {items}
        </AnimatePresence>
      </ul>

      {listings.length > 0 && (
        <div className="mt-14 flex flex-col items-center gap-4">
          <p className="text-[13px] font-semibold text-navy-800/60">
            Showing {shown.length} of {listings.length} {listings.length === 1 ? 'property' : 'properties'}
          </p>
          <div className="h-1 w-48 overflow-hidden rounded-full bg-navy-100">
            <div className="h-full origin-left rounded-full bg-amber-500 transition-transform duration-700 ease-out" style={{ transform: `scaleX(${progress})` }} />
          </div>
          {shown.length < listings.length && (
            <button
              type="button"
              onClick={onShowMore}
              className="group mt-2 inline-flex h-12 items-center gap-3 rounded-full bg-navy-950 pl-6 pr-2 text-sm font-bold text-white shadow-lift transition hover:bg-navy-900 active:scale-[0.98]"
            >
              Show more properties
              <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-500 text-navy-950 transition-transform duration-500 group-hover:rotate-90">
                <ArrowRight className="h-4 w-4 rotate-90" aria-hidden="true" />
              </span>
            </button>
          )}
        </div>
      )}
    </>
  );
}

export function EmptyResults({ savedOnly, onClear }: { savedOnly: boolean; onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
      className="mx-auto max-w-xl rounded-[28px] bg-white px-6 py-14 text-center shadow-card ring-1 ring-navy-100 sm:px-12"
    >
      <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-navy-50">
        {savedOnly ? <Heart className="h-7 w-7 text-amber-500" aria-hidden="true" /> : <SearchX className="h-7 w-7 text-navy-400" aria-hidden="true" />}
      </span>
      <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-navy-950">
        {savedOnly ? 'Your shortlist is empty' : 'Nothing matches just yet'}
      </h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-navy-800/60">
        {savedOnly
          ? 'Tap the heart on any listing to keep it here while you compare.'
          : 'Try widening the price or area, or let our brokers find it for you. Many properties sell before they are ever listed.'}
      </p>
      <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-5 text-sm font-bold text-navy-900 ring-1 ring-navy-200 transition hover:ring-navy-400"
        >
          <RotateCcw className="h-4 w-4" aria-hidden="true" />
          {savedOnly ? 'Browse all properties' : 'Reset filters'}
        </button>
        {!savedOnly && (
          <Link href="/request" className="inline-flex h-11 items-center gap-2 rounded-full bg-amber-500 px-5 text-sm font-extrabold text-navy-950 transition hover:bg-amber-400">
            Request a property
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )}
      </div>
    </motion.div>
  );
}

export function GridSkeleton() {
  return (
    <ul className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6" aria-busy="true" aria-label="Loading properties">
      {Array.from({ length: 6 }).map((_, i) => (
        <li key={i} className="rounded-[26px] bg-white p-2 ring-1 ring-navy-100">
          <div className="skeleton-shimmer aspect-[4/3] rounded-[20px]" />
          <div className="space-y-2.5 px-3 pb-3 pt-4">
            <div className="skeleton-shimmer h-5 w-1/3 rounded-full" />
            <div className="skeleton-shimmer h-3.5 w-3/4 rounded-full" />
            <div className="skeleton-shimmer h-3 w-1/2 rounded-full" />
          </div>
        </li>
      ))}
    </ul>
  );
}
