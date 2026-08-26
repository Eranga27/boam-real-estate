'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRightIcon, PhoneIcon } from 'lucide-react';
import { getPhoneHref } from '@/lib/contact';

export function CtaBanner() {
  return (
    <section
      className="relative py-24 sm:py-28 lg:py-36 overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #0C1F35 0%, #0A1828 60%, #091523 100%)' }}
    >
      {/* Subtle warm-gold ambient radial glow — left */}
      <div
        className="pointer-events-none absolute -left-40 top-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full opacity-[0.12]"
        style={{ background: 'radial-gradient(circle, #C9972A 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Subtle navy ambient radial — right */}
      <div
        className="pointer-events-none absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full opacity-[0.15]"
        style={{ background: 'radial-gradient(circle, #1a3a5c 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      {/* Very subtle thin gold horizontal accent line at top */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-px opacity-20"
        style={{ background: 'linear-gradient(to right, transparent, #C9972A 30%, #C9972A 70%, transparent)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.65, ease: 'easeOut' }}
          className="mx-auto max-w-3xl"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.28em] text-amber-400/80">
            Start Your Discovery
          </p>

          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl leading-[1.1]">
            Ready to find your place in{' '}
            <span className="text-amber-400">Sri Lanka?</span>
          </h2>

          <p className="mt-5 text-base sm:text-lg leading-relaxed text-white/65 max-w-xl mx-auto font-normal">
            Explore available properties or speak directly with BOAM about what you&apos;re looking for.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href="/search"
              className="group inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-amber-500 px-8 py-4 text-sm font-bold text-navy-950 transition-all duration-200 hover:bg-amber-400 hover:shadow-[0_8px_32px_-8px_rgba(201,151,42,0.7)] sm:w-auto"
            >
              <span>Browse Properties</span>
              <ArrowRightIcon
                className="h-4 w-4 transition-transform group-hover:translate-x-1"
                aria-hidden="true"
              />
            </Link>

            <a
              href={getPhoneHref()}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 px-8 py-4 text-sm font-bold text-white/90 transition-all duration-200 hover:border-white/40 hover:bg-white/8 hover:text-white sm:w-auto"
            >
              <PhoneIcon className="h-4 w-4 text-amber-400/80" aria-hidden="true" />
              <span>Talk to a Broker</span>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
