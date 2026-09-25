'use client';

import React, { useRef, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useTransform,
} from 'framer-motion';
import {
  BadgeCheck,
  Bus,
  Compass,
  FileText,
  GraduationCap,
  Hospital,
  Home,
  MessageCircle,
  Phone,
  Store,
  UserCheck,
} from 'lucide-react';
import { EASE_OUT_EXPO, Eyebrow, Reveal } from '@/components/motion/Reveal';

/**
 * "Good property decisions start with clarity." — told as a focus pull.
 *
 * Desktop: the section pins while you scroll. The heading comes into focus as you arrive, then
 * each pillar takes the stage in turn inside a camera-style viewfinder; every change is a rack
 * focus (the old scene blurs out as the new one sharpens) and the viewfinder "locks" like
 * autofocus. Smaller screens get the same scenes stacked, each playing as it scrolls in.
 */

const PILLARS = [
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

// ---------------------------------------------------------------------------------------------
// Scenes
// ---------------------------------------------------------------------------------------------

/** 01 — A real listing's spec sheet: each detail resolves out of a blurred placeholder */
function DetailsScene() {
  const rows = [
    ['Price', 'LKR 210,000,000'],
    ['Land', '30 perches'],
    ['Floor area', '9,589 sq ft'],
    ['Storeys', '3'],
    ['Location', 'Kandy, Central Province'],
  ];
  return (
    <div className="grid h-full grid-cols-1 gap-5 p-6 sm:grid-cols-[1.05fr_1fr] sm:p-7">
      <motion.div
        className="relative min-h-[170px] overflow-hidden rounded-2xl bg-navy-900"
        initial={{ opacity: 0, scale: 1.06, filter: 'blur(10px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
      >
        <img src="/uploads/kandy1.jpeg" alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-transparent to-transparent" />
        <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-navy-950">
          <Home className="h-3 w-3" /> House
        </span>
        <p className="absolute inset-x-4 bottom-3 text-sm font-extrabold leading-snug text-white">
          Three-Storey House in Kandy
        </p>
      </motion.div>

      <div className="flex flex-col justify-center">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-navy-400">Property details</p>
        <dl className="mt-3 divide-y divide-navy-100">
          {rows.map(([label, value], i) => (
            <div key={label} className="flex items-center justify-between gap-4 py-2.5">
              <dt className="text-xs font-semibold text-navy-500">{label}</dt>
              <dd className="relative text-right text-[13px] font-extrabold text-navy-950">
                {/* Placeholder bar that dissolves as the real value sharpens in */}
                <motion.span
                  aria-hidden="true"
                  className="absolute right-0 top-1/2 h-2.5 w-24 -translate-y-1/2 rounded-full bg-navy-100"
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.4, delay: 0.45 + i * 0.16 }}
                />
                <motion.span
                  className="relative inline-block"
                  initial={{ opacity: 0, filter: 'blur(6px)', x: 6 }}
                  animate={{ opacity: 1, filter: 'blur(0px)', x: 0 }}
                  transition={{ duration: 0.7, delay: 0.5 + i * 0.16, ease: EASE_OUT_EXPO }}
                >
                  {value}
                </motion.span>
              </dd>
            </div>
          ))}
        </dl>
        <motion.div
          className="mt-4 inline-flex w-fit items-center gap-1.5 rounded-full bg-sea-50 px-3 py-1.5 text-[11px] font-extrabold text-sea-700 ring-1 ring-sea-200"
          initial={{ opacity: 0, scale: 1.6, rotate: -8 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 320, damping: 16, delay: 1.45 }}
        >
          <BadgeCheck className="h-3.5 w-3.5" /> Inspected by BOAM
        </motion.div>
      </div>
    </div>
  );
}

/** 02 — The neighbourhood around a listing: roads draw in, the pin pulses, places surface */
function ContextScene() {
  const places = [
    { icon: GraduationCap, label: 'Schools', x: '14%', y: '20%' },
    { icon: Hospital, label: 'Hospitals', x: '68%', y: '16%' },
    { icon: Store, label: 'Town centre', x: '8%', y: '70%' },
    { icon: Bus, label: 'Transport links', x: '62%', y: '74%' },
  ];
  return (
    <div className="relative h-full min-h-[300px] overflow-hidden bg-[#f3f1ea]">
      {/* Soft map: blocks and a lake */}
      <div
        className="absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'linear-gradient(rgba(14,42,73,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(14,42,73,0.05) 1px, transparent 1px)',
          backgroundSize: '36px 36px',
        }}
      />
      <motion.div
        className="absolute right-[-8%] top-[38%] h-[46%] w-[34%] rounded-[45%] bg-sky-200/70"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, ease: EASE_OUT_EXPO }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 400 300" preserveAspectRatio="none" fill="none">
        {[
          'M-10 210 C 90 190, 150 170, 200 150 S 330 80, 420 60',
          'M120 -10 C 140 80, 170 120, 200 150 S 240 260, 250 320',
          'M-10 90 C 80 110, 150 130, 200 150',
        ].map((d, i) => (
          <motion.path
            key={d}
            d={d}
            stroke="#ffffff"
            strokeWidth={i === 0 ? 9 : 6}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.2, delay: 0.1 + i * 0.18, ease: [0.65, 0, 0.35, 1] }}
          />
        ))}
      </svg>

      {/* Listing pin with radar rings */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
        {[0, 1, 2].map((ring) => (
          <motion.span
            key={ring}
            className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border border-amber-500/60"
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 2.6, opacity: 0 }}
            transition={{ duration: 2.6, delay: 0.6 + ring * 0.85, repeat: Infinity, ease: 'easeOut' }}
          />
        ))}
        <motion.div
          className="relative flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-amber-400 shadow-xl ring-4 ring-white"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.35 }}
        >
          <Home className="h-5 w-5" />
        </motion.div>
      </div>

      {places.map(({ icon: Icon, label, x, y }, i) => (
        <motion.div
          key={label}
          className="absolute flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[11px] font-extrabold text-navy-900 shadow-lg ring-1 ring-navy-900/5"
          style={{ left: x, top: y }}
          initial={{ opacity: 0, y: 14, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.9 + i * 0.18, ease: EASE_OUT_EXPO }}
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-500/15 text-amber-600">
            <Icon className="h-3.5 w-3.5" />
          </span>
          {label}
        </motion.div>
      ))}

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-navy-900/85 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur">
        Know the neighbourhood
      </div>
    </div>
  );
}

/** 03 — A direct conversation with a BOAM broker */
function BrokerScene() {
  return (
    <div className="flex h-full min-h-[300px] flex-col bg-gradient-to-b from-white to-navy-50/60">
      <div className="flex items-center gap-3 border-b border-navy-100 px-6 py-4">
        <div className="relative flex h-10 w-10 items-center justify-center rounded-full bg-navy-900">
          <img src="/images/boamcompactmonogram.png" alt="" className="h-5 w-auto brightness-0 invert" />
          <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-sea-500 ring-2 ring-white" />
        </div>
        <div>
          <p className="text-sm font-extrabold text-navy-950">BOAM Real Estates</p>
          <p className="text-[11px] font-semibold text-sea-600">Broker · online</p>
        </div>
      </div>

      <div className="flex flex-1 flex-col justify-end gap-3 px-6 py-5">
        <motion.div
          className="ml-auto max-w-[78%] rounded-2xl rounded-br-md bg-navy-900 px-4 py-2.5 text-[13px] font-medium leading-snug text-white"
          initial={{ opacity: 0, y: 14, scale: 0.94 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, delay: 0.3, ease: EASE_OUT_EXPO }}
        >
          Hi, is the house in Kandy still available for a viewing?
        </motion.div>

        {/* Typing, then the reply */}
        <div className="relative min-h-[64px]">
          <motion.div
            className="absolute left-0 top-0 flex gap-1 rounded-2xl rounded-bl-md bg-white px-4 py-3 shadow ring-1 ring-navy-100"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ duration: 1.5, delay: 0.9, times: [0, 0.1, 0.85, 1] }}
          >
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-1.5 w-1.5 rounded-full bg-navy-400"
                animate={{ y: [0, -3, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: dot * 0.15 }}
              />
            ))}
          </motion.div>
          <motion.div
            className="max-w-[82%] rounded-2xl rounded-bl-md bg-white px-4 py-2.5 text-[13px] font-medium leading-snug text-navy-900 shadow ring-1 ring-navy-100"
            initial={{ opacity: 0, y: 12, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, delay: 2.35, ease: EASE_OUT_EXPO }}
          >
            Yes, it is. We can arrange a viewing this week. What time suits you?
          </motion.div>
        </div>

        <motion.div
          className="flex gap-2"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 2.9, ease: EASE_OUT_EXPO }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500 px-4 py-2 text-xs font-extrabold text-navy-950 shadow">
            <Phone className="h-3.5 w-3.5" /> Call broker
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sea-500 px-4 py-2 text-xs font-extrabold text-white shadow">
            <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
          </span>
        </motion.div>
      </div>
    </div>
  );
}

const SCENES = [DetailsScene, ContextScene, BrokerScene];

// ---------------------------------------------------------------------------------------------
// Viewfinder stage
// ---------------------------------------------------------------------------------------------

/** Camera-style frame whose corner brackets "lock" like autofocus each time the scene changes */
function Viewfinder({ index, children }: { index: number; children: React.ReactNode }) {
  const corners = [
    'left-3 top-3 border-l-2 border-t-2 rounded-tl-xl',
    'right-3 top-3 border-r-2 border-t-2 rounded-tr-xl',
    'left-3 bottom-3 border-l-2 border-b-2 rounded-bl-xl',
    'right-3 bottom-3 border-r-2 border-b-2 rounded-br-xl',
  ];
  return (
    <div className="relative rounded-[32px] bg-white p-3 shadow-[0_40px_80px_-30px_rgba(14,42,73,0.45)] ring-1 ring-navy-900/5">
      <div className="relative h-[430px] overflow-hidden rounded-[24px] bg-white ring-1 ring-navy-100 xl:h-[460px]">{children}</div>
      {corners.map((corner) => (
        <motion.span
          key={`${corner}-${index}`}
          aria-hidden="true"
          className={`pointer-events-none absolute z-20 h-7 w-7 border-amber-500 ${corner}`}
          initial={{ scale: 1.35, opacity: 0.3 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 380, damping: 18, delay: 0.25 }}
        />
      ))}
      <div className="pointer-events-none absolute -top-3 left-8 z-20 flex items-center gap-2 rounded-full bg-navy-950 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-white shadow-lg">
        <motion.span
          key={index}
          className="h-1.5 w-1.5 rounded-full bg-sea-400"
          initial={{ opacity: 0.2 }}
          animate={{ opacity: [0.2, 1, 0.2, 1] }}
          transition={{ duration: 0.6, delay: 0.2 }}
        />
        Focus · {String(index + 1).padStart(2, '0')} / 03
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------------------------

export function WhyChooseUs() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);

  // Pinned scroll story: progress through the tall track picks the pillar on stage
  const { scrollYProgress: story } = useScroll({ target: trackRef, offset: ['start start', 'end end'] });
  useMotionValueEvent(story, 'change', (v) => setActive(Math.min(PILLARS.length - 1, Math.max(0, Math.floor(v * PILLARS.length)))));
  const railFill = useTransform(story, [0, 1], [0.05, 1]);

  const jumpTo = (i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const top = track.getBoundingClientRect().top + window.scrollY;
    const travel = track.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + (travel * (i + 0.5)) / PILLARS.length, behavior: 'smooth' });
  };

  const Scene = SCENES[active];
  const heading = (
    // The heading literally comes into focus as it arrives (a one-time animation, so no blur
    // is recalculated on every scroll frame)
    <motion.h2
      className="mt-4 text-4xl font-extrabold leading-[1.06] tracking-tight text-navy-950 sm:text-5xl xl:text-6xl"
      initial={{ opacity: 0.15, filter: 'blur(14px)' }}
      whileInView={{ opacity: 1, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '0px 0px -25% 0px' }}
      transition={{ duration: 1.4, ease: EASE_OUT_EXPO }}
    >
      Good property decisions start with <span className="text-amber-600">clarity.</span>
    </motion.h2>
  );

  return (
    <section
      className="relative"
      style={{ background: 'linear-gradient(to bottom, #F7F5F0 0%, #F2EFE9 100%)' }}
    >
      {/* ---- Desktop: pinned focus-pull story ---- */}
      <div ref={trackRef} className="relative hidden lg:block" style={{ height: '290vh' }}>
        <div className="sticky top-0 flex h-screen items-center overflow-hidden">
          {/* Oversized monogram watermark */}
          <img
            src="/images/boamcompactmonogram.png"
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute -right-24 top-1/2 h-[640px] w-auto -translate-y-1/2 select-none opacity-[0.035]"
          />

          <div className="relative mx-auto grid w-full max-w-7xl grid-cols-12 items-center gap-14 px-8 pt-16">
            <div className="col-span-5">
              <Eyebrow>Why BOAM</Eyebrow>
              {heading}
              <p className="mt-5 max-w-md text-lg leading-relaxed text-navy-800/70">
                From the first search to the next conversation, BOAM keeps property discovery simple, clear and
                personal.
              </p>

              {/* Pillars, with a gold rail that fills as the story plays */}
              <div className="relative mt-10 pl-7">
                <span className="absolute bottom-2 left-0 top-2 w-px bg-navy-900/10" aria-hidden="true" />
                <motion.span
                  className="absolute bottom-2 left-0 top-2 w-px origin-top bg-amber-500"
                  style={{ scaleY: railFill }}
                  aria-hidden="true"
                />
                <ol className="space-y-2">
                  {PILLARS.map((pillar, i) => {
                    const isActive = i === active;
                    const Icon = pillar.icon;
                    return (
                      <li key={pillar.number}>
                        <button
                          type="button"
                          onClick={() => jumpTo(i)}
                          aria-current={isActive ? 'step' : undefined}
                          className="group relative w-full rounded-2xl px-4 py-3 text-left transition-colors duration-500 hover:bg-white/60"
                        >
                          <span
                            className={`absolute -left-[31px] top-5 h-2.5 w-2.5 rounded-full ring-4 transition-all duration-500 ${
                              isActive ? 'bg-amber-500 ring-amber-500/25' : 'bg-navy-200 ring-transparent'
                            }`}
                            aria-hidden="true"
                          />
                          <div className="flex items-center gap-3">
                            <span
                              className={`font-mono text-xs font-bold transition-colors duration-500 ${
                                isActive ? 'text-amber-600' : 'text-navy-300'
                              }`}
                            >
                              {pillar.number}
                            </span>
                            <Icon
                              className={`h-4 w-4 transition-colors duration-500 ${isActive ? 'text-amber-500' : 'text-navy-300'}`}
                            />
                            <span
                              className={`text-lg font-extrabold tracking-tight transition-colors duration-500 ${
                                isActive ? 'text-navy-950' : 'text-navy-900/35'
                              }`}
                            >
                              {pillar.title}
                            </span>
                          </div>
                          <AnimatePresence initial={false}>
                            {isActive && (
                              <motion.p
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
                                className="overflow-hidden pl-[52px] text-sm font-medium leading-relaxed text-navy-700/75"
                              >
                                <span className="block pt-1.5">{pillar.description}</span>
                              </motion.p>
                            )}
                          </AnimatePresence>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>

            <div className="col-span-7">
              <Viewfinder index={active}>
                {/* Rack focus: the old scene blurs away as the new one sharpens */}
                <AnimatePresence initial={false}>
                  <motion.div
                    key={active}
                    className="absolute inset-0"
                    initial={{ opacity: 0, scale: 1.05, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.97, filter: 'blur(10px)' }}
                    transition={{ duration: 0.75, ease: EASE_OUT_EXPO }}
                  >
                    <Scene />
                  </motion.div>
                </AnimatePresence>
              </Viewfinder>
            </div>
          </div>
        </div>
      </div>

      {/* ---- Smaller screens: the same scenes, stacked ---- */}
      <div className="relative px-4 py-20 sm:px-6 sm:py-24 lg:hidden">
        <div className="mx-auto max-w-2xl">
          <Eyebrow>Why BOAM</Eyebrow>
          {heading}
          <Reveal delay={0.2} y={16}>
            <p className="mt-5 text-base leading-relaxed text-navy-800/70 sm:text-lg">
              From the first search to the next conversation, BOAM keeps property discovery simple, clear and personal.
            </p>
          </Reveal>

          <div className="mt-12 space-y-12">
            {PILLARS.map((pillar, i) => {
              const StackedScene = SCENES[i];
              const Icon = pillar.icon;
              return (
                <div key={pillar.number}>
                  <Reveal y={20}>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-amber-600">{pillar.number}</span>
                      <Icon className="h-4 w-4 text-amber-500" />
                      <h3 className="text-lg font-extrabold tracking-tight text-navy-950">{pillar.title}</h3>
                    </div>
                    <p className="mt-2 text-sm font-medium leading-relaxed text-navy-700/75">{pillar.description}</p>
                  </Reveal>
                  <InViewScene>
                    <div className="mt-5 overflow-hidden rounded-3xl bg-white shadow-[0_30px_60px_-30px_rgba(14,42,73,0.45)] ring-1 ring-navy-100">
                      <StackedScene />
                    </div>
                  </InViewScene>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Mounts a scene only once it scrolls into view, so its animation plays where it's seen */
function InViewScene({ children }: { children: React.ReactNode }) {
  const [shown, setShown] = useState(false);
  return (
    <motion.div
      className="min-h-[300px]"
      onViewportEnter={() => setShown(true)}
      viewport={{ once: true, margin: '0px 0px -20% 0px' }}
    >
      {shown && children}
    </motion.div>
  );
}
