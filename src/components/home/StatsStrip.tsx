'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { stats } from '@/data/locations';

export function StatsStrip() {
  return (
    <div className="relative z-10">
      {/* Hero → Stats: very subtle dissolve, no visible band */}
      <div className="pointer-events-none absolute inset-x-0 -top-8 h-16 bg-gradient-to-b from-white/0 via-white/30 to-white/0" />

      <section aria-label="Company track record" className="relative -mt-14 px-4 sm:px-6 lg:px-8 pb-2">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-px overflow-hidden rounded-3xl bg-navy-100 shadow-float lg:grid-cols-4">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white px-5 py-7 text-center transition-colors hover:bg-navy-50 sm:py-9"
            >
              <p className="text-3xl font-extrabold tracking-tight text-navy-800 sm:text-4xl">
                {stat.value}
              </p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.16em] text-navy-800/45">
                {stat.label}
              </p>
            </motion.div>
          ))}
        </div>
      </section>
    </div>);

}