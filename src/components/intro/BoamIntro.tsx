'use client';

import React, { useEffect, useRef, useState } from 'react';
import { AnimatePresence, MotionConfig, animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { INTRO_SESSION_KEY, markRevealed, waitForHeroImage } from '@/lib/intro';

/**
 * BOAM homepage intro — a short cinematic title sequence that plays once per session:
 *
 *  1. Scouting  — letterboxed navy frame, blueprint grid and film grain; a gold horizon line
 *                 draws out while location title cards flick through BOAM's markets.
 *  2. Brand     — the camera lifts: the gold monogram rises and catches a light sweep, the
 *                 BOAM letters rise one by one, and the horizon line splits into the two rules
 *                 that flank "REAL ESTATES" in the logo.
 *  3. Open      — the lockup falls away, a gold house outline (the logo's roof and window) draws
 *                 at centre, its interior "lights up" as a window onto the hero photo, then the
 *                 house-shaped window opens out past the screen edges onto the homepage.
 *
 * The veil is server-rendered so the homepage never flashes before it; a head script in the
 * root layout hides it when the intro has already played this session.
 */

// ---- Brand palette (gold measured from the logo artwork) ----
const GOLD = '#CDA776';
const GOLD_LIGHT = '#EBD5A8';
const IVORY = '#F6F0E4';
const NAVY_CENTER = '#10304f';
const VEIL_BACKGROUND = `radial-gradient(120% 95% at 50% 50%, ${NAVY_CENTER} 0%, #0b2440 42%, #061529 100%)`;

const MARK_SRC = '/images/intro/boam-mark.webp';
const WORDMARK_SRC = '/images/intro/boam-wordmark.webp';

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

// Title cards: where BOAM's listings are, ending on the whole island
const LOCATIONS = [
  { name: 'Colombo', coords: '6.9271° N · 79.8612° E' },
  { name: 'Kandy', coords: '7.2906° N · 80.6337° E' },
  { name: 'Galle', coords: '6.0535° N · 80.2210° E' },
  { name: 'Nuwara Eliya', coords: '6.9497° N · 80.7891° E' },
  { name: 'Sri Lanka', coords: '7.8731° N · 80.7718° E' },
];

// ---- Timeline (ms) ----
const ASSET_WAIT_MS = 1200;
const CITY_MS = 340;
const FINAL_CITY_HOLD_MS = 620;
const BRAND_HOLD_MS = 1500;
const MEDIA_WAIT_MS = 3000;
const LOCKUP_OUT_MS = 420;
const OUTLINE_DRAW_MS = 650;
const LIGHTS_ON_MS = 340;
const OPEN_MS = 1250;
/** Absolute cap: never hold the homepage longer than this, whatever stalls */
const HARD_CAP_MS = 16000;

// ---- Logo geometry, in source pixels of the full logo (wordmark is 1004 wide) ----
// Measured from /images/boamnormallogo.png so the lockup matches the real logo.
const WORDMARK_W = 1004;
const u = (px: number) => `calc(var(--w) * ${(px / WORDMARK_W).toFixed(5)})`;
const pct = (n: number) => `${(n * 100).toFixed(4)}%`;
/** [left, width] of each wordmark letter (B, O, Λ, M), padded 2px for anti-aliasing */
const LETTERS: Array<[number, number]> = [
  [0, 183],
  [260, 207],
  [513, 221],
  [792, 212],
];
/** The monogram sits 16.5px right of the wordmark's centre in the logo */
const MARK_SHIFT = pct(16.5 / 431);
/** Scouting frames the horizon line at screen centre; brand lifts to centre the full logo */
const SCOUT_LIFT = pct(-325.5 / 682);
/** Tagline rules: 214px long, ending 288.5px from centre (x is relative to the 460px line) */
const RULE_SCALE = 214 / 460;
const RULE_SHIFT = pct(288.5 / 460);

// ---- House window (unit coordinates, centred on the screen) ----
const HOUSE: Array<[number, number]> = [
  [-1, 0.85],
  [-1, -0.15],
  [0, -0.85],
  [1, -0.15],
  [1, 0.85],
];
/** The logo's four-pane window, as [x, y] of each pane's top-left, pane size 0.13 */
const PANES: Array<[number, number]> = [
  [-0.155, 0.045],
  [0.025, 0.045],
  [-0.155, 0.225],
  [0.025, 0.225],
];

type Act = 'idle' | 'scout' | 'brand' | 'exit';

const housePoints = (s: number, cx: number, cy: number) =>
  HOUSE.map(([x, y]) => `${(cx + x * s).toFixed(2)}px ${(cy + y * s).toFixed(2)}px`);

/** Full-screen veil with a house-shaped hole (evenodd), vertex count constant for animation */
const veilClip = (s: number, w: number, h: number) => {
  const pts = housePoints(s, w / 2, h / 2);
  return `polygon(evenodd, 0px 0px, ${w}px 0px, ${w}px ${h}px, 0px ${h}px, 0px 0px, ${pts.join(', ')}, ${pts[0]})`;
};

const housePath = (s: number, cx: number, cy: number) =>
  `M ${HOUSE.map(([x, y]) => `${(cx + x * s).toFixed(2)} ${(cy + y * s).toFixed(2)}`).join(' L ')} Z`;

const easeInOutQuart = (t: number) => (t < 0.5 ? 8 * t ** 4 : 1 - (-2 * t + 2) ** 4 / 2);

export default function BoamIntro() {
  const [done, setDone] = useState(false);
  const [act, setAct] = useState<Act>('idle');
  const [cityIndex, setCityIndex] = useState(-1);
  const [house, setHouse] = useState<{ s0: number; w: number; h: number } | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const veilRef = useRef<HTMLDivElement>(null);
  const markImgRef = useRef<HTMLImageElement>(null);
  const outlineSvgRef = useRef<SVGSVGElement>(null);
  const outlinePathRef = useRef<SVGPathElement>(null);
  const coverRef = useRef<SVGPathElement>(null);
  const panesRef = useRef<SVGGElement>(null);
  const skipRef = useRef<() => void>(() => {});

  const progress = useMotionValue(0);
  const progressLabel = useTransform(progress, (v) => `${String(Math.round(v * 100)).padStart(2, '0')}%`);

  useEffect(() => {
    // Per-run flags (not refs) so React's dev double-mount can't resume a cancelled run
    let cancelled = false;
    let skipped = false;
    let revealedHere = false;
    const wakers = new Set<() => void>();

    const root = rootRef.current;
    const veil = veilRef.current;
    if (!root || !veil) return;

    const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));
    /** Like sleep, but a skip request ends it early */
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        const wake = () => {
          clearTimeout(timer);
          wakers.delete(wake);
          resolve();
        };
        const timer = setTimeout(wake, ms);
        wakers.add(wake);
      });
    /** Background tabs get no animation frames: hold the sequence until the page is on screen */
    const whenVisible = () =>
      new Promise<void>((resolve) => {
        if (!document.hidden) return resolve();
        const onVisible = () => {
          if (document.hidden) return;
          document.removeEventListener('visibilitychange', onVisible);
          resolve();
        };
        document.addEventListener('visibilitychange', onVisible);
      });
    skipRef.current = () => {
      if (skipped) return;
      skipped = true;
      wakers.forEach((wake) => wake());
    };

    const reveal = (introPlayed: boolean) => {
      if (revealedHere) return;
      revealedHere = true;
      try {
        sessionStorage.setItem(INTRO_SESSION_KEY, 'done');
      } catch {
        // private mode / storage disabled
      }
      markRevealed(introPlayed);
    };

    let seen = false;
    try {
      seen = sessionStorage.getItem(INTRO_SESSION_KEY) === 'done';
    } catch {
      // storage disabled — treat as unseen
    }
    if (seen) {
      reveal(false);
      setDone(true);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Lock the page behind the intro: no scrolling, and no tabbing into hidden links
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' as ScrollBehavior });
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    // The intro renders inside <main>, so inert every sibling along its ancestor chain
    const inerted: HTMLElement[] = [];
    for (let node: HTMLElement | null = root; node && node !== document.body; node = node.parentElement) {
      const parent: HTMLElement | null = node.parentElement;
      if (!parent) break;
      for (const sibling of Array.from<Element>(parent.children)) {
        if (sibling !== node && sibling instanceof HTMLElement && !sibling.inert && sibling.tagName !== 'SCRIPT') {
          sibling.inert = true;
          inerted.push(sibling);
        }
      }
    }
    const release = () => {
      document.body.style.overflow = prevOverflow;
      inerted.forEach((el) => {
        el.inert = false;
      });
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') skipRef.current();
    };
    window.addEventListener('keydown', onKey);

    let finished = false;
    let hardCap: ReturnType<typeof setTimeout> | undefined;
    const finish = () => {
      if (cancelled || finished) return;
      finished = true;
      clearTimeout(hardCap);
      release();
      document.documentElement.classList.add('intro-seen');
      setDone(true);
    };

    const loadImage = (src: string) => {
      const img = new Image();
      img.src = src;
      return img.decode().catch(() => undefined);
    };
    const assetsReady = Promise.all([
      markImgRef.current?.decode().catch(() => undefined),
      loadImage(WORDMARK_SRC),
    ]);
    const heroReady = waitForHeroImage(MEDIA_WAIT_MS + 4000);

    const openIntoHomepage = async () => {
      await whenVisible();
      if (cancelled) return;
      const rect = veil.getBoundingClientRect();
      const w = rect.width || window.innerWidth;
      const h = rect.height || window.innerHeight;
      const cx = w / 2;
      const cy = h / 2;
      const s0 = Math.round(Math.min(w, h) * 0.075);
      // Large enough that every screen corner sits inside the house (under the roof slope)
      const sEnd = Math.max(cx, (cy + 0.7 * cx) / 0.85) * 1.12;

      setAct('exit');
      setHouse({ s0, w, h });
      await sleep(LOCKUP_OUT_MS * 0.6);
      if (cancelled) return;

      // Draw the gold house outline around a closed (navy) interior
      const path = outlinePathRef.current;
      const cover = coverRef.current;
      const panes = panesRef.current;
      const svg = outlineSvgRef.current;
      if (!path || !cover || !panes || !svg) {
        reveal(true);
        finish();
        return;
      }
      path.style.transition = `stroke-dashoffset ${OUTLINE_DRAW_MS}ms cubic-bezier(0.65, 0, 0.35, 1)`;
      path.style.strokeDashoffset = '0';
      panes.style.transition = `opacity 400ms ease ${OUTLINE_DRAW_MS * 0.55}ms`;
      panes.style.opacity = '1';
      await sleep(OUTLINE_DRAW_MS + 60);
      if (cancelled) return;

      // Lights on: cut the house-shaped hole, then fade the navy interior to show the hero
      veil.style.clipPath = veilClip(s0, w, h);
      cover.style.transition = `opacity ${LIGHTS_ON_MS}ms ease-out`;
      cover.style.opacity = '0';
      panes.style.transition = `opacity ${LIGHTS_ON_MS}ms ease-out`;
      panes.style.opacity = '0';
      await sleep(LIGHTS_ON_MS + 120);
      if (cancelled) return;

      // Open the window out past the screen edges; the outline rides the opening edge
      reveal(true);
      const opened = new Promise<void>((resolve) => {
        const start = performance.now();
        const frame = (now: number) => {
          if (cancelled) return resolve();
          const t = Math.min(1, (now - start) / OPEN_MS);
          const s = s0 + (sEnd - s0) * easeInOutQuart(t);
          veil.style.clipPath = veilClip(s, w, h);
          path.setAttribute('d', housePath(s, cx, cy));
          svg.style.opacity = String(1 - Math.min(1, Math.max(0, (t - 0.3) / 0.45)));
          if (t < 1) requestAnimationFrame(frame);
          else resolve();
        };
        requestAnimationFrame(frame);
      });
      await Promise.race([opened, sleep(OPEN_MS + 1200)]);
      finish();
    };

    const run = async () => {
      hardCap = setTimeout(() => {
        reveal(false);
        finish();
      }, HARD_CAP_MS);

      if (reduceMotion) {
        // No montage or camera moves: show the logo briefly, then fade to the homepage
        setAct('brand');
        progress.set(1);
        await Promise.race([Promise.all([assetsReady, heroReady]), sleep(1500)]);
        await wait(900);
        if (cancelled) return;
        reveal(false);
        const fade = root.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 450, easing: 'ease-out', fill: 'forwards' });
        await Promise.race([fade.finished.catch(() => undefined), sleep(800)]);
        finish();
        return;
      }

      animate(progress, 0.12, { duration: 0.8, ease: 'easeOut' });
      await Promise.race([assetsReady, sleep(ASSET_WAIT_MS)]);
      await whenVisible();
      if (cancelled) return;

      if (!skipped) {
        setAct('scout');
        const scoutMs = CITY_MS * (LOCATIONS.length - 1) + FINAL_CITY_HOLD_MS;
        animate(progress, 0.45, { duration: scoutMs / 1000, ease: 'linear' });
        for (let i = 0; i < LOCATIONS.length && !skipped; i++) {
          setCityIndex(i);
          await wait(i === LOCATIONS.length - 1 ? FINAL_CITY_HOLD_MS : CITY_MS);
          if (cancelled) return;
        }
      }

      if (!skipped) {
        setCityIndex(-1);
        setAct('brand');
        animate(progress, 0.9, { duration: BRAND_HOLD_MS / 1000, ease: 'easeOut' });
        await wait(BRAND_HOLD_MS);
        if (cancelled) return;
      }

      // Never open onto a blank hero (capped for slow connections)
      await Promise.race([heroReady, sleep(skipped ? 1500 : MEDIA_WAIT_MS)]);
      if (cancelled) return;
      setCityIndex(-1);
      animate(progress, 1, { duration: 0.3, ease: 'easeOut' });
      await openIntoHomepage();
    };

    void run();

    return () => {
      cancelled = true;
      clearTimeout(hardCap);
      wakers.forEach((wake) => wake());
      window.removeEventListener('keydown', onKey);
      release();
    };
  }, [progress]);

  if (done) return null;

  const started = act !== 'idle';
  const brandOn = act === 'brand' || act === 'exit';
  const exiting = act === 'exit';
  const location = cityIndex >= 0 ? LOCATIONS[cityIndex] : null;

  return (
    <MotionConfig reducedMotion="user">
      <div ref={rootRef} data-intro aria-hidden="true" className="fixed inset-0 z-[100] select-none">
        {/* ---- Veil: everything that covers the page (gets the house-shaped hole on exit) ---- */}
        <div ref={veilRef} className="absolute inset-0 overflow-hidden" style={{ background: VEIL_BACKGROUND }}>
          {/* Blueprint grid with a slow camera push-in */}
          <motion.div
            className="intro-grid absolute inset-[-6%]"
            initial={{ opacity: 0, scale: 1 }}
            animate={{ opacity: started && !exiting ? 1 : 0, scale: 1.08 }}
            transition={{ opacity: { duration: 1.2, ease: 'easeOut' }, scale: { duration: 7, ease: 'linear' } }}
          />

          {/* Warm light behind the lockup */}
          <motion.div
            className="absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] rounded-full"
            style={{
              // Centred via motion x/y: a Tailwind translate would be overwritten by the scale animation
              x: '-50%',
              y: '-50%',
              background:
                'radial-gradient(circle, rgba(244,163,0,0.16) 0%, rgba(205,167,118,0.07) 38%, transparent 68%)',
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: exiting ? 0 : brandOn ? 1 : started ? 0.5 : 0, scale: brandOn ? 1.08 : 0.95 }}
            transition={{ duration: 1.4, ease: 'easeOut' }}
          />

          {/* Film grain */}
          <div
            className={`intro-grain pointer-events-none absolute inset-[-50%] mix-blend-overlay transition-opacity duration-500 ${
              exiting ? 'opacity-0' : 'opacity-[0.07]'
            }`}
          />

          {/* ---- Logo lockup (proportions match the real logo) ---- */}
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="relative flex flex-col items-center"
              style={{ ['--w' as string]: 'clamp(230px, 60vw, 440px)' }}
              initial={{ y: SCOUT_LIFT, opacity: 1, scale: 1, filter: 'blur(0px)' }}
              animate={{
                y: brandOn ? '0%' : SCOUT_LIFT,
                opacity: exiting ? 0 : 1,
                scale: exiting ? 0.93 : 1,
                filter: exiting ? 'blur(6px)' : 'blur(0px)',
              }}
              transition={
                exiting
                  ? { duration: LOCKUP_OUT_MS / 1000, ease: [0.4, 0, 1, 1] }
                  : { duration: 1.3, ease: EASE_OUT_EXPO }
              }
            >
              {/* Monogram: rises out of the ground like a building, then catches the light */}
              <div className="relative" style={{ width: u(431), transform: `translateX(${MARK_SHIFT})` }}>
                <motion.div
                  className="relative"
                  style={{ aspectRatio: '431 / 383' }}
                  initial={{ opacity: 0, y: 26, clipPath: 'inset(100% 0% 0% 0%)', filter: 'blur(10px)' }}
                  animate={
                    brandOn
                      ? { opacity: 1, y: 0, clipPath: 'inset(0% 0% 0% 0%)', filter: 'blur(0px)' }
                      : undefined
                  }
                  transition={{ duration: 1.05, ease: EASE_OUT_EXPO }}
                >
                  <img
                    ref={markImgRef}
                    src={MARK_SRC}
                    alt=""
                    draggable={false}
                    decoding="async"
                    className="h-full w-full drop-shadow-[0_10px_30px_rgba(244,163,0,0.18)]"
                  />
                  <motion.div
                    className="absolute inset-0"
                    style={{
                      WebkitMaskImage: `url(${MARK_SRC})`,
                      maskImage: `url(${MARK_SRC})`,
                      WebkitMaskSize: '100% 100%',
                      maskSize: '100% 100%',
                      backgroundImage:
                        'linear-gradient(105deg, transparent 40%, rgba(255,248,230,0.95) 50%, transparent 60%)',
                      backgroundSize: '300% 100%',
                      mixBlendMode: 'screen',
                    }}
                    initial={{ backgroundPosition: '100% 0%' }}
                    animate={brandOn ? { backgroundPosition: '0% 0%' } : undefined}
                    transition={{ delay: 0.7, duration: 1.2, ease: [0.45, 0, 0.2, 1] }}
                  />
                </motion.div>
              </div>

              {/* Wordmark: each letter rises inside its own slot */}
              <div className="relative" style={{ width: 'var(--w)', aspectRatio: '1004 / 177', marginTop: u(51) }}>
                {LETTERS.map(([x, width], i) => (
                  <div
                    key={x}
                    className="absolute top-0 h-full overflow-hidden"
                    style={{ left: pct(x / WORDMARK_W), width: pct(width / WORDMARK_W) }}
                  >
                    <motion.div
                      className="absolute top-0 h-full"
                      style={{
                        left: pct(-x / width),
                        width: pct(WORDMARK_W / width),
                        background: `linear-gradient(180deg, ${IVORY} 0%, ${IVORY} 55%, ${GOLD_LIGHT} 100%)`,
                        WebkitMaskImage: `url(${WORDMARK_SRC})`,
                        maskImage: `url(${WORDMARK_SRC})`,
                        WebkitMaskSize: '100% 100%',
                        maskSize: '100% 100%',
                      }}
                      initial={{ y: '112%' }}
                      animate={brandOn ? { y: '0%' } : undefined}
                      transition={{ delay: 0.28 + i * 0.08, duration: 1, ease: EASE_OUT_EXPO }}
                    />
                  </div>
                ))}
              </div>

              {/* Horizon line → tagline rules, with the location title cards around it */}
              <div className="relative" style={{ width: 'var(--w)', height: u(31), marginTop: u(40) }}>
                <motion.span
                  className="absolute top-1/2 h-px origin-right"
                  style={{ right: '50%', width: u(460), background: `linear-gradient(90deg, transparent, ${GOLD} 55%)` }}
                  initial={{ scaleX: 0, x: '0%' }}
                  animate={brandOn ? { scaleX: RULE_SCALE, x: `-${RULE_SHIFT}` } : { scaleX: started ? 1 : 0, x: '0%' }}
                  transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: brandOn ? 0.15 : 0.1 }}
                />
                <motion.span
                  className="absolute top-1/2 h-px origin-left"
                  style={{ left: '50%', width: u(460), background: `linear-gradient(270deg, transparent, ${GOLD} 55%)` }}
                  initial={{ scaleX: 0, x: '0%' }}
                  animate={brandOn ? { scaleX: RULE_SCALE, x: RULE_SHIFT } : { scaleX: started ? 1 : 0, x: '0%' }}
                  transition={{ duration: 1.1, ease: EASE_OUT_EXPO, delay: brandOn ? 0.15 : 0.1 }}
                />

                <motion.span
                  className="absolute inset-0 flex items-center justify-center whitespace-nowrap font-normal uppercase leading-none"
                  style={{ fontSize: u(40), color: GOLD }}
                  initial={{ opacity: 0, letterSpacing: '0.95em', paddingLeft: '0.95em' }}
                  animate={brandOn ? { opacity: 1, letterSpacing: '0.34em', paddingLeft: '0.34em' } : undefined}
                  transition={{ delay: 0.55, duration: 1.2, ease: EASE_OUT_EXPO }}
                >
                  Real Estates
                </motion.span>

                <AnimatePresence initial={false}>
                  {location && (
                    <motion.span
                      key={location.name}
                      className="absolute inset-x-0 whitespace-nowrap text-center font-light uppercase leading-none"
                      style={{
                        bottom: `calc(100% + ${u(30)})`,
                        fontSize: `max(20px, ${u(80)})`,
                        letterSpacing: '0.34em',
                        paddingLeft: '0.34em',
                        color: IVORY,
                      }}
                      initial={{ opacity: 0, y: '55%', filter: 'blur(8px)' }}
                      animate={{ opacity: 1, y: '0%', filter: 'blur(0px)' }}
                      exit={{ opacity: 0, y: '-55%', filter: 'blur(8px)' }}
                      transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                      {location.name}
                    </motion.span>
                  )}
                  {location && (
                    <motion.span
                      key={location.coords}
                      className="absolute inset-x-0 whitespace-nowrap text-center font-mono leading-none tabular-nums"
                      style={{
                        top: `calc(100% + ${u(34)})`,
                        fontSize: `max(10px, ${u(24)})`,
                        letterSpacing: '0.22em',
                        color: GOLD,
                      }}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 0.75 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.22 }}
                    >
                      {location.coords}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          {/* Letterbox bars with slate details and progress */}
          <motion.div
            className="absolute inset-x-0 top-0 flex h-[clamp(40px,8svh,80px)] origin-top items-center justify-between bg-[#040d18] px-5 sm:px-8"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: started && !exiting ? 1 : 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <span className="text-[9px] font-semibold uppercase tracking-[0.32em] sm:text-[10px]" style={{ color: `${GOLD}b3` }}>
              BOAM Real Estates
            </span>
            <span className="hidden text-[9px] font-semibold uppercase tracking-[0.32em] text-white/40 sm:block sm:text-[10px]">
              Exclusive Sri Lanka Property Portfolio
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-x-0 bottom-0 flex h-[clamp(40px,8svh,80px)] origin-bottom items-center justify-between bg-[#040d18] px-5 sm:px-8"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: started && !exiting ? 1 : 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
          >
            <motion.span
              className="absolute left-0 top-0 h-px w-full origin-left"
              style={{ scaleX: progress, background: `linear-gradient(90deg, transparent, ${GOLD} 30%, ${GOLD_LIGHT})` }}
            />
            <motion.span className="font-mono text-[10px] tabular-nums tracking-[0.2em]" style={{ color: `${GOLD}99` }}>
              {progressLabel}
            </motion.span>
            <button
              type="button"
              tabIndex={-1}
              onClick={() => skipRef.current()}
              className="pointer-events-auto text-[9px] font-semibold uppercase tracking-[0.32em] text-white/45 transition-colors hover:text-white sm:text-[10px]"
            >
              Skip intro
            </button>
          </motion.div>
        </div>

        {/* ---- House outline (above the veil so its stroke isn't clipped by the opening) ---- */}
        {house && (
          <svg
            ref={outlineSvgRef}
            className="pointer-events-none absolute inset-0 h-full w-full"
            width={house.w}
            height={house.h}
            viewBox={`0 0 ${house.w} ${house.h}`}
            style={{ filter: 'drop-shadow(0 0 6px rgba(244,163,0,0.55))' }}
          >
            <path ref={coverRef} d={housePath(house.s0, house.w / 2, house.h / 2)} fill={NAVY_CENTER} />
            <path
              ref={outlinePathRef}
              d={housePath(house.s0, house.w / 2, house.h / 2)}
              fill="none"
              stroke={GOLD_LIGHT}
              strokeWidth={1.75}
              strokeLinejoin="round"
              pathLength={1}
              style={{ strokeDasharray: 1, strokeDashoffset: 1 }}
            />
            <g ref={panesRef} fill={GOLD} style={{ opacity: 0 }}>
              {PANES.map(([x, y]) => (
                <rect
                  key={`${x}-${y}`}
                  x={house.w / 2 + x * house.s0}
                  y={house.h / 2 + y * house.s0}
                  width={0.13 * house.s0}
                  height={0.13 * house.s0}
                  rx={0.01 * house.s0}
                />
              ))}
            </g>
          </svg>
        )}
      </div>
    </MotionConfig>
  );
}
