'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { KeyRoundIcon, MessageSquareIcon, SearchIcon } from 'lucide-react';

const steps = [
{
  icon: SearchIcon,
  title: 'Browse the portfolio',
  body: 'Filter by city, budget and property type. Every listing shows verified sizes, real photos and a genuine asking price.'
},
{
  icon: MessageSquareIcon,
  title: 'Send an inquiry',
  body: 'Tell us what you need. Your assigned broker replies within one working day and arranges viewings around your schedule.'
},
{
  icon: KeyRoundIcon,
  title: 'Close the deal',
  body: 'We negotiate on your behalf, coordinate the lawyers and hand over the keys — with the paperwork already settled.'
}];


export function HowItWorks() {
  return (
    <section className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
      {/* WhyChooseUs → HowItWorks: soft top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-navy-900/10 to-transparent" />

      <div className="mx-auto max-w-2xl text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-600">
          Simple process
        </p>
        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-navy-800 sm:text-[2.5rem]">
          How It Works
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-navy-800/60">
          Three steps from first browse to keys in hand.
        </p>
      </div>

      <div className="relative mt-14">
        <div
          className="absolute left-1/2 top-7 hidden h-px w-[70%] -translate-x-1/2 lg:block"
          style={{
            backgroundImage:
            'repeating-linear-gradient(to right, #c3d5e9 0 10px, transparent 10px 20px)'
          }}
          aria-hidden="true" />
        
        <ol className="relative grid gap-10 lg:grid-cols-3 lg:gap-8">
          {steps.map((step, i) =>
          <motion.li
            key={step.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="flex flex-col items-center text-center">
            
              <div className="relative grid h-14 w-14 place-items-center rounded-full bg-navy-800 text-lg font-extrabold text-white ring-8 ring-white">
                {i + 1}
                <span className="absolute -bottom-1 -right-1 grid h-7 w-7 place-items-center rounded-full bg-amber-500 text-navy-900">
                  <step.icon className="h-3.5 w-3.5" aria-hidden="true" />
                </span>
              </div>
              <h3 className="mt-6 text-lg font-bold text-navy-800">{step.title}</h3>
              <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-navy-800/60">
                {step.body}
              </p>
            </motion.li>
          )}
        </ol>
      </div>
    </section>);

}