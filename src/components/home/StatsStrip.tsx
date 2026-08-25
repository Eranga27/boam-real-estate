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
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl bg-white shadow-[0_12px_40px_-12px_rgba(14,42,73,0.18)] border border-navy-100/80">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-navy-100/60">
          {CAPABILITIES.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="group px-6 py-6 transition-colors duration-200 hover:bg-amber-50/40"
              >
                <div className="flex items-center gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-navy-50 ring-1 ring-navy-100 group-hover:bg-amber-500/10 transition-colors duration-200">
                    <Icon className="h-5 w-5 text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold text-navy-950 tracking-tight leading-tight">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs font-medium text-navy-800/60 leading-snug">
                      {item.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
