'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRightIcon, PhoneIcon } from 'lucide-react';
import { getPhoneHref } from '@/lib/contact';
import { Eyebrow, Magnetic, Reveal, RevealText } from '@/components/motion/Reveal';

export function CtaBanner() {
  return (
    <section
      className="relative overflow-hidden py-24 sm:py-28 lg:py-36"
      // Continues the navy night of the journey above without a seam
      style={{ background: 'linear-gradient(to bottom, #0C1F35 0%, #0A1828 60%, #091523 100%)' }}
    >
      {/* Slowly drifting warm light */}
      <div
        className="cta-aurora pointer-events-none absolute -left-40 top-1/2 h-[520px] w-[520px] -translate-y-1/2 rounded-full opacity-[0.14]"
        style={{ background: 'radial-gradient(circle, #C9972A 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="cta-aurora cta-aurora--slow pointer-events-none absolute -right-40 bottom-0 h-[420px] w-[420px] rounded-full opacity-[0.16]"
        style={{ background: 'radial-gradient(circle, #1a3a5c 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl">
          <Eyebrow tone="dark" className="justify-center">
            Start Your Discovery
          </Eyebrow>

          <RevealText
            text={[{ text: 'Ready to find your place in ' }, { text: 'Sri Lanka?', className: 'text-amber-400' }]}
            className="mt-5 text-3xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl"
            delay={0.1}
            stagger={0.06}
          />

          <Reveal delay={0.45} y={16}>
            <p className="mx-auto mt-5 max-w-xl text-base font-normal leading-relaxed text-white/65 sm:text-lg">
              Explore available properties or speak directly with BOAM about what you&apos;re looking for.
            </p>
          </Reveal>

          <Reveal delay={0.6} y={20}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Magnetic className="w-full sm:w-auto">
                <Link
                  href="/search"
                  className="group relative inline-flex w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-amber-500 px-8 py-4 text-sm font-bold text-navy-950 transition-all duration-200 hover:bg-amber-400 hover:shadow-[0_8px_32px_-8px_rgba(201,151,42,0.7)] sm:w-auto"
                >
                  {/* Light sweep across the button on hover */}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/2 bg-gradient-to-r from-transparent via-white/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:animate-[cta-sheen_0.9s_ease-out] group-hover:opacity-100"
                  />
                  <span className="relative">Browse Properties</span>
                  <ArrowRightIcon className="relative h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </Link>
              </Magnetic>

              <a
                href={getPhoneHref()}
                className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-white/15 px-8 py-4 text-sm font-bold text-white/90 transition-all duration-200 hover:border-white/40 hover:bg-white/5 hover:text-white sm:w-auto"
              >
                <PhoneIcon className="h-4 w-4 text-amber-400/80" aria-hidden="true" />
                <span>Talk to a Broker</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
