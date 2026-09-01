'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function PagePreloader({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  // Target routes: Home (/), Search/Properties (/search), and Property details (/properties/[id])
  const isTargetRoute =
    pathname === '/' ||
    pathname.startsWith('/search') ||
    pathname.startsWith('/properties');

  useEffect(() => {
    if (!isTargetRoute) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setProgress(0);

    let mounted = true;
    const startTime = Date.now();
    const MIN_DURATION = 800; // 0.8 seconds for fast, smooth luxury feel

    // Ramp progress from 0% to 90%
    const interval = setInterval(() => {
      if (!mounted) return;
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        // Smooth logarithmic step
        const increment = Math.max(2, Math.floor((95 - prev) / 4));
        return Math.min(90, prev + increment);
      });
    }, 60);

    const finishLoading = () => {
      const elapsed = Date.now() - startTime;
      const remainingTime = Math.max(0, MIN_DURATION - elapsed);

      setTimeout(() => {
        if (!mounted) return;
        setProgress(100);
        setTimeout(() => {
          if (mounted) setLoading(false);
        }, 320); // Hold at 100% briefly before curtain transition
      }, remainingTime);
    };

    if (document.readyState === 'complete') {
      finishLoading();
    } else {
      window.addEventListener('load', finishLoading);
    }

    return () => {
      mounted = false;
      clearInterval(interval);
      window.removeEventListener('load', finishLoading);
    };
  }, [pathname, isTargetRoute]);

  return (
    <>
      <AnimatePresence mode="wait">
        {loading && isTargetRoute && (
          <motion.div
            key="page-preloader"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{
              opacity: 0,
              scale: 1.03,
              transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
            }}
            className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-navy-950 overflow-hidden select-none"
          >
            {/* Ambient Gold Radial Glow */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
              <div className="w-[85vw] max-w-[450px] aspect-square rounded-full bg-gradient-to-tr from-amber-600/15 via-amber-500/25 to-amber-400/10 blur-[75px] sm:blur-[100px] animate-pulse duration-1000" />
            </div>

            {/* Subtle Luxury Pattern / Grid */}
            <div className="absolute inset-0 bg-[radial-gradient(#d97706_1px,transparent_1px)] [background-size:32px_32px] opacity-[0.07] pointer-events-none" />

            {/* Logo Container */}
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-10 flex flex-col items-center text-center px-4"
            >
              {/* BOAM High-Res Logo */}
              <div className="relative mb-6">
                <img
                  src="/images/boamnormallogo.png"
                  alt="BOAM Real Estates"
                  className="h-16 sm:h-20 lg:h-24 w-auto object-contain brightness-0 invert drop-shadow-[0_4px_25px_rgba(245,158,11,0.35)]"
                />
              </div>

              {/* Brand Typography */}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="flex flex-col items-center"
              >
                <span className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.35em] text-amber-400">
                  BOAM REAL ESTATES
                </span>
                <span className="mt-1 text-[9px] sm:text-[10px] font-semibold uppercase tracking-[0.25em] text-white/50">
                  Exclusive Sri Lanka Property Portfolio
                </span>
              </motion.div>

              {/* Progress Bar Container */}
              <div className="mt-8 w-52 sm:w-64 h-1.5 rounded-full bg-navy-900 border border-navy-800/80 p-0.5 overflow-hidden shadow-inner relative">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-amber-600 via-amber-400 to-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.8)]"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progress}%` }}
                  transition={{ ease: 'easeOut', duration: 0.2 }}
                />
              </div>

              {/* Percentage Indicator */}
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-3 text-[10px] font-extrabold text-amber-500/90 font-mono tracking-wider"
              >
                {progress}%
              </motion.span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Page Content with Entrance Transition */}
      <motion.div
        key={pathname}
        initial={isTargetRoute ? { opacity: 0, y: 15, scale: 0.995 } : false}
        animate={isTargetRoute ? { opacity: 1, y: 0, scale: 1 } : { opacity: 1 }}
        transition={{
          duration: 0.65,
          delay: loading && isTargetRoute ? 0.35 : 0,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </>
  );
}
