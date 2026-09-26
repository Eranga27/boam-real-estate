'use client';

import React, { memo, useCallback, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Bath, BedDouble, Heart, ImageOff, LandPlot, MapPin, Ruler } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { formatLand, formatPlace, type Listing } from '@/lib/listings';
import { useIsSaved } from '@/lib/savedListings';
import { useListingLink } from '@/lib/listingTransition';
import type { ImageWidth } from '@/lib/listingImages';
import { ListingImage } from './ListingImage';

interface ListingCardProps {
  listing: Listing;
  /** grid: standard tile · feature: wide lead tile · row: photo beside details (map view) */
  variant?: 'grid' | 'feature' | 'row';
  /** Load the photo right away (cards in the first row) */
  eager?: boolean;
  /** Reports the hovered listing, e.g. to highlight its map pin */
  onHover?: (id: string | null) => void;
  /** Visually marked, e.g. when its map pin is selected */
  active?: boolean;
}

function SaveButton({ id, title }: { id: string; title: string }) {
  const [saved, toggle] = useIsSaved(id);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from your shortlist` : `Save ${title} to your shortlist`}
      className="listing-save relative z-[2] grid h-9 w-9 place-items-center rounded-full bg-white/95 text-navy-900 shadow-md ring-1 ring-black/5 transition-transform duration-300 hover:scale-110 active:scale-95"
      data-saved={saved || undefined}
    >
      <Heart
        className={`h-[17px] w-[17px] transition-colors duration-300 ${saved ? 'fill-amber-500 text-amber-500' : 'text-navy-900'}`}
        aria-hidden="true"
      />
    </button>
  );
}

// Photo sizes per card layout, so phones and 3-column desktops each fetch what they show
const PHOTO_SIZES: Record<NonNullable<ListingCardProps['variant']>, { widths: ImageWidth[]; sizes: string }> = {
  grid: { widths: [384, 640, 828], sizes: '(min-width: 1280px) 390px, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 100vw' },
  feature: { widths: [640, 828, 1080], sizes: '(min-width: 1280px) 440px, (min-width: 1024px) 36vw, (min-width: 640px) 48vw, 100vw' },
  row: { widths: [384, 640], sizes: '220px' },
};

/** Photo that fades in once decoded, so cards never flash half-drawn images */
function ListingPhoto({ listing, eager, variant }: { listing: Listing; eager: boolean; variant: NonNullable<ListingCardProps['variant']> }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);

  if (listing.image && !failed) {
    return (
      <ListingImage
        src={listing.image}
        widths={PHOTO_SIZES[variant].widths}
        sizes={PHOTO_SIZES[variant].sizes}
        eager={eager}
        onFail={() => setFailed(true)}
        className="listing-photo h-full w-full object-cover"
      />
    );
  }

  if (listing.video && !failed) {
    return (
      <video
        ref={videoRef}
        src={listing.video}
        muted
        loop
        playsInline
        preload="metadata"
        onPointerEnter={() => videoRef.current?.play().catch(() => {})}
        onPointerLeave={() => videoRef.current?.pause()}
        onError={() => setFailed(true)}
        className="listing-photo h-full w-full object-cover"
        data-loaded="true"
      />
    );
  }

  return (
    <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 p-4 text-center">
      <span className="mb-2 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5">
        <ImageOff className="h-5 w-5 text-amber-400/80" aria-hidden="true" />
      </span>
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/70">Photos on request</span>
      <span className="mt-0.5 text-[10px] text-white/40">Ask our broker for the latest images</span>
    </div>
  );
}

function Specs({ listing, compact }: { listing: Listing; compact?: boolean }) {
  const items: { icon: typeof BedDouble; label: string }[] = [];
  if (listing.beds > 0) items.push({ icon: BedDouble, label: `${listing.beds} bed${listing.beds === 1 ? '' : 's'}` });
  if (listing.baths > 0) items.push({ icon: Bath, label: `${listing.baths} bath${listing.baths === 1 ? '' : 's'}` });
  if (listing.houseSize > 0) items.push({ icon: Ruler, label: `${listing.houseSize.toLocaleString('en-LK')} sq ft` });
  if (listing.landSize > 0) items.push({ icon: LandPlot, label: formatLand(listing.landSize, listing.landUnit) });

  if (items.length === 0) return null;
  return (
    <ul className={`flex flex-wrap items-center gap-x-3.5 gap-y-1.5 ${compact ? 'text-[12px]' : 'text-[12.5px]'} font-semibold text-navy-800`}>
      {items.slice(0, compact ? 3 : 4).map(({ icon: Icon, label }) => (
        <li key={label} className="flex items-center gap-1.5 whitespace-nowrap">
          <Icon className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          {label}
        </li>
      ))}
    </ul>
  );
}

function ListingCardBase({ listing, variant = 'grid', eager = false, onHover, active = false }: ListingCardProps) {
  const router = useRouter();
  const photoRef = useRef<HTMLDivElement>(null);
  const openListing = useListingLink();
  const href = `/properties/${listing.id}`;
  const isRow = variant === 'row';
  const isFeature = variant === 'feature';
  const price = formatPrice(listing.price, listing.saleOrRent === 'Rent' ? 'rent' : 'sale');

  // Prefetch on intent rather than for every card on screen
  const prefetched = useRef(false);
  const prefetch = useCallback(() => {
    if (prefetched.current) return;
    prefetched.current = true;
    router.prefetch(href);
  }, [router, href]);

  return (
    <article
      onPointerEnter={() => {
        prefetch();
        onHover?.(listing.id);
      }}
      onPointerLeave={() => onHover?.(null)}
      onFocus={prefetch}
      onTouchStart={prefetch}
      data-active={active || undefined}
      className={`listing-card group relative flex h-full rounded-[26px] bg-white p-2 ring-1 ring-navy-100/90 shadow-card ${
        isRow ? 'flex-row gap-3' : isFeature ? 'flex-col lg:flex-row lg:gap-1' : 'flex-col'
      }`}
    >
      {/* Photo */}
      <div
        className={`relative shrink-0 overflow-hidden rounded-[20px] bg-navy-900 ${
          isRow
            ? 'aspect-[4/3] w-[42%] max-w-[200px] sm:max-w-[220px]'
            : isFeature
            ? 'aspect-[4/3] lg:aspect-auto lg:min-h-[300px] lg:flex-1'
            : 'aspect-[4/3]'
        }`}
      >
        <div ref={photoRef} className="absolute inset-0 overflow-hidden rounded-[20px]">
          <ListingPhoto listing={listing} eager={eager} variant={variant} />
        </div>

        {/* Soft shade so chips stay legible on bright photos */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-navy-950/35 to-transparent" />

        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-wrap items-center gap-1.5">
          {listing.isNew && (
            <span className="rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-navy-950">
              New
            </span>
          )}
          {!isRow && (
            <span className="rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-navy-900">
              {listing.saleOrRent === 'Rent' ? `${listing.propertyType} · Rent` : listing.propertyType}
            </span>
          )}
        </div>

        <div className="absolute right-2.5 top-2.5">
          <SaveButton id={listing.id} title={listing.title} />
        </div>

        {/* Hover call to action (pointer devices) */}
        {!isRow && (
          <div className="listing-cta pointer-events-none absolute inset-x-2.5 bottom-2.5 hidden items-center justify-between rounded-full bg-white/95 py-1.5 pl-4 pr-1.5 text-[12px] font-bold text-navy-950 shadow-lg md:flex">
            View property
            <span className="grid h-7 w-7 place-items-center rounded-full bg-amber-500">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div
        className={`flex min-w-0 flex-1 flex-col ${
          isRow ? 'justify-between py-1.5 pr-2' : isFeature ? 'px-3 pb-3 pt-4 lg:max-w-[46%] lg:justify-between lg:px-5 lg:py-5' : 'px-3 pb-3 pt-4'
        }`}
      >
        <div className="min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <p className={`font-extrabold tracking-tight text-navy-950 ${isRow ? 'text-[17px]' : isFeature ? 'text-[22px] lg:text-[30px]' : 'text-[21px]'}`}>
              {price}
            </p>
            {listing.negotiable && (
              <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.14em] text-sea-600">Negotiable</span>
            )}
          </div>

          <h3 className={`mt-1 font-semibold leading-snug text-navy-950 ${isFeature ? 'text-[16px] lg:text-[21px] lg:leading-tight' : 'text-[15px]'} ${isRow ? 'line-clamp-2' : 'line-clamp-1'} ${isFeature ? 'lg:line-clamp-2' : ''}`}>
            <Link
              href={href}
              prefetch={false}
              onClick={(e) => openListing(e, listing, photoRef.current)}
              className="outline-none after:absolute after:inset-0 after:z-[1] after:rounded-[26px] focus-visible:after:ring-2 focus-visible:after:ring-amber-500"
            >
              {listing.title}
            </Link>
          </h3>

          <p className="mt-1 flex items-center gap-1.5 text-[13px] text-navy-800/65">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
            <span className="truncate">{formatPlace(listing.city, listing.district)}</span>
          </p>

          {isFeature && listing.excerpt && (
            <p className="mt-4 hidden text-[14px] leading-relaxed text-navy-800/65 lg:line-clamp-4">{listing.excerpt}</p>
          )}
          {isFeature && listing.pricePerPerch && (
            <p className="mt-3 hidden text-[13px] font-semibold text-amber-700 lg:block">{listing.pricePerPerch}</p>
          )}
        </div>

        <div className={isRow ? 'mt-2' : 'mt-3.5 border-t border-navy-100/80 pt-3'}>
          <Specs listing={listing} compact={isRow} />
          {isFeature && (
            <span className="mt-5 hidden items-center gap-2 text-[13px] font-bold text-navy-950 lg:inline-flex">
              Explore this property
              <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-500 transition-transform duration-500 group-hover:translate-x-1">
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </span>
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export const ListingCard = memo(ListingCardBase);
