'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { ListingImage } from '@/components/listing/ListingImage';
import { EASE_OUT_EXPO } from '@/components/motion/Reveal';

interface LightboxProps {
  images: string[];
  title: string;
  /** Photo to open on, or null when closed */
  openAt: number | null;
  onClose: () => void;
}

/**
 * Full-screen photo viewer. Photos sit in a native scroll-snap strip, so swiping on phones
 * and trackpads feels like the platform; arrows, keys and thumbnails drive the same strip.
 */
export function Lightbox({ images, title, openAt, onClose }: LightboxProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>{openAt !== null && <LightboxBody images={images} title={title} start={openAt} onClose={onClose} />}</AnimatePresence>,
    document.body
  );
}

function LightboxBody({ images, title, start, onClose }: { images: string[]; title: string; start: number; onClose: () => void }) {
  const [index, setIndex] = useState(start);
  const stripRef = useRef<HTMLDivElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  const goTo = useCallback((i: number, smooth = true) => {
    const strip = stripRef.current;
    if (!strip) return;
    const target = Math.max(0, Math.min(images.length - 1, i));
    strip.scrollTo({ left: target * strip.clientWidth, behavior: smooth ? 'smooth' : 'instant' });
  }, [images.length]);

  // Open on the chosen photo, lock the page behind, and hand focus back on close
  useEffect(() => {
    goTo(start, false);
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
      previousFocus?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Counter and thumbnails follow the photo in view
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setIndex(Number((entry.target as HTMLElement).dataset.index));
        });
      },
      { root: strip, threshold: 0.55 }
    );
    strip.querySelectorAll('[data-index]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const thumb = thumbsRef.current?.querySelector<HTMLElement>(`[data-thumb="${index}"]`);
    thumb?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [index]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') goTo(index + 1);
      else if (e.key === 'ArrowLeft') goTo(index - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, goTo, onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`${title}: photo gallery`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-[80] flex flex-col bg-navy-950"
    >
      <div className="flex items-center justify-between gap-4 px-4 pb-2 pt-[calc(1rem+env(safe-area-inset-top,0px))] text-white sm:px-8">
        <div className="min-w-0">
          <p className="truncate text-sm font-bold">{title}</p>
          <p className="text-xs font-semibold tabular-nums text-white/50">
            {index + 1} / {images.length}
          </p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close gallery"
          className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/10 transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-500"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      <motion.div
        initial={{ scale: 0.97, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.97, opacity: 0 }}
        transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
        className="relative min-h-0 flex-1"
      >
        <div ref={stripRef} className="no-scrollbar flex h-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain">
          {images.map((src, i) => (
            <div key={`${src}-${i}`} data-index={i} className="flex h-full w-full shrink-0 snap-center items-center justify-center px-2 sm:px-20">
              <ListingImage
                src={src}
                widths={[1080, 1920]}
                sizes="100vw"
                eager={Math.abs(i - start) <= 1}
                alt={`${title}, photo ${i + 1} of ${images.length}`}
                className="gallery-photo max-h-full max-w-full rounded-xl object-contain"
              />
            </div>
          ))}
        </div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo(index - 1)}
              disabled={index === 0}
              aria-label="Previous photo"
              className="absolute left-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 disabled:opacity-30 sm:grid"
            >
              <ChevronLeft className="h-6 w-6" aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={() => goTo(index + 1)}
              disabled={index === images.length - 1}
              aria-label="Next photo"
              className="absolute right-4 top-1/2 hidden h-12 w-12 -translate-y-1/2 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/25 disabled:opacity-30 sm:grid"
            >
              <ChevronRight className="h-6 w-6" aria-hidden="true" />
            </button>
          </>
        )}
      </motion.div>

      {images.length > 1 && (
        <div ref={thumbsRef} className="no-scrollbar flex gap-2 overflow-x-auto px-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-3 sm:justify-center sm:px-8">
          {images.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              data-thumb={i}
              onClick={() => goTo(i)}
              aria-label={`Show photo ${i + 1}`}
              aria-current={i === index}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded-lg transition duration-300 ${
                i === index ? 'opacity-100 ring-2 ring-amber-500' : 'opacity-45 hover:opacity-90'
              }`}
            >
              <ListingImage src={src} widths={[384]} sizes="80px" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </motion.div>
  );
}
