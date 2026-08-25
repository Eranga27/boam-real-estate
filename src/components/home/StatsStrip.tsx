'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Home, Compass, MessageSquare, ShieldCheck } from 'lucide-react';

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

export function StatsStrip() {
  return (
    <section aria-label="BOAM Advantage" className="relative z-10 -mt-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px overflow-hidden rounded-3xl bg-navy-100/80 shadow-xl border border-white/60">
        {CAPABILITIES.map((item, i) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="bg-white/95 backdrop-blur-md px-6 py-6 transition-colors hover:bg-navy-50/60"
            >
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-navy-50 text-navy-900 ring-1 ring-navy-100">
                  <Icon className="h-5 w-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-navy-950 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-0.5 text-xs font-medium text-navy-800/70 leading-snug">
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}