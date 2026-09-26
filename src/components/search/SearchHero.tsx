'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { EASE_OUT_EXPO, Eyebrow, RevealText } from '@/components/motion/Reveal';
import { HeroFilm } from './HeroFilm';

interface SearchHeroProps {
  total: number;
  districts: number;
  fromPrice: number | null;
  loading: boolean;
}

function Stat({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay, ease: EASE_OUT_EXPO }}
      className="min-w-0"
    >
      <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/45">{label}</dt>
      <dd className="mt-1 text-xl font-extrabold tracking-tight text-white sm:text-2xl">{value}</dd>
    </motion.div>
  );
}

/** Dark editorial band that opens the search page; the filter bar docks over its lower edge */
export function SearchHero({ total, districts, fromPrice, loading }: SearchHeroProps) {
  const from = fromPrice ? `LKR ${fromPrice >= 1_000_000 ? `${+(fromPrice / 1_000_000).toFixed(1)} Mn` : fromPrice.toLocaleString('en-LK')}` : '—';

  return (
    <section className="relative isolate overflow-hidden bg-navy-950 pb-24 pt-28 text-white sm:pb-28 sm:pt-32">
      {/* Backdrop: aerial film under a navy grade, a faint survey grid and a warm light leak */}
      <HeroFilm />
      <div aria-hidden="true" className="search-film-grade absolute inset-0 -z-10" />
      <div aria-hidden="true" className="intro-grid absolute inset-0 -z-10 opacity-40" />
      <div aria-hidden="true" className="search-glow absolute -right-40 -top-40 -z-10 h-[520px] w-[520px] rounded-full opacity-70" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 -z-10 h-px bg-gradient-to-r from-transparent via-amber-500/40 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Eyebrow tone="dark">Property Discovery</Eyebrow>
        <RevealText
          as="h1"
          text={[{ text: 'Find the place ' }, { text: "you'll call home.", className: 'text-amber-400' }]}
          className="mt-4 max-w-3xl text-[2.6rem] font-extrabold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl"
          delay={0.05}
        />
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.35, ease: EASE_OUT_EXPO }}
          className="mt-5 max-w-xl text-[15px] leading-relaxed text-white/65 sm:text-base"
        >
          Houses, land and investment property across Sri Lanka, each one checked and presented by a
          BOAM broker.
        </motion.p>

        <dl className="mt-9 grid max-w-lg grid-cols-3 gap-6 border-t border-white/10 pt-6">
          <Stat value={loading ? '—' : String(total)} label="Listings" delay={0.5} />
          <Stat value={loading ? '—' : String(districts)} label="Districts" delay={0.6} />
          <Stat value={loading ? '—' : from} label="Starting at" delay={0.7} />
        </dl>
      </div>
    </section>
  );
}
