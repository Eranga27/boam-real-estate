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
    <section
      className="relative py-20 sm:py-24 lg:py-32 overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #F2F4F7 0%, #EEF0F5 100%)' }}
    >
      {/* Soft top dissolve from WhyChooseUs warm ivory */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-24"
        style={{ background: 'linear-gradient(to bottom, #F2EFE9, transparent)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section header — left aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="max-w-2xl mb-16 sm:mb-20"
        >
          <p className="text-[11px] font-extrabold uppercase tracking-[0.25em] text-amber-600">
            Process
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl leading-[1.1]">
            From discovery to decision.
          </h2>
          <p className="mt-4 text-base sm:text-lg text-navy-800/70 leading-relaxed font-normal">
            Three simple steps to move from browsing to your next property conversation.
          </p>
        </motion.div>

        {/* Desktop: staggered editorial timeline */}
        <div className="relative hidden lg:block">
          {/* Thin warm gold connecting line running across all 3 steps */}
          <div
            className="pointer-events-none absolute top-[2.25rem] left-[4rem] right-[4rem] h-px"
            style={{
              background: 'linear-gradient(to right, #C9972A40, #C9972A 20%, #C9972A 80%, #C9972A40)',
            }}
            aria-hidden="true"
          />

          <ol className="relative grid grid-cols-3 gap-12">
            {STEPS.map((step, i) => (
              <motion.li
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.55, delay: i * 0.14, ease: 'easeOut' }}
                className={`relative flex flex-col ${i === 1 ? 'mt-16' : ''} ${i === 2 ? 'mt-32' : ''}`}
              >
                {/* Step number with gold dot above the line */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="relative flex items-center justify-center">
                    <span
                      className="flex h-[18px] w-[18px] items-center justify-center rounded-full bg-amber-500 ring-4 ring-amber-500/20 z-10"
                      aria-hidden="true"
                    />
                  </div>
                  <span className="text-xs font-extrabold uppercase tracking-[0.2em] text-navy-400">
                    Step {step.number}
                  </span>
                </div>

                <div>
                  <span className="text-6xl font-extrabold text-navy-950/[0.07] font-mono leading-none block mb-3 select-none">
                    {step.number}
                  </span>
                  <h3 className="text-xl font-extrabold text-navy-950 tracking-tight">
                    {step.title}
                  </h3>
                  <div className="mt-2 h-px w-8 bg-amber-500/50" />
                  <p className="mt-3 text-sm leading-relaxed text-navy-700/70 font-medium max-w-xs">
                    {step.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>

        {/* Mobile: clean vertical timeline */}
        <ol className="relative lg:hidden space-y-0 pl-10">
          {/* Vertical gold line */}
          <div
            className="pointer-events-none absolute left-[1.1rem] top-3 bottom-3 w-px"
            style={{ background: 'linear-gradient(to bottom, #C9972A40, #C9972A 20%, #C9972A 80%, #C9972A40)' }}
            aria-hidden="true"
          />

          {STEPS.map((step, i) => (
            <motion.li
              key={step.number}
              initial={{ opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.5, delay: i * 0.1, ease: 'easeOut' }}
              className="relative pb-10 last:pb-0"
            >
              {/* Gold dot on the vertical line */}
              <span
                className="absolute -left-[2.25rem] top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 ring-4 ring-amber-500/20"
                aria-hidden="true"
              />

              <span className="text-4xl font-extrabold text-navy-950/[0.06] font-mono leading-none block mb-2 select-none">
                {step.number}
              </span>
              <h3 className="text-lg font-extrabold text-navy-950 tracking-tight">
                {step.title}
              </h3>
              <div className="mt-1.5 h-px w-6 bg-amber-500/50" />
              <p className="mt-2.5 text-sm leading-relaxed text-navy-700/70 font-medium max-w-xs">
                {step.description}
              </p>
            </motion.li>
          ))}
        </ol>
      </div>

      {/* Soft dissolve into deep navy CTA */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: 'linear-gradient(to bottom, transparent, #0C1F35)' }}
        aria-hidden="true"
      />
    </section>
  );
}