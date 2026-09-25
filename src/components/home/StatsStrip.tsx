'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, MessageSquare, ShieldCheck } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/components/motion/Reveal';

const CAPABILITIES = [
  {
    icon: Home,
    title: 'Homes & Land',
    description: 'Villas, houses and plot listings',
  },
  {
    icon: Compass,
    title: 'Sri Lanka-wide Discovery',
    description: 'Explore properties across all key regions',
  },
  {
    icon: MessageSquare,
    title: 'Broker-Assisted Enquiries',
    description: 'Direct agent communication & guidance',
  },
  {
    icon: ShieldCheck,
    title: 'Property Verification',
    description: 'Inspected listings & verified details',
  },
];

const VIEWPORT = { once: true, margin: '0px 0px -8% 0px' } as const;

export function StatsStrip() {
  return (
    <section aria-label="BOAM Advantage" className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
      {/* The card rises over the hero's lower edge as the page starts to scroll */}
      <motion.div
        initial={{ opacity: 0, y: 40, scale: 0.97 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 1, ease: EASE_OUT_EXPO }}
        className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_-12px_rgba(14,42,73,0.18)] border border-navy-100/80"
      >
        {/* Gold light sweeping across the top edge */}
        <motion.span
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[2px] origin-left"
          style={{ background: 'linear-gradient(90deg, transparent, #F4A300 30%, #FFD98A 50%, #F4A300 70%, transparent)' }}
          initial={{ scaleX: 0, opacity: 1 }}
          whileInView={{ scaleX: 1, opacity: [1, 1, 0.35] }}
          viewport={VIEWPORT}
          transition={{ duration: 1.6, delay: 0.25, ease: EASE_OUT_EXPO }}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-navy-100/60">
          {CAPABILITIES.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={{ duration: 0.8, delay: 0.2 + i * 0.09, ease: EASE_OUT_EXPO }}
                className="group px-6 py-6 transition-colors duration-300 hover:bg-amber-50/40"
              >
                <div className="flex items-center gap-3.5">
                  <motion.div
                    initial={{ scale: 0.4, rotate: -25, opacity: 0 }}
                    whileInView={{ scale: 1, rotate: 0, opacity: 1 }}
                    viewport={VIEWPORT}
                    transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.3 + i * 0.09 }}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-navy-50 ring-1 ring-navy-100 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:bg-amber-500/10 group-hover:ring-amber-300"
                  >
                    <Icon className="h-5 w-5 text-amber-500" />
                  </motion.div>
                  <div>
                    <h3 className="text-sm font-extrabold text-navy-950 tracking-tight leading-tight">{item.title}</h3>
                    <p className="mt-0.5 text-xs font-medium text-navy-800/60 leading-snug">{item.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
