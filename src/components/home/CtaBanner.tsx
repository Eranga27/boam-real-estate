'use client';
import React from 'react';
import Link from 'next/link';

import { ArrowRightIcon, PhoneIcon } from 'lucide-react';

export function CtaBanner() {
  return (
    <section className="relative px-4 pb-20 sm:px-6 lg:px-8 lg:pb-28">
      {/* HowItWorks → CTA: very soft top hint */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-navy-50/20 to-transparent" />

      <div className="relative mx-auto max-w-7xl overflow-hidden rounded-4xl bg-navy-900 px-6 py-14 text-center sm:px-12 lg:py-20">
        <div
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-navy-600/40 blur-3xl"
          aria-hidden="true" />
        
        <div
          className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-amber-500/15 blur-3xl"
          aria-hidden="true" />
        
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-[2.75rem] sm:leading-[1.1]">
            Ready to find your home?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/65">
            Browse the current portfolio, or tell a broker what you're looking for and we'll bring
            the matches to you — including the ones not yet published.
          </p>
          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/search"
              className="group inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-7 py-3.5 text-sm font-bold text-navy-900 transition-all hover:-translate-y-0.5 hover:bg-amber-400 sm:w-auto">
              
              Browse Listings
              <ArrowRightIcon
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true" />
              
            </Link>
            <a
              href="tel:+94777801470"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 px-7 py-3.5 text-sm font-bold text-white transition-all hover:border-white hover:bg-white/10 sm:w-auto">
              
              <PhoneIcon className="h-4 w-4" aria-hidden="true" />
              Talk to a Broker
            </a>
          </div>
        </div>
      </div>
    </section>);

}