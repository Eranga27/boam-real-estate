'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter as useNavigate } from 'next/navigation';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'framer-motion';
import { ArrowUpRight, ChevronDownIcon, MapPinIcon, SearchIcon } from 'lucide-react';
import { heroImage } from '@/data/locations';
import { propertyTypes } from '@/data/properties';
import { getEntranceDelay, useIntroRevealed } from '@/lib/intro';

const CITIES = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Nugegoda', 'Mount Lavinia', 'Matara'];

/** Hero scenes: the city at night, then three real BOAM listings */
const SCENES: Array<{
  image: string;
  srcSet?: string;
  place: string;
  region: string;
  title: string;
  href: string;
  cta: string;
}> = [
  {
    image: heroImage,
    place: 'Colombo',
    region: 'Western Province',
    title: 'Homes and land across Sri Lanka',
    href: '/search',
    cta: 'Browse properties',
  },
  {
    image: '/images/hero/ekala-1920.jpg',
    srcSet: '/images/hero/ekala-1280.jpg 1280w, /images/hero/ekala-1920.jpg 1920w',
    place: 'Ekala',
    region: 'Gampaha District',
    title: 'House in Ekala',
    href: '/properties/ekala-house',
    cta: 'View property',
  },
  {
    image: '/images/hero/maskeliya-1280.jpg',
    place: 'Upkot, Maskeliya',
    region: 'Hill Country',
    title: 'Luxury House in Upkot Maskeliya',
    href: '/properties/upkot-maskeliya-house',
    cta: 'View property',
  },
  {
    image: '/images/hero/bulathsinhala-1600.jpg',
    place: 'Bulathsinhala',
    region: 'Kalutara District',
    title: 'Eco & Agro Tourism Estate',
    href: '/properties/kalutara-estate-land',
    cta: 'View property',
  },
];

const SCENE_MS = 6500;
const WIPE_MS = 1300;
/** The wipe's leading edge leans like the logo's roofline: its foot trails its head by this % of the width */
const WIPE_SLANT = 22;
const WIPE_DONE = 100 + WIPE_SLANT;
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;
/** Ken Burns drift direction per scene, so consecutive scenes don't move the same way */
const DRIFT = ['-1.5%', '1.5%', '-1%', '1.2%'];

/** One chapter bar's fill: full for past scenes, a CSS-animated fill for the current one */
function ChapterFill({
  idx,
  current,
  autoplay,
  onDone,
}: {
  idx: number;
  current: number;
  autoplay: boolean;
  onDone: () => void;
}) {
  if (idx === current && autoplay) {
    return (
      <span
        className="hero-progress absolute inset-0 rounded-full bg-amber-400"
        style={{ animationDuration: `${SCENE_MS}ms` }}
        onAnimationEnd={onDone}
      />
    );
  }
  return (
    <span
      className="absolute inset-0 origin-left rounded-full bg-amber-400"
      style={{ transform: `scaleX(${idx < current || (idx === current && !autoplay) ? 1 : 0})` }}
    />
  );
}

export function Hero() {
  const navigate = useNavigate();
  const reduceMotion = useReducedMotion();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [focused, setFocused] = useState(false);
  const [scene, setScene] = useState({ current: 0, previous: -1 });
  const [mountAll, setMountAll] = useState(false);
  const [size, setSize] = useState({ w: 1440, h: 900 });

  const sectionRef = useRef<HTMLElement>(null);


  // Entrance and slideshow wait for the homepage intro to open onto the hero
  const revealed = useIntroRevealed();
  const introDelay = revealed ? getEntranceDelay() : 0;

  // ---- Scene wipe: the incoming photo is revealed behind a slanted, gold-lit edge ----
  const wipe = useMotionValue(WIPE_DONE);
  const wipeClip = useTransform(wipe, (w) => `polygon(0% 0%, ${w}% 0%, ${w - WIPE_SLANT}% 100%, 0% 100%)`);
  const edgeLeft = useTransform(wipe, (w) => `${w - WIPE_SLANT / 2}%`);
  const edgeOpacity = useTransform(wipe, [0, 6, WIPE_DONE - 6, WIPE_DONE], [0, 1, 1, 0]);
  const edgeAngle = (Math.atan(((WIPE_SLANT / 100) * size.w) / size.h) * 180) / Math.PI;

  // ---- Depth: background drifts against the cursor, content with it ----
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const spring = { stiffness: 60, damping: 20, mass: 0.6 };
  const bgX = useSpring(useTransform(pointerX, (v) => v * -22), spring);
  const bgY = useSpring(useTransform(pointerY, (v) => v * -14), spring);
  const fgX = useSpring(useTransform(pointerX, (v) => v * 8), spring);
  const fgY = useSpring(useTransform(pointerY, (v) => v * 5), spring);

  // ---- Scroll exit: the photo pushes in and darkens as the content lifts away ----
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ['start start', 'end start'] });
  const exitScale = useTransform(scrollYProgress, [0, 1], [1, 1.14]);
  const exitShade = useTransform(scrollYProgress, [0, 1], [0, 0.6]);
  const exitContentY = useTransform(scrollYProgress, [0, 1], [0, -150]);
  const exitContentOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0]);
  const exitChromeOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  const goTo = useCallback(
    (next: number) => {
      setScene((s) => (s.current === next ? s : { current: next, previous: s.current }));
      if (reduceMotion) {
        wipe.set(WIPE_DONE);
        return;
      }
      wipe.set(0);
      animate(wipe, WIPE_DONE, { duration: WIPE_MS / 1000, ease: [0.65, 0, 0.35, 1] });
    },
    [reduceMotion, wipe]
  );

  // Autoplay runs on the compositor: the current chapter bar is a CSS animation, and its
  // animationend advances to the next scene (no per-frame JavaScript while scrolling)
  const autoplay = revealed && !reduceMotion;
  const advance = () => goTo((scene.current + 1) % SCENES.length);

  // Pause autoplay while the hero is off screen or the tab is hidden
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    let inView = true;
    // Written straight to the DOM (CSS pauses the chapter bar from it) so scrolling past
    // the hero never re-renders it
    const sync = () => {
      el.dataset.paused = String(!inView || document.hidden);
    };
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      sync();
    });
    observer.observe(el);
    document.addEventListener('visibilitychange', sync);
    return () => {
      observer.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  // Later scenes load after the first photo, well before their turn
  useEffect(() => {
    const t = setTimeout(() => setMountAll(true), 1200);
    return () => clearTimeout(t);
  }, []);

  // Wipe angle depends on the hero's aspect ratio
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      if (width && height) setSize({ w: width, h: height });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const onPointerMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || reduceMotion || !sectionRef.current) return;
    const r = sectionRef.current.getBoundingClientRect();
    pointerX.set((e.clientX - r.left) / r.width - 0.5);
    pointerY.set((e.clientY - r.top) / r.height - 0.5);
  };

  const suggestions = useMemo(() => {
    if (!location.trim()) return CITIES.slice(0, 5);
    return CITIES.filter((c) => c.toLowerCase().includes(location.trim().toLowerCase())).slice(0, 5);
  }, [location]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (type) params.set('type', type);
    navigate.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const active = SCENES[scene.current];
  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 22 },
    animate: revealed ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, delay: introDelay + delay, ease: EASE_OUT_EXPO },
  });

  return (
    <section
      ref={sectionRef}
      onPointerMove={onPointerMove}
      className="relative flex min-h-[100svh] items-center overflow-hidden bg-navy-950 pt-24 pb-28 lg:py-32"
    >
      {/* ---- Scenes ----
          isolate: keeps the scenes' z-index stacking inside this layer, so the photos always sit
          under the contrast overlays below (even when no transform is active) */}
      <motion.div className="absolute inset-0 isolate" style={{ scale: reduceMotion ? 1 : exitScale }}>
        {/* Settles from a slight zoom as the intro opens onto it */}
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={revealed ? { scale: 1 } : undefined}
          transition={{ duration: 2.4, ease: EASE_OUT_EXPO }}
        >
          <motion.div className="absolute -inset-6" style={{ x: bgX, y: bgY }}>
            {SCENES.map((s, idx) => {
              const isCurrent = idx === scene.current;
              const isPrevious = idx === scene.previous;
              if (idx !== 0 && !mountAll) return null;
              return (
                <motion.div
                  key={s.image}
                  className="absolute inset-0 overflow-hidden"
                  style={{
                    zIndex: isCurrent ? 3 : isPrevious ? 2 : 1,
                    opacity: isCurrent || isPrevious ? 1 : 0,
                    clipPath: isCurrent ? wipeClip : undefined,
                  }}
                  aria-hidden="true"
                >
                  {/* Ken Burns as a CSS animation (runs on the compositor): a slow push and drift
                      while the scene is on, held while the next scene wipes over it */}
                  <img
                    src={s.image}
                    srcSet={s.srcSet}
                    sizes={s.srcSet ? '100vw' : undefined}
                    alt=""
                    draggable={false}
                    className={`h-full w-full object-cover object-center ${
                      (isCurrent && revealed) || isPrevious ? 'hero-kenburns' : ''
                    }`}
                    style={{ ['--drift' as string]: DRIFT[idx], animationDuration: `${SCENE_MS + WIPE_MS + 1000}ms` }}
                    {...(idx === 0 ? { fetchPriority: 'high' as any, 'data-hero-image': true } : {})}
                  />
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>

        {/* Gold light along the wipe's leading edge */}
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute top-1/2 z-[4] w-[2px]"
          style={{
            left: edgeLeft,
            opacity: edgeOpacity,
            height: `${(size.h / Math.cos((edgeAngle * Math.PI) / 180)) * 1.1}px`,
            translateY: '-50%',
            rotate: edgeAngle,
            background: 'linear-gradient(180deg, transparent, #FFD98A 20%, #F4A300 50%, #FFD98A 80%, transparent)',
            boxShadow: '0 0 18px 4px rgba(244,163,0,0.55), 0 0 60px 12px rgba(244,163,0,0.25)',
          }}
        />
      </motion.div>

      {/* Atmosphere: left-side contrast for the headline, floor shade, and the scroll-exit darkening */}
      <div className="pointer-events-none absolute inset-0 bg-navy-950/25" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/45 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/85 via-transparent to-navy-950/35" />
      <motion.div className="pointer-events-none absolute inset-0 bg-navy-950" style={{ opacity: reduceMotion ? 0 : exitShade }} />

      {/* ---- Headline, copy and search ---- */}
      <motion.div
        className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8"
        style={reduceMotion ? undefined : { y: exitContentY, opacity: exitContentOpacity }}
      >
        <motion.div className="max-w-xl lg:max-w-2xl text-left" style={reduceMotion ? undefined : { x: fgX, y: fgY }}>
          <motion.div {...enter(0)} className="flex items-center gap-2.5">
            <img src="/images/boamcompactmonogram.png" alt="" className="h-6 w-auto brightness-0 invert opacity-90" />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">BOAM Real-Estates</span>
          </motion.div>

          <h1
            className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.05]"
            aria-label="Property, with confidence."
          >
            <span aria-hidden="true" className="block overflow-hidden pb-[0.08em] -mb-[0.08em]">
              <motion.span
                className="block"
                initial={{ y: '110%' }}
                animate={revealed ? { y: '0%' } : undefined}
                transition={{ duration: 1.05, delay: introDelay + 0.08, ease: EASE_OUT_EXPO }}
              >
                Property, with
              </motion.span>
            </span>
            <span aria-hidden="true" className="block overflow-hidden pb-[0.32em] -mb-[0.32em]">
              <motion.span
                className="relative inline-block text-amber-400"
                initial={{ y: '110%' }}
                animate={revealed ? { y: '0%' } : undefined}
                transition={{ duration: 1.05, delay: introDelay + 0.2, ease: EASE_OUT_EXPO }}
              >
                confidence.
                {/* Brush-stroke underline drawn after the word lands */}
                <svg
                  className="absolute -bottom-[0.22em] left-0 h-[0.28em] w-[94%]"
                  viewBox="0 0 300 24"
                  preserveAspectRatio="none"
                  fill="none"
                >
                  <motion.path
                    d="M3 17 C 70 6, 160 4, 297 12"
                    stroke="#F4A300"
                    strokeWidth="5"
                    strokeLinecap="round"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={revealed ? { pathLength: 1, opacity: 0.9 } : undefined}
                    transition={{ duration: 1.1, delay: introDelay + 0.9, ease: [0.65, 0, 0.35, 1] }}
                  />
                </svg>
              </motion.span>
            </span>
          </h1>

          <motion.p
            {...enter(0.34)}
            className="mt-6 text-base font-normal leading-relaxed text-white/80 sm:text-lg lg:text-xl max-w-lg"
          >
            Explore houses, apartments, villas and prime land opportunities across Sri Lanka.
          </motion.p>

          {/* Search Panel */}
          <motion.form {...enter(0.48)} onSubmit={submit} className="mt-8 w-full max-w-2xl" role="search">
            <div className="flex flex-col gap-2.5 rounded-3xl bg-white p-3 shadow-2xl border border-white/20 transition-shadow duration-300 focus-within:shadow-[0_0_0_3px_rgba(244,163,0,0.45),0_25px_50px_-12px_rgba(0,0,0,0.5)] sm:flex-row sm:items-center sm:rounded-full sm:p-2 sm:pr-2.5">
              {/* Location Autocomplete Input */}
              <div className="relative flex-1">
                <label htmlFor="hero-location" className="sr-only">
                  Location
                </label>
                <div className="flex items-center gap-3 px-4 py-3 sm:py-2.5">
                  <MapPinIcon className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                  <input
                    id="hero-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => window.setTimeout(() => setFocused(false), 150)}
                    placeholder="City, district or neighbourhood"
                    autoComplete="off"
                    className="w-full bg-transparent text-sm sm:text-base font-medium text-navy-900 placeholder:text-navy-800/40 focus:outline-none"
                  />
                </div>

                {/* Suggestions Popover */}
                <AnimatePresence>
                  {focused && suggestions.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.18 }}
                      className="absolute left-0 top-full z-30 mt-2.5 w-full overflow-hidden rounded-2xl bg-white py-2 text-left shadow-2xl border border-navy-100"
                    >
                      {suggestions.map((city) => (
                        <li key={city}>
                          <button
                            type="button"
                            onClick={() => setLocation(city)}
                            className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                          >
                            <MapPinIcon className="h-4 w-4 text-navy-400" aria-hidden="true" />
                            {city}
                          </button>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              <div className="hidden h-7 w-px bg-navy-100 sm:block" />

              {/* Property Type Dropdown */}
              <div className="relative sm:w-48">
                <label htmlFor="hero-type" className="sr-only">
                  Property type
                </label>
                <select
                  id="hero-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none rounded-2xl bg-transparent px-4 py-3 pr-10 text-sm sm:text-base font-medium text-navy-900 focus:outline-none sm:py-2.5 cursor-pointer"
                >
                  <option value="">Any property type</option>
                  {propertyTypes.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <ChevronDownIcon
                  className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                  aria-hidden="true"
                />
              </div>

              <button
                type="submit"
                className="group flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-7 py-3 text-sm font-bold text-navy-950 transition-all duration-200 hover:bg-amber-400 hover:shadow-[0_8px_24px_-6px_rgba(244,163,0,0.6)] active:scale-[0.99] sm:rounded-full shrink-0"
              >
                <SearchIcon className="h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
                <span>Search</span>
              </button>
            </div>
          </motion.form>
        </motion.div>
      </motion.div>

      {/* ---- "Now showing" chapter card (desktop) ---- */}
      <motion.div
        className="absolute bottom-10 right-6 z-20 hidden w-[340px] lg:block xl:right-10"
        style={reduceMotion ? undefined : { opacity: exitChromeOpacity }}
      >
        <motion.div
          {...enter(0.7)}
          className="rounded-2xl border border-white/10 bg-navy-950/80 p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between">
            <span className="font-mono text-[11px] font-bold tracking-[0.2em] text-amber-400">
              {String(scene.current + 1).padStart(2, '0')} / {String(SCENES.length).padStart(2, '0')}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-white/45">Now showing</span>
          </div>

          <div className="relative mt-3 h-[78px] overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={scene.current}
                className="absolute inset-0"
                initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
                transition={{ duration: 0.55, ease: EASE_OUT_EXPO }}
              >
                <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-amber-300/90">
                  <MapPinIcon className="h-3 w-3" aria-hidden="true" />
                  {active.place} · {active.region}
                </p>
                <p className="mt-1 line-clamp-1 text-[15px] font-extrabold text-white">{active.title}</p>
                <Link
                  href={active.href}
                  className="group mt-2 inline-flex items-center gap-1 text-xs font-bold text-white/70 transition-colors hover:text-amber-400"
                >
                  {active.cta}
                  <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-1.5" role="tablist" aria-label="Hero scenes">
            {SCENES.map((s, idx) => (
              <button
                key={s.image}
                type="button"
                role="tab"
                aria-selected={idx === scene.current}
                aria-label={`Show ${s.place}`}
                onClick={() => goTo(idx)}
                className="group flex h-6 items-center"
              >
                <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/20 transition-colors group-hover:bg-white/35">
                  <ChapterFill idx={idx} current={scene.current} autoplay={autoplay} onDone={advance} />
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ---- Mobile chapter bars + place ---- */}
      <motion.div
        className="absolute inset-x-4 bottom-16 z-20 lg:hidden"
        style={reduceMotion ? undefined : { opacity: exitChromeOpacity }}
      >
        <motion.div {...enter(0.7)}>
          <p className="mb-2 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
            <MapPinIcon className="h-3 w-3 text-amber-400" aria-hidden="true" />
            {active.place}
          </p>
          <div className="grid grid-cols-4 gap-1.5" role="tablist" aria-label="Hero scenes">
            {SCENES.map((s, idx) => (
              <button
                key={s.image}
                type="button"
                role="tab"
                aria-selected={idx === scene.current}
                aria-label={`Show ${s.place}`}
                onClick={() => goTo(idx)}
                className="flex h-8 items-center"
              >
                <span className="relative block h-[3px] w-full overflow-hidden rounded-full bg-white/25">
                  <ChapterFill idx={idx} current={scene.current} autoplay={autoplay} onDone={advance} />
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* ---- Scroll cue (desktop) ---- */}
      <motion.div
        className="absolute bottom-10 left-1/2 z-20 hidden -translate-x-1/2 flex-col items-center gap-2 lg:flex"
        style={reduceMotion ? undefined : { opacity: exitChromeOpacity }}
        aria-hidden="true"
      >
        <motion.span {...enter(0.9)} className="text-[10px] font-bold uppercase tracking-[0.3em] text-white/55">
          Scroll
        </motion.span>
        <span className="relative block h-10 w-px overflow-hidden bg-white/20">
          <span className="hero-scroll-cue absolute inset-x-0 top-0 h-1/2 bg-amber-400" />
        </span>
      </motion.div>
    </section>
  );
}
