'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Expand, Images, ImageOff } from 'lucide-react';
import { ListingImage } from '@/components/listing/ListingImage';

interface GalleryHeroProps {
  images: string[];
  title: string;
  /** Shown when the listing has no photos */
  video?: string | null;
  onOpen?: (index: number) => void;
  /** Loading state: the known cover plus this many shimmering tiles */
  placeholders?: number;
  /** Already-decoded copy of the cover (from the card that was clicked), painted under it */
  coverPreview?: string | null;
}

// Tile placement for 1–5 photos in a 4 × 2 mosaic (the cover always leads)
const LAYOUTS: Record<number, string[]> = {
  1: ['col-span-4 row-span-2'],
  2: ['col-span-3 row-span-2', 'col-span-1 row-span-2'],
  3: ['col-span-2 row-span-2', 'col-span-2', 'col-span-2'],
  4: ['col-span-2 row-span-2', 'col-span-2', 'col-span-1', 'col-span-1'],
  5: ['col-span-2 row-span-2', 'col-span-1', 'col-span-1', 'col-span-1', 'col-span-1'],
};

function NoPhotos() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-6 text-center">
      <span className="mb-3 grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-white/5">
        <ImageOff className="h-6 w-6 text-amber-400" aria-hidden="true" />
      </span>
      <span className="text-sm font-bold uppercase tracking-[0.18em] text-white/80">Photos on request</span>
      <span className="mt-1 text-xs text-white/45">Ask our broker for the latest images and a viewing</span>
    </div>
  );
}

/** Mosaic of the first five photos on wide screens; a swipeable strip on phones */
export function GalleryHero({ images, title, video, onOpen, placeholders = 0, coverPreview = null }: GalleryHeroProps) {
  const handedOff = !!coverPreview;
  const total = images.length + placeholders;
  const count = Math.min(Math.max(total, 1), 5);
  const layout = LAYOUTS[count];
  const [slide, setSlide] = useState(0);
  const stripRef = useRef<HTMLDivElement>(null);

  // Phone strip counter follows whichever photo is centred
  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setSlide(Number((entry.target as HTMLElement).dataset.index));
        });
      },
      { root: strip, threshold: 0.6 }
    );
    strip.querySelectorAll('[data-index]').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [images.length]);

  if (images.length === 0 && placeholders === 0) {
    return (
      <div className="-mx-4 aspect-[4/3] overflow-hidden bg-navy-950 sm:mx-0 sm:rounded-[28px] md:aspect-auto md:h-[clamp(360px,58vh,580px)]">
        {video ? <video src={video} controls preload="metadata" playsInline className="h-full w-full object-contain" /> : <NoPhotos />}
      </div>
    );
  }

  const tile = (index: number, className: string) => {
    const src = images[index];
    const isCover = index === 0;
    return (
      <button
        key={index}
        type="button"
        onClick={() => src && onOpen?.(index)}
        disabled={!src}
        aria-label={src ? `Open photo ${index + 1} of ${images.length}` : undefined}
        className={`gallery-tile relative overflow-hidden bg-navy-900 ${className}`}
        style={{ ['--tile-delay' as string]: `${index * 70}ms` }}
      >
        {src ? (
          <div className={`absolute inset-0 overflow-hidden ${isCover ? 'vt-hero' : ''}`}>
            {isCover && coverPreview && <img src={coverPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />}
            <ListingImage
              src={src}
              widths={isCover ? [828, 1200, 1920] : [640, 828]}
              sizes={isCover ? '(min-width: 1280px) 620px, (min-width: 768px) 50vw, 100vw' : '(min-width: 1280px) 300px, 25vw'}
              eager={isCover}
              alt={isCover ? title : ''}
              className="gallery-photo h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="skeleton-shimmer absolute inset-0" />
        )}
      </button>
    );
  };

  return (
    <div data-handoff={handedOff || undefined} className="gallery-hero">
      {/* Wide screens: mosaic */}
      <div className="gallery-mosaic relative hidden h-[clamp(380px,60vh,600px)] grid-cols-4 grid-rows-2 gap-2 overflow-hidden rounded-[28px] md:grid">
        {layout.map((className, i) => tile(i, className))}
        {images.length > 1 && (
          <button
            type="button"
            onClick={() => onOpen?.(0)}
            className="absolute bottom-4 right-4 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2.5 text-[13px] font-bold text-navy-950 shadow-lg ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-xl"
          >
            <Images className="h-4 w-4 text-amber-600" aria-hidden="true" />
            View all {images.length} photos
          </button>
        )}
      </div>

      {/* Phones: full-bleed swipe strip */}
      <div className="relative -mx-4 sm:mx-0 md:hidden">
        <div ref={stripRef} className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto sm:rounded-[24px]">
          {(images.length ? images : ['']).map((src, i) => (
            <button
              key={i}
              type="button"
              data-index={i}
              onClick={() => src && onOpen?.(i)}
              aria-label={src ? `Open photo ${i + 1} of ${images.length}` : undefined}
              className="relative aspect-[4/3] w-full shrink-0 snap-center overflow-hidden bg-navy-900"
            >
              {src ? (
                <div className={`absolute inset-0 ${i === 0 ? 'vt-hero' : ''}`}>
                  {i === 0 && coverPreview && <img src={coverPreview} alt="" className="absolute inset-0 h-full w-full object-cover" />}
                  <ListingImage
                    src={src}
                    widths={[640, 828, 1080]}
                    sizes="100vw"
                    eager={i === 0}
                    alt={i === 0 ? title : ''}
                    className="gallery-photo h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="skeleton-shimmer absolute inset-0" />
              )}
            </button>
          ))}
        </div>
        {images.length > 1 && (
          <>
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-navy-950/75 px-3 py-1 text-[11px] font-bold tabular-nums text-white">
              {slide + 1} / {images.length}
            </span>
            <button
              type="button"
              onClick={() => onOpen?.(slide)}
              aria-label="Open full-screen gallery"
              className="absolute bottom-3 left-3 grid h-9 w-9 place-items-center rounded-full bg-white/95 text-navy-950 shadow-md"
            >
              <Expand className="h-4 w-4" aria-hidden="true" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
