'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { FileText, Compass, UserCheck } from 'lucide-react';

const TRUST_ITEMS = [
  {
    number: '01',
    icon: FileText,
    title: 'Clear Property Details',
    description: 'Present useful property information clearly so buyers can understand what they are considering.',
  },
  {
    number: '02',
    icon: Compass,
    title: 'Local Context',
    description: 'Explore homes and land across Sri Lanka with location-focused discovery.',
  },
  {
    number: '03',
    icon: UserCheck,
    title: 'Direct Broker Guidance',
    description: 'Connect directly with BOAM for enquiries, viewings and the next step.',
  },
];

export function WhyChooseUs() {
  return (
    <section
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #F7F5F0 0%, #F2EFE9 100%)' }}
    >
      {/* Very subtle oversized BOAM monogram watermark */}
      <div
        className="pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 opacity-[0.03] select-none"
        aria-hidden="true"
      >
        <img
          src="/images/boamcompactmonogram.png"
          alt=""
          className="h-[600px] w-auto"
        />
      </div>

      {/* Subtle thin gold horizontal accent line */}
      <div
        className="pointer-events-none absolute left-0 right-0 top-0 h-px opacity-30"
        style={{ background: 'linear-gradient(to right, transparent, #C9972A 30%, #C9972A 70%, transparent)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Asymmetric Layout: Left heading + Right numbered list */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-start">

          {/* LEFT — Editorial Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="lg:sticky lg:top-24"
          >
            <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-amber-600">
              Why BOAM
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl leading-[1.1]">
              Good property decisions start with clarity.
            </h2>
            <p className="mt-5 text-base sm:text-lg text-navy-800/70 leading-relaxed font-normal max-w-md">
              From the first search to the next conversation, BOAM keeps property discovery simple, clear and personal.
            </p>

            {/* Subtle decorative gold rule */}
            <div className="mt-8 h-px w-16 bg-amber-500/60" />
          </motion.div>

          {/* RIGHT — Editorial numbered trust items */}
          <div className="space-y-0">
            {TRUST_ITEMS.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.number}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 0.55, delay: i * 0.1, ease: 'easeOut' }}
                  className="group relative"
                >
                  {/* Divider line above each item */}
                  <div className="h-px bg-navy-900/10 group-first:hidden" />

                  <div className="flex gap-6 py-8">
                    {/* Oversized step number */}
                    <div className="shrink-0 pt-1">
                      <span className="text-5xl font-extrabold text-amber-500/25 font-mono leading-none select-none">
                        {item.number}
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white shadow-sm border border-navy-100/80 group-hover:bg-navy-950 transition-colors duration-300">
                          <Icon className="h-4 w-4 text-amber-500 group-hover:text-amber-400 transition-colors duration-300" />
                        </div>
                        <h3 className="text-lg font-extrabold text-navy-950 tracking-tight">
                          {item.title}
                        </h3>
                      </div>
                      <p className="text-sm leading-relaxed text-navy-700/70 font-medium pl-[44px]">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* Final closing divider */}
            <div className="h-px bg-navy-900/10" />
          </div>
        </div>
      </div>

      {/* Soft dissolve into next section (HowItWorks) */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(to bottom, transparent, #F2F4F7)' }}
        aria-hidden="true"
      />
    </section>
  );
}