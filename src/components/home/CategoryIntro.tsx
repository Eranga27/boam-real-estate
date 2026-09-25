'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { ArrowUpRight, Home, Trees } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/components/motion/Reveal';

const CATEGORIES = [
  {
    key: 'homes',
    image: '/uploads/upkotmaskeliya1.jpeg',
    alt: 'Places worth coming home to - Boam Homes',
    icon: Home,
    badge: 'Residences & Villas',
    title: 'Places worth coming home to.',
    copy: 'Discover houses, apartments and villas across Sri Lanka.',
    href: '/search?type=House',
    cta: 'Explore Homes',
    base: 'bg-navy-950',
    overlay: 'from-navy-950 via-navy-950/40',
    badgeClass: 'bg-white/10 text-amber-300 border-white/15',
    iconClass: 'text-amber-400',
    hoverCta: 'group-hover:bg-amber-500 group-hover:text-navy-950',
  },
  {
    key: 'land',
    image: '/uploads/kaluthara1.jpeg',
    alt: 'Land with room to grow - Boam Land',
    icon: Trees,
    badge: 'Plots & Estates',
    title: 'Land with room to grow.',
    copy: 'Explore residential, commercial and investment land across Sri Lanka.',
    href: '/search?type=Land',
    cta: 'Explore Land',
    base: 'bg-emerald-950',
    overlay: 'from-emerald-950 via-emerald-950/40',
    badgeClass: 'bg-emerald-900/40 text-emerald-300 border-emerald-500/30',
    iconClass: 'text-emerald-400',
    hoverCta: 'group-hover:bg-emerald-500 group-hover:text-white',
  },
];

function CategoryCard({ category, index }: { category: (typeof CATEGORIES)[number]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });

  // The photo drifts at a slower depth while scrolling (a cheap transform)
  const imageY = useTransform(scrollYProgress, [0, 1], ['-9%', '9%']);
  const imageScale = useTransform(scrollYProgress, [0, 0.4], [1.18, 1.06]);
  const Icon = category.icon;

  return (
    <motion.div
      ref={ref}
      // Opens like a curtain once as it scrolls in (not tied to every scroll frame, which
      // would repaint the whole photo card continuously)
      initial={{ clipPath: 'inset(14% 7% 0% 7% round 32px)' }}
      whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 24px)' }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 1.2, delay: index * 0.08, ease: EASE_OUT_EXPO }}
      className="group relative flex min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl p-7 shadow-xl sm:min-h-[480px] sm:p-10 lg:min-h-[520px]"
    >
      <div className={`absolute inset-0 overflow-hidden ${category.base}`}>
        <motion.img
          src={category.image}
          alt={category.alt}
          loading="lazy"
          className="h-full w-full object-cover opacity-85 transition-[filter] duration-700 group-hover:brightness-110"
          style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}
        />
        <div className={`absolute inset-0 bg-gradient-to-t ${category.overlay} to-transparent`} />
      </div>

      <motion.div
        className="relative z-10 flex flex-col justify-end"
        initial={{ opacity: 0, y: 36 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '0px 0px -15% 0px' }}
        transition={{ duration: 1, delay: 0.15 + index * 0.12, ease: EASE_OUT_EXPO }}
      >
        <div
          className={`mb-4 inline-flex w-fit items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold backdrop-blur-md ${category.badgeClass}`}
        >
          <Icon className={`h-3.5 w-3.5 ${category.iconClass}`} />
          <span>{category.badge}</span>
        </div>

        <h3 className="text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl lg:text-4xl">
          {category.title}
        </h3>
        <p className="mt-2 max-w-md text-sm font-medium leading-relaxed text-white/80 sm:text-base">{category.copy}</p>

        <div className="mt-6 flex items-center justify-between border-t border-white/15 pt-4">
          <Link
            href={category.href}
            aria-label={category.cta}
            className={`inline-flex items-center gap-2 rounded-full bg-white/90 px-6 py-3 text-xs font-bold text-navy-950 shadow-lg backdrop-blur-md transition-all duration-300 sm:text-sm ${category.hoverCta}`}
          >
            <span>{category.cta}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

export function CategoryIntro() {
  return (
    <section className="relative overflow-hidden bg-white pb-16 pt-4 sm:pb-20 lg:pb-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {CATEGORIES.map((category, i) => (
            <CategoryCard key={category.key} category={category} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
