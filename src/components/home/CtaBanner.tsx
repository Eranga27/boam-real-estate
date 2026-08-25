'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, PhoneIcon } from 'lucide-react';

export function CtaBanner() {
  return (
    <section className="bg-navy-950 py-20 sm:py-24 lg:py-32 relative overflow-hidden">
      {/* Subtle Warm Gold & Ambient Navy Vignette */}
      <div
        className="pointer-events-none absolute -left-32 -top-32 h-96 w-96 rounded-full bg-amber-500/10 blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -right-32 -bottom-32 h-96 w-96 rounded-full bg-navy-600/30 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-amber-400">
            Start Your Discovery
          </p>

          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Ready to find your place in Sri Lanka?
          </h2>

          <p className="mt-5 text-base sm:text-lg lg:text-xl leading-relaxed text-white/80 max-w-xl mx-auto font-normal">
            Explore available properties or speak directly with BOAM about what you're looking for.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-amber-500 px-8 py-4 text-sm font-bold text-navy-950 transition-all duration-200 hover:bg-amber-400 hover:shadow-[0_8px_24px_-6px_rgba(244,163,0,0.6)] sm:w-auto"
            >
              <span>Browse Properties</span>
              <ArrowRightIcon
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            <a
              href="tel:+94777801470"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/20 px-8 py-4 text-sm font-bold text-white transition-all duration-200 hover:border-white hover:bg-white/10 sm:w-auto"
            >
              <PhoneIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
              <span>Talk to a Broker</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}