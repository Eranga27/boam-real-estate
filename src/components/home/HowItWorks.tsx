'use client';

import React from 'react';
import { motion } from 'framer-motion';

const STEPS = [
  {
    number: '01',
    title: 'Explore',
    description: 'Browse homes and land based on location, property type and your needs.',
  },
  {
    number: '02',
    title: 'Enquire',
    description: "Connect directly with BOAM about a property you're interested in.",
  },
  {
    number: '03',
    title: 'Move Forward',
    description: 'Arrange the next conversation, viewing or decision with broker assistance.',
  },
];

export function HowItWorks() {
  return (
    <section className="bg-slate-50/60 py-16 sm:py-20 lg:py-28 border-t border-navy-100/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-600">
            Process
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl">
            From discovery to decision.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-navy-800/75 leading-relaxed font-normal">
            Three simple steps to move from browsing to your next property conversation.
          </p>
        </div>

        {/* Steps Grid with Minimal Gold Connecting Line */}
        <div className="relative mt-12 sm:mt-16">
          {/* Subtle Horizontal Gold Line for Desktop */}
          <div className="hidden lg:block absolute top-10 left-[10%] right-[10%] h-px bg-gradient-to-r from-amber-400/20 via-amber-400/60 to-amber-400/20 z-0" />

          <ol className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.number}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
                className="flex flex-col justify-between rounded-3xl bg-white p-8 shadow-sm border border-navy-100/80 transition-all duration-300 hover:shadow-md"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-4xl font-extrabold text-navy-950 font-mono tracking-tight">
                      {step.number}
                    </span>
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                  </div>

                  <h3 className="mt-6 text-xl font-extrabold text-navy-950 tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-navy-800/70 font-medium">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}