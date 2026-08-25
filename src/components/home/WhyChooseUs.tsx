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
    <section className="bg-white py-16 sm:py-20 lg:py-28 border-t border-navy-100/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-600">
            Why BOAM
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl">
            Good property decisions start with clarity.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-navy-800/75 leading-relaxed font-normal">
            From the first search to the next conversation, BOAM keeps property discovery simple, clear and personal.
          </p>
        </div>

        {/* 3 Restrained Editorial Cards */}
        <div className="mt-12 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {TRUST_ITEMS.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="group relative flex flex-col justify-between rounded-3xl bg-navy-50/50 p-8 border border-navy-100/80 transition-all duration-300 hover:bg-white hover:shadow-xl hover:border-amber-400/40"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-extrabold text-amber-600 font-mono tracking-wider">
                      {item.number}
                    </span>
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white text-navy-900 shadow-sm border border-navy-100 group-hover:bg-navy-950 group-hover:text-amber-400 transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="mt-6 text-xl font-extrabold text-navy-950 tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-800/70 font-medium">
                    {item.description}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-navy-100/60 flex items-center gap-2 text-xs font-bold text-navy-900 group-hover:text-amber-600 transition-colors">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  <span>The BOAM Approach</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}