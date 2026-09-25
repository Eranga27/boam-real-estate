'use client';

import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

/**
 * Shared scroll-reveal primitives for the homepage, so every section enters with the same
 * language: eyebrow rules that draw, headings that rise word by word out of a mask, and
 * content that settles up out of a soft blur. All of it respects prefers-reduced-motion via
 * the MotionConfig in HomeClient.
 */

export const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

/** Trigger slightly before an element is fully on screen, and only once */
const VIEWPORT = { once: true, margin: '0px 0px -12% 0px' } as const;

interface EyebrowProps {
  children: React.ReactNode;
  className?: string;
  /** Rule and text colour; gold on light sections, bright gold on dark ones */
  tone?: 'light' | 'dark';
}

/** Small uppercase section label with a gold rule that draws in before it */
export function Eyebrow({ children, className = '', tone = 'light' }: EyebrowProps) {
  const color = tone === 'dark' ? 'text-amber-400/90' : 'text-amber-600';
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <motion.span
        aria-hidden="true"
        className="h-px w-8 origin-left bg-amber-500"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
      />
      <motion.p
        className={`text-[11px] font-extrabold uppercase tracking-[0.25em] ${color}`}
        initial={{ opacity: 0, x: -8 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={VIEWPORT}
        transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }}
      >
        {children}
      </motion.p>
    </div>
  );
}

export interface TextSegment {
  text: string;
  className?: string;
}

interface RevealTextProps {
  /** Plain text, or segments when part of the heading is styled differently */
  text: string | TextSegment[];
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  delay?: number;
  /** Seconds between words */
  stagger?: number;
}

/** Heading whose words rise one by one out of a mask */
export function RevealText({ text, as = 'h2', className = '', delay = 0, stagger = 0.045 }: RevealTextProps) {
  const segments: TextSegment[] = typeof text === 'string' ? [{ text }] : text;
  const Tag = motion[as];
  let index = 0;

  return (
    <Tag
      className={className}
      initial="hidden"
      whileInView="shown"
      viewport={VIEWPORT}
      aria-label={segments.map((s) => s.text).join('')}
    >
      {segments.map((segment, s) =>
        segment.text
          .split(/(\s+)/)
          .filter(Boolean)
          .map((word, w) => {
            if (/^\s+$/.test(word)) return ' ';
            const i = index++;
            return (
              // Padding keeps descenders (g, y, p) inside the mask
              <span
                key={`${s}-${w}`}
                aria-hidden="true"
                className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom"
              >
                <motion.span
                  className={`inline-block ${segment.className || ''}`}
                  variants={{ hidden: { y: '110%' }, shown: { y: '0%' } }}
                  transition={{ duration: 0.85, delay: delay + i * stagger, ease: EASE_OUT_EXPO }}
                >
                  {word}
                </motion.span>
              </span>
            );
          })
      )}
    </Tag>
  );
}

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  /** Distance travelled upward, px */
  y?: number;
  /** Soft focus-in; keep off for large image blocks (blur is costly on big layers) */
  blur?: boolean;
}

/** Content that settles up (and optionally out of a soft blur) as it scrolls in */
export function Reveal({ children, className = '', delay = 0, y = 28, blur = false }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, ...(blur ? { filter: 'blur(8px)' } : {}) }}
      whileInView={{ opacity: 1, y: 0, ...(blur ? { filter: 'blur(0px)' } : {}) }}
      viewport={VIEWPORT}
      transition={{ duration: 0.9, delay, ease: EASE_OUT_EXPO }}
    >
      {children}
    </motion.div>
  );
}

/** Wrapper that drifts gently toward the cursor (for primary calls to action) */
export function Magnetic({ children, className = '', strength = 0.25 }: { children: React.ReactNode; className?: string; strength?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });
  const y = useSpring(useMotionValue(0), { stiffness: 220, damping: 18, mass: 0.4 });

  const onMove = (e: React.PointerEvent) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div ref={ref} className={`inline-flex ${className}`} style={{ x, y }} onPointerMove={onMove} onPointerLeave={reset}>
      {children}
    </motion.div>
  );
}
