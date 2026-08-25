'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Home, Trees } from 'lucide-react';

export function CategoryIntro() {
  return (
    <section className="relative bg-white py-16 sm:py-20 lg:py-24 overflow-hidden border-t border-navy-100/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Editorial Section Header */}
        <div className="mb-10 sm:mb-14 max-w-2xl">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-600">
            Portfolio Pathways
          </p>
          <h2 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl">
            Curated across two distinct realms.
          </h2>
          <p className="mt-3 text-base text-navy-800/70 leading-relaxed">
            Whether looking for luxury residences or expansive land with long-term investment potential, explore hand-verified listings tailored to your vision.
          </p>
        </div>

        {/* Balanced Two-Column Editorial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* HOMES Composition */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="group relative flex flex-col justify-end min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] overflow-hidden rounded-3xl p-7 sm:p-10 shadow-xl transition-all"
          >
            {/* Background Image with Gentle Zoom */}
            <div className="absolute inset-0 bg-navy-950">
              <img
                src="/uploads/upkotmaskeliya1.jpeg"
                alt="Places worth coming home to - Boam Homes"
                className="h-full w-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Gradient Overlay for Text Contrast & Navy/Gold Treatment */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col justify-end">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3.5 py-1 text-xs font-bold text-amber-300 backdrop-blur-md border border-white/15 w-fit mb-4">
                <Home className="h-3.5 w-3.5 text-amber-400" />
                <span>Residences & Villas</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Places worth coming home to.
              </h3>
              <p className="mt-2 text-sm sm:text-base text-white/80 max-w-md font-medium leading-relaxed">
                Discover houses, apartments and villas across Sri Lanka.
              </p>

              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
                <Link
                  href="/search?type=House"
                  aria-label="Explore Homes"
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-xs sm:text-sm font-bold text-navy-950 backdrop-blur-md shadow-lg transition-all duration-300 group-hover:bg-amber-500 group-hover:text-navy-950"
                >
                  <span>Explore Homes</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </motion.div>

          {/* LAND Composition */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="group relative flex flex-col justify-end min-h-[440px] sm:min-h-[500px] lg:min-h-[540px] overflow-hidden rounded-3xl p-7 sm:p-10 shadow-xl transition-all"
          >
            {/* Background Image with Gentle Zoom */}
            <div className="absolute inset-0 bg-emerald-950">
              <img
                src="/uploads/kaluthara1.jpeg"
                alt="Land with room to grow - Boam Land"
                className="h-full w-full object-cover opacity-85 transition-transform duration-700 ease-out group-hover:scale-105"
              />
              {/* Gradient Overlay for Text Contrast & Emerald Treatment */}
              <div className="absolute inset-0 bg-gradient-to-t from-emerald-950 via-emerald-950/40 to-transparent" />
            </div>

            {/* Content Container */}
            <div className="relative z-10 flex flex-col justify-end">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-900/40 px-3.5 py-1 text-xs font-bold text-emerald-300 backdrop-blur-md border border-emerald-500/30 w-fit mb-4">
                <Trees className="h-3.5 w-3.5 text-emerald-400" />
                <span>Plots & Estates</span>
              </div>

              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-snug">
                Land with room to grow.
              </h3>
              <p className="mt-2 text-sm sm:text-base text-white/80 max-w-md font-medium leading-relaxed">
                Explore residential, commercial and investment land across Sri Lanka.
              </p>

              <div className="mt-6 pt-4 border-t border-white/15 flex items-center justify-between">
                <Link
                  href="/search?type=Land"
                  aria-label="Explore Land"
                  className="inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-xs sm:text-sm font-bold text-navy-950 backdrop-blur-md shadow-lg transition-all duration-300 group-hover:bg-emerald-500 group-hover:text-white"
                >
                  <span>Explore Land</span>
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
