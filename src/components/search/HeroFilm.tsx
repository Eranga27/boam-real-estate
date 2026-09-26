'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';

const FILM = {
  wide: { video: '/videos/search-hero-wide.mp4', poster: '/images/search-hero-wide.jpg' },
  tall: { video: '/videos/search-hero-tall.mp4', poster: '/images/search-hero-tall.jpg' },
};

type Connection = { saveData?: boolean; effectiveType?: string };

/**
 * Aerial film behind the search header. A soft, blurred still of its first frame paints with
 * the page; the film itself is fetched only once the page is idle (never competing with the
 * listings), then fades in over the still like a focus pull. It pauses whenever the header is
 * off screen, and is skipped entirely for reduced motion or data-saver connections.
 */
export function HeroFilm() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [paused, setPaused] = useState(false);
  const pausedRef = useRef(false);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const connection = (navigator as Navigator & { connection?: Connection }).connection;
    const constrained = !!connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');
    if (reduceMotion || constrained) return;

    const variant = window.matchMedia('(min-width: 768px)').matches ? FILM.wide : FILM.tall;
    const load = () => setSrc(variant.video);
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(load, { timeout: 2500 });
      return () => w.cancelIdleCallback?.(id);
    }
    const id = window.setTimeout(load, 1200);
    return () => window.clearTimeout(id);
  }, []);

  // Only decode frames while the header is actually visible
  useEffect(() => {
    const wrap = wrapRef.current;
    const video = videoRef.current;
    if (!wrap || !video) return;
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !pausedRef.current) video.play().catch(() => {});
      else video.pause();
    });
    io.observe(wrap);
    return () => io.disconnect();
  }, [src]);

  const togglePause = () => {
    const video = videoRef.current;
    if (!video) return;
    pausedRef.current = !pausedRef.current;
    setPaused(pausedRef.current);
    if (pausedRef.current) video.pause();
    else video.play().catch(() => {});
  };

  return (
    <>
      <div ref={wrapRef} aria-hidden="true" className="search-film absolute inset-0 -z-20 overflow-hidden" data-playing={playing || undefined}>
        <div className="search-film__push absolute inset-0">
          <picture>
            <source media="(min-width: 768px)" srcSet={FILM.wide.poster} />
            <img src={FILM.tall.poster} alt="" fetchPriority="high" decoding="async" className="search-film__still absolute inset-0 h-full w-full object-cover" />
          </picture>
          {src && (
            <video
              ref={videoRef}
              src={src}
              muted
              loop
              playsInline
              autoPlay
              preload="auto"
              disablePictureInPicture
              onPlaying={() => setPlaying(true)}
              className="search-film__video absolute inset-0 h-full w-full object-cover"
            />
          )}
        </div>
        {/* Letterbox bars that part as the header opens */}
        <span className="search-film__bar search-film__bar--top" />
        <span className="search-film__bar search-film__bar--bottom" />
      </div>

      {/* Moving backgrounds need a way to stop them (WCAG 2.2.2) */}
      {src && (
        <div className="pointer-events-none absolute inset-x-0 top-[5.5rem] z-10 sm:bottom-20 sm:top-auto">
          <div className="mx-auto flex max-w-7xl justify-end px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={togglePause}
              aria-label={paused ? 'Play background video' : 'Pause background video'}
              className="pointer-events-auto grid h-9 w-9 place-items-center rounded-full text-white/70 ring-1 ring-white/25 transition hover:bg-white/10 hover:text-white"
            >
              {paused ? <Play className="h-3.5 w-3.5 fill-current" aria-hidden="true" /> : <Pause className="h-3.5 w-3.5 fill-current" aria-hidden="true" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
