'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  type MotionValue,
} from 'framer-motion';
import { CalendarCheck, Check, Home, KeyRound, MessageSquare, Search, Send, Trees } from 'lucide-react';
import { EASE_OUT_EXPO, Eyebrow, Reveal, RevealText } from '@/components/motion/Reveal';

/**
 * "From discovery to decision." — a journey from day into night.
 *
 * The section fades from the ivory above into navy dusk. A gold road draws itself as you scroll,
 * a glowing traveller moves along it, and each step lights up as the traveller reaches it. The
 * road ends at the BOAM house, which lights up when you arrive. The road is generated from the
 * measured positions of the step markers, so it always passes exactly through them.
 */

// ---------------------------------------------------------------------------------------------
// Step scenes (small, dark-theme vignettes inside each step card)
// ---------------------------------------------------------------------------------------------

function ExploreScene() {
  const results = [
    { icon: Home, label: 'House', place: 'Aniwatte, Kandy' },
    { icon: Trees, label: 'Land', place: 'Katugastota' },
    { icon: Home, label: 'House', place: 'Kandy' },
  ];
  return (
    <div>
      <div className="flex items-center gap-2 rounded-xl bg-white/[0.06] px-3 py-2.5 ring-1 ring-white/10">
        <Search className="h-3.5 w-3.5 text-amber-400" />
        <motion.span
          className="overflow-hidden whitespace-nowrap text-xs font-semibold text-white"
          initial={{ width: 0 }}
          animate={{ width: 'auto' }}
          transition={{ duration: 0.8, delay: 0.3, ease: 'linear' }}
        >
          Kandy
        </motion.span>
        <motion.span
          className="h-3.5 w-px bg-amber-400"
          animate={{ opacity: [1, 0, 1] }}
          transition={{ duration: 0.9, repeat: Infinity }}
        />
      </div>
      <div className="mt-2.5 space-y-1.5">
        {results.map(({ icon: Icon, label, place }, i) => (
          <motion.div
            key={place}
            className="flex items-center gap-2.5 rounded-lg bg-white/[0.04] px-3 py-2 text-[11px]"
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.1 + i * 0.14, ease: EASE_OUT_EXPO }}
          >
            <Icon className={`h-3.5 w-3.5 ${label === 'Land' ? 'text-sea-400' : 'text-amber-400'}`} />
            <span className="font-bold text-white">{label}</span>
            <span className="text-white/50">{place}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function EnquireScene() {
  return (
    <div className="rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/10">
      <motion.p
        className="text-xs font-medium leading-relaxed text-white/85"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >
        I&apos;d like to know more about this property and arrange a viewing.
      </motion.p>
      <div className="mt-3 flex items-center justify-between">
        <motion.span
          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-sea-400"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 1.5 }}
        >
          <Check className="h-3.5 w-3.5" /> Sent to BOAM
        </motion.span>
        <motion.span
          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-navy-950"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 0.85, 1.12, 1] }}
          transition={{ duration: 0.6, delay: 1.0 }}
        >
          <Send className="h-3.5 w-3.5" />
        </motion.span>
      </div>
    </div>
  );
}

function MoveScene() {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/[0.06] p-3 ring-1 ring-white/10">
      <motion.div
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-navy-950"
        initial={{ rotate: -90, scale: 0.6 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12, delay: 0.3 }}
      >
        <KeyRound className="h-5 w-5" />
      </motion.div>
      <div>
        <motion.p
          className="flex items-center gap-1.5 text-xs font-extrabold text-white"
          initial={{ opacity: 0, x: 8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.6, ease: EASE_OUT_EXPO }}
        >
          <CalendarCheck className="h-3.5 w-3.5 text-sea-400" /> Viewing arranged
        </motion.p>
        <motion.p
          className="mt-0.5 text-[11px] text-white/55"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          Your broker guides the next step with you
        </motion.p>
      </div>
    </div>
  );
}

const STEPS = [
  {
    number: '01',
    title: 'Explore',
    description: 'Browse homes and land based on location, property type and your needs.',
    icon: Search,
    Scene: ExploreScene,
  },
  {
    number: '02',
    title: 'Enquire',
    description: "Connect directly with BOAM about a property you're interested in.",
    icon: MessageSquare,
    Scene: EnquireScene,
  },
  {
    number: '03',
    title: 'Move Forward',
    description: 'Arrange the next conversation, viewing or decision with broker assistance.',
    icon: KeyRound,
    Scene: MoveScene,
  },
];

/** Fixed positions (no randomness, so server and client render the same sky) */
const STARS = [
  [8, 6, 1.5], [17, 14, 1], [26, 4, 1.2], [38, 11, 1], [47, 3, 1.6], [58, 9, 1], [66, 15, 1.3],
  [74, 5, 1], [83, 12, 1.5], [92, 7, 1.1], [12, 22, 1], [33, 19, 1.4], [52, 24, 1], [71, 21, 1.2],
  [88, 25, 1],
];

// ---------------------------------------------------------------------------------------------
// Journey
// ---------------------------------------------------------------------------------------------

interface Geometry {
  w: number;
  h: number;
  d: string;
  ys: number[];
}

function StepCard({ step, index, shown }: { step: (typeof STEPS)[number]; index: number; shown: boolean }) {
  const fromRight = index % 2 === 1;
  const { Scene } = step;
  return (
    <motion.div
      className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 shadow-[0_30px_60px_-30px_rgba(0,0,0,0.6)] backdrop-blur-sm sm:p-7"
      initial={{ opacity: 0, x: fromRight ? 40 : -40, filter: 'blur(8px)' }}
      animate={shown ? { opacity: 1, x: 0, filter: 'blur(0px)' } : undefined}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
    >
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-xs font-bold tracking-[0.2em] text-amber-400">STEP {step.number}</span>
      </div>
      <h3 className="mt-2 text-2xl font-extrabold tracking-tight text-white">{step.title}</h3>
      <p className="mt-2 text-sm font-medium leading-relaxed text-white/65">{step.description}</p>
      <div className="mt-5">{shown && <Scene />}</div>
    </motion.div>
  );
}

function StationNode({ lit, icon: Icon }: { lit: boolean; icon: React.ElementType }) {
  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <motion.span
        className="absolute inset-0 rounded-full bg-amber-400/40"
        initial={false}
        animate={lit ? { scale: [1, 1.9], opacity: [0.6, 0] } : { scale: 1, opacity: 0 }}
        transition={lit ? { duration: 1.8, repeat: Infinity, ease: 'easeOut' } : { duration: 0.3 }}
      />
      <span
        className={`relative flex h-12 w-12 items-center justify-center rounded-full border-2 transition-all duration-500 ${
          lit
            ? 'border-amber-300 bg-amber-500 text-navy-950 shadow-[0_0_30px_6px_rgba(244,163,0,0.45)]'
            : 'border-white/15 bg-navy-950 text-white/40'
        }`}
      >
        <Icon className="h-5 w-5" />
      </span>
    </div>
  );
}

function Journey() {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const stationRefs = useRef<Array<HTMLDivElement | null>>([]);
  const destRef = useRef<HTMLDivElement>(null);
  const stopsRef = useRef<number[]>([]);

  const [geo, setGeo] = useState<Geometry | null>(null);
  const [lit, setLit] = useState(0);
  const [shown, setShown] = useState(0);

  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start 72%', 'end 65%'] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24, restDelta: 0.0005 });
  const dotX = useMotionValue(0);
  const dotY = useMotionValue(0);

  // Build the road through the measured centres of each station and the destination
  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    const box = container.getBoundingClientRect();
    const centreY = (el: HTMLElement | null) => {
      if (!el) return 0;
      const r = el.getBoundingClientRect();
      return r.top - box.top + r.height / 2;
    };
    const desktop = window.innerWidth >= 1024;
    const cx = desktop ? box.width / 2 : 28;
    const amp = desktop ? 110 : 12;
    const ys = [...stationRefs.current.map(centreY), centreY(destRef.current)];

    let d = `M ${cx} 0`;
    let prev = 0;
    ys.forEach((y, i) => {
      const side = i % 2 === 0 ? 1 : -1;
      const dy = y - prev;
      d += ` C ${cx + side * amp} ${prev + dy * 0.3}, ${cx + side * amp} ${prev + dy * 0.7}, ${cx} ${y}`;
      prev = y;
    });
    setGeo({ w: box.width, h: box.height, d, ys });
  }, []);

  useEffect(() => {
    measure();
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(measure);
    observer.observe(container);
    return () => observer.disconnect();
  }, [measure]);

  /** Move the traveller to progress v along the road and light the stations it has passed */
  const follow = useCallback(
    (v: number) => {
      const path = pathRef.current;
      if (!path) return;
      const length = path.getTotalLength();
      const point = path.getPointAtLength(Math.min(1, Math.max(0, v)) * length);
      dotX.set(point.x);
      dotY.set(point.y);
      const passed = stopsRef.current.filter((stop) => v >= stop - 0.012).length;
      setLit(passed);
      setShown((s) => Math.max(s, passed));
    },
    [dotX, dotY]
  );

  // Where each station falls along the road (the road only ever heads downward)
  useEffect(() => {
    const path = pathRef.current;
    if (!geo || !path) return;
    const length = path.getTotalLength();
    const lengthAtY = (y: number) => {
      let lo = 0;
      let hi = length;
      for (let i = 0; i < 24; i++) {
        const mid = (lo + hi) / 2;
        if (path.getPointAtLength(mid).y < y) lo = mid;
        else hi = mid;
      }
      return (lo + hi) / 2 / length;
    };
    stopsRef.current = geo.ys.map(lengthAtY);
    if (reduceMotion) {
      setLit(geo.ys.length);
      setShown(geo.ys.length);
    } else {
      follow(progress.get());
    }
  }, [geo, follow, progress, reduceMotion]);

  useMotionValueEvent(progress, 'change', (v) => {
    if (!reduceMotion) follow(v);
  });

  const arrived = lit > STEPS.length;

  return (
    <div ref={containerRef} className="relative mx-auto mt-16 max-w-5xl lg:mt-20">
      {/* ---- The road ---- */}
      {geo && (
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full overflow-visible"
          viewBox={`0 0 ${geo.w} ${geo.h}`}
          fill="none"
          aria-hidden="true"
        >
          <path d={geo.d} stroke="rgba(255,255,255,0.12)" strokeWidth={2} strokeDasharray="2 10" strokeLinecap="round" />
          <motion.path
            ref={pathRef}
            d={geo.d}
            stroke="url(#journey-gold)"
            strokeWidth={3}
            strokeLinecap="round"
            style={{ pathLength: reduceMotion ? 1 : (progress as MotionValue<number>), filter: 'drop-shadow(0 0 6px rgba(244,163,0,0.65))' }}
          />
          <defs>
            <linearGradient id="journey-gold" x1="0" y1="0" x2="0" y2={geo.h} gradientUnits="userSpaceOnUse">
              <stop offset="0" stopColor="#FFD98A" />
              <stop offset="0.5" stopColor="#F4A300" />
              <stop offset="1" stopColor="#FFD98A" />
            </linearGradient>
          </defs>
        </svg>
      )}

      {/* ---- The traveller ---- */}
      {geo && !reduceMotion && (
        <motion.div
          className="pointer-events-none absolute left-0 top-0 z-20"
          style={{ x: dotX, y: dotY }}
          animate={{ opacity: arrived ? 0 : 1, scale: arrived ? 0.4 : 1 }}
          transition={{ duration: 0.5 }}
          aria-hidden="true"
        >
          <span className="absolute -left-5 -top-5 h-10 w-10 rounded-full bg-amber-400/25 blur-md" />
          <span className="absolute -left-2 -top-2 h-4 w-4 rounded-full bg-amber-300 shadow-[0_0_16px_6px_rgba(255,217,138,0.8)]" />
        </motion.div>
      )}

      {/* ---- Steps ---- */}
      {STEPS.map((step, i) => {
        const onRight = i % 2 === 1;
        return (
          <div key={step.number} className="relative grid grid-cols-1 items-center py-8 pl-16 lg:grid-cols-2 lg:gap-x-40 lg:py-14 lg:pl-0">
            <div
              ref={(el) => {
                stationRefs.current[i] = el;
              }}
              className="absolute left-[28px] top-14 z-10 -translate-x-1/2 -translate-y-1/2 lg:left-1/2 lg:top-1/2"
            >
              <StationNode lit={lit > i} icon={step.icon} />
            </div>
            <div className={onRight ? 'lg:col-start-2' : 'lg:col-start-1'}>
              <StepCard step={step} index={i} shown={shown > i} />
            </div>
          </div>
        );
      })}

      {/* ---- Destination: the BOAM house lights up on arrival ---- */}
      <div className="relative flex flex-col items-start pb-4 pl-16 pt-10 lg:items-center lg:pl-0 lg:pt-16">
        <div
          ref={destRef}
          className="absolute left-[28px] top-[4.25rem] -translate-x-1/2 -translate-y-1/2 lg:static lg:translate-x-0 lg:translate-y-0"
        >
          <motion.svg
            width="84"
            height="76"
            viewBox="-1.2 -1 2.4 2"
            fill="none"
            className="h-16 w-16 lg:h-20 lg:w-20"
            animate={{ filter: arrived ? 'drop-shadow(0 0 16px rgba(244,163,0,0.8))' : 'drop-shadow(0 0 0px rgba(244,163,0,0))' }}
            transition={{ duration: 0.8 }}
          >
            <motion.path
              d="M -1 0.85 L -1 -0.15 L 0 -0.85 L 1 -0.15 L 1 0.85 Z"
              stroke={arrived ? '#FFD98A' : 'rgba(255,255,255,0.25)'}
              strokeWidth={0.07}
              strokeLinejoin="round"
              fill={arrived ? 'rgba(244,163,0,0.12)' : 'transparent'}
              style={{ transition: 'stroke 0.6s, fill 0.6s' }}
            />
            {[
              [-0.155, 0.045],
              [0.025, 0.045],
              [-0.155, 0.225],
              [0.025, 0.225],
            ].map(([x, y], pane) => (
              <motion.rect
                key={pane}
                x={x}
                y={y}
                width={0.13}
                height={0.13}
                rx={0.015}
                initial={false}
                animate={{ fill: arrived ? '#F4A300' : 'rgba(255,255,255,0.2)' }}
                transition={{ duration: 0.4, delay: arrived ? 0.2 + pane * 0.12 : 0 }}
              />
            ))}
          </motion.svg>
        </div>
        <motion.div
          className="lg:mt-5 lg:text-center"
          initial={false}
          animate={{ opacity: arrived ? 1 : 0.35, y: arrived ? 0 : 6 }}
          transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-amber-400">Destination</p>
          <p className="mt-1 text-xl font-extrabold text-white">Your next property.</p>
        </motion.div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------------------------
// Section
// ---------------------------------------------------------------------------------------------

export function HowItWorks() {
  return (
    <section
      className="relative overflow-hidden pb-10 pt-48 sm:pb-12 lg:pb-12 lg:pt-56"
      style={{
        // Day into night: the warm ivory above fades through dusk into navy
        background: 'linear-gradient(to bottom, #F2EFE9 0px, #9aa3ad 90px, #2b4056 200px, #0C1F35 360px, #0C1F35 100%)',
      }}
    >
      {/* First stars coming out */}
      <div className="pointer-events-none absolute inset-x-0 top-[300px] h-[520px]" aria-hidden="true">
        {STARS.map(([x, y, size], i) => (
          <span
            key={i}
            className="journey-star absolute rounded-full bg-white"
            style={{ left: `${x}%`, top: `${y * 3.2}%`, width: size * 2, height: size * 2, animationDelay: `${(i % 5) * 0.7}s` }}
          />
        ))}
      </div>

      {/* Warm glow where the road begins */}
      <div
        className="pointer-events-none absolute left-1/2 top-[340px] h-[520px] w-[820px] -translate-x-1/2 rounded-full opacity-[0.14]"
        style={{ background: 'radial-gradient(circle, #C9972A 0%, transparent 65%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <Eyebrow tone="dark" className="lg:justify-center">
            Process
          </Eyebrow>
          <RevealText
            text={[{ text: 'From discovery to ' }, { text: 'decision.', className: 'text-amber-400' }]}
            className="mt-4 text-4xl font-extrabold leading-[1.08] tracking-tight text-white sm:text-5xl lg:text-6xl"
            delay={0.1}
          />
          <Reveal delay={0.35} y={16}>
            <p className="mt-5 text-base leading-relaxed text-white/65 sm:text-lg">
              Three simple steps to move from browsing to your next property conversation.
            </p>
          </Reveal>
        </div>

        <Journey />
      </div>
    </section>
  );
}
