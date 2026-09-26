'use client';

import React, { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import {
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  ChevronDown,
  ExternalLink,
  LandPlot,
  MapPin,
  Navigation,
  Play,
  Ruler,
} from 'lucide-react';
import { EASE_OUT_EXPO, RevealText } from '@/components/motion/Reveal';
import { formatFullPrice } from '@/lib/format';
import { formatLand, formatPlace, type ListingDetail } from '@/lib/listings';
import { parseDescription, type DescriptionBlock } from '@/lib/description';
import { optimizedImage } from '@/lib/listingImages';

/* ---------------------------------------------------------------- Shared */

export function SectionTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mb-6">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-amber-600">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-navy-950 sm:text-[28px]">{title}</h2>
    </div>
  );
}

/** Settles into place once as it scrolls into view */
export function RevealSection({ id, children, className = '' }: { id?: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: EASE_OUT_EXPO }}
      className={`scroll-mt-40 ${className}`}
    >
      {children}
    </motion.section>
  );
}

/** "**bold**" phrases in admin-written text */
function Inline({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, i) =>
        part.startsWith('**') && part.endsWith('**') ? (
          <strong key={i} className="font-semibold text-navy-950">
            {part.slice(2, -2)}
          </strong>
        ) : (
          <React.Fragment key={i}>{part}</React.Fragment>
        )
      )}
    </>
  );
}

/* ---------------------------------------------------------------- Header */

/** "Hikkaduwa–Baddegama Road, Hikkaduwa, Galle" from address, city and district, without repeats */
function fullAddress(listing: ListingDetail): string {
  const seen = new Set<string>();
  return [listing.address, listing.city, listing.district]
    .flatMap((part) => (part || '').split(','))
    .map((part) => part.trim())
    .filter((part) => {
      const key = part.toLowerCase();
      if (!part || seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .join(', ');
}

export function ListingHeader({ listing }: { listing: ListingDetail }) {
  const chips = [
    listing.propertyType,
    listing.saleOrRent === 'Rent' ? 'For rent' : 'For sale',
    ...(listing.isNew ? ['New listing'] : []),
  ];

  return (
    <header>
      <motion.ul
        initial="hidden"
        animate="shown"
        transition={{ staggerChildren: 0.06 }}
        className="flex flex-wrap items-center gap-2"
      >
        {chips.map((chip, i) => (
          <motion.li
            key={chip}
            variants={{ hidden: { opacity: 0, y: 8 }, shown: { opacity: 1, y: 0 } }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
            className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] ${
              i === 0 ? 'bg-navy-950 text-amber-400' : chip === 'New listing' ? 'bg-amber-500 text-navy-950' : 'bg-white text-navy-800 ring-1 ring-navy-100'
            }`}
          >
            {chip}
          </motion.li>
        ))}
      </motion.ul>

      <RevealText
        as="h1"
        text={listing.title}
        stagger={0.03}
        className="mt-4 text-[2rem] font-extrabold leading-[1.08] tracking-tight text-navy-950 sm:text-5xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.25, ease: EASE_OUT_EXPO }}
      >
        <a href="#location" className="group mt-3 flex items-start gap-2 text-[15px] font-medium text-navy-800/70 transition hover:text-navy-950">
          <MapPin className="mt-[3px] h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
          <span>
            {fullAddress(listing)}
            <span className="ml-2 whitespace-nowrap text-[13px] font-bold text-amber-700 underline-offset-4 group-hover:underline">View on map</span>
          </span>
        </a>

        <div className="mt-6 flex flex-wrap items-end gap-x-4 gap-y-2">
          <p className="text-[2rem] font-extrabold leading-none tracking-tight text-navy-950 sm:text-[2.6rem]">
            {formatFullPrice(listing.price)}
            {listing.saleOrRent === 'Rent' && <span className="ml-1 text-base font-semibold text-navy-800/60">/ month</span>}
          </p>
          <div className="flex flex-wrap items-center gap-2 pb-1">
            {listing.negotiable && (
              <span className="rounded-full bg-sea-50 px-3 py-1 text-[11px] font-extrabold uppercase tracking-[0.14em] text-sea-700 ring-1 ring-sea-200">
                Negotiable
              </span>
            )}
            {listing.pricePerPerch && (
              <span className="rounded-full bg-amber-50 px-3 py-1 text-[12px] font-bold text-amber-800 ring-1 ring-amber-200">{listing.pricePerPerch}</span>
            )}
          </div>
        </div>
      </motion.div>
    </header>
  );
}

/* ---------------------------------------------------------------- Key facts */

function CountUp({ value, format = (v: number) => Math.round(v).toLocaleString('en-LK') }: { value: number; format?: (v: number) => string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' });
  useEffect(() => {
    if (!inView || !ref.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const controls = animate(0, value, {
      duration: 1.4,
      ease: EASE_OUT_EXPO,
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = format(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, value]);
  return <span ref={ref}>{format(value)}</span>;
}

export function KeyFacts({ listing }: { listing: ListingDetail }) {
  const decimals = (v: number) => (Number.isInteger(v) ? 0 : 1);
  const facts: { icon: typeof BedDouble; value: number; unit?: string; label: string; format?: (v: number) => string }[] = [];
  if (listing.beds > 0) facts.push({ icon: BedDouble, value: listing.beds, label: listing.beds === 1 ? 'Bedroom' : 'Bedrooms' });
  if (listing.baths > 0) facts.push({ icon: Bath, value: listing.baths, label: listing.baths === 1 ? 'Bathroom' : 'Bathrooms' });
  if (listing.landSize > 0) {
    const d = decimals(listing.landSize);
    facts.push({
      icon: LandPlot,
      value: listing.landSize,
      unit: listing.landUnit === 'acres' ? 'ac' : 'p',
      label: listing.landUnit === 'acres' ? 'Acres of land' : 'Perches of land',
      format: (v) => v.toLocaleString('en-LK', { minimumFractionDigits: d, maximumFractionDigits: d }),
    });
  }
  if (listing.houseSize > 0) facts.push({ icon: Ruler, value: listing.houseSize, unit: 'sq ft', label: 'Floor area' });
  if (listing.parking > 0) facts.push({ icon: Car, value: listing.parking, label: 'Parking' });
  if (listing.yearBuilt > 0) facts.push({ icon: CalendarDays, value: listing.yearBuilt, label: 'Year built', format: (v) => String(Math.round(v)) });

  if (facts.length === 0) return null;

  return (
    // 1px gaps over a tinted backdrop draw the dividers; flex-grow fills any short last row
    <div className="flex flex-wrap gap-px overflow-hidden rounded-[24px] bg-navy-100 shadow-card ring-1 ring-navy-100">
      {facts.map(({ icon: Icon, value, unit, label, format }, i) => (
        <motion.div
          key={label}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: i * 0.07, ease: EASE_OUT_EXPO }}
          className="min-w-[40%] flex-1 bg-white p-5 sm:min-w-[30%] sm:p-6 lg:min-w-0"
        >
          <Icon className="h-5 w-5 text-amber-500" aria-hidden="true" />
          <p className="mt-3 text-[28px] font-extrabold leading-none tracking-tight text-navy-950 tabular-nums">
            <CountUp value={value} format={format} />
            {unit && <span className="ml-1 text-sm font-bold text-navy-800/50">{unit}</span>}
          </p>
          <p className="mt-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-navy-800/55">{label}</p>
        </motion.div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- Description */

function Block({ block }: { block: DescriptionBlock }) {
  switch (block.kind) {
    case 'heading':
      return <h3 className="pt-4 text-[12px] font-extrabold uppercase tracking-[0.22em] text-amber-700">{block.text}</h3>;
    case 'lead':
      return (
        <p className="text-[17px] font-medium leading-relaxed text-navy-950">
          <Inline text={block.text} />
        </p>
      );
    case 'list':
      return (
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {block.items.map((item, i) => (
            <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-navy-800/85">
              <span aria-hidden="true" className="mt-[9px] h-1.5 w-1.5 shrink-0 rotate-45 bg-amber-500" />
              <span>
                <Inline text={item} />
              </span>
            </li>
          ))}
        </ul>
      );
    default:
      return (
        <p className="text-[15px] leading-[1.8] text-navy-800/80">
          {block.lines.map((line, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              <Inline text={line} />
            </React.Fragment>
          ))}
        </p>
      );
  }
}

const COLLAPSED_HEIGHT = 380;

export function RichDescription({ text }: { text: string }) {
  const blocks = parseDescription(text);
  const innerRef = useRef<HTMLDivElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    const measure = () => setOverflows(el.scrollHeight > COLLAPSED_HEIGHT + 80);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, [text]);

  if (blocks.length === 0) return <p className="text-[15px] text-navy-800/60">Ask our broker for the full property details.</p>;

  const collapsed = overflows && !expanded;

  return (
    <div>
      <motion.div
        initial={false}
        animate={{ height: collapsed ? COLLAPSED_HEIGHT : 'auto' }}
        transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
        className="relative overflow-hidden"
      >
        <div ref={innerRef} className="space-y-4">
          {blocks.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#f8fafd] to-transparent transition-opacity duration-500 ${collapsed ? 'opacity-100' : 'opacity-0'}`}
        />
      </motion.div>
      {overflows && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          aria-expanded={expanded}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-bold text-navy-950 shadow-sm ring-1 ring-navy-200 transition hover:ring-navy-400"
        >
          {expanded ? 'Show less' : 'Read the full description'}
          <ChevronDown className={`h-4 w-4 transition-transform duration-500 ${expanded ? 'rotate-180' : ''}`} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Spec sheet */

function listingRef(id: string): string {
  return /^[0-9a-f]{8}-/i.test(id) ? `BOAM-${id.slice(0, 6).toUpperCase()}` : `BOAM-${id.toUpperCase().slice(0, 18)}`;
}

export function SpecSheet({ listing }: { listing: ListingDetail }) {
  const rows: [string, string][] = [
    ['Property type', listing.propertyType],
    ['Listed for', listing.saleOrRent === 'Rent' ? 'Rent' : 'Sale'],
    ['Asking price', `${formatFullPrice(listing.price)}${listing.saleOrRent === 'Rent' ? ' / month' : ''}`],
  ];
  if (listing.pricePerPerch) rows.push(['Rate', listing.pricePerPerch]);
  rows.push(['Negotiable', listing.negotiable ? 'Yes' : 'No']);
  if (listing.landSize > 0) rows.push(['Land extent', formatLand(listing.landSize, listing.landUnit)]);
  if (listing.houseSize > 0) rows.push(['Floor area', `${listing.houseSize.toLocaleString('en-LK')} sq ft`]);
  if (listing.beds > 0) rows.push(['Bedrooms', String(listing.beds)]);
  if (listing.baths > 0) rows.push(['Bathrooms', String(listing.baths)]);
  if (listing.parking > 0) rows.push(['Parking', `${listing.parking} ${listing.parking === 1 ? 'vehicle' : 'vehicles'}`]);
  if (listing.yearBuilt > 0) rows.push(['Year built', String(listing.yearBuilt)]);
  rows.push(['Area', listing.city || '—']);
  if (listing.district) rows.push(['District', listing.district]);
  rows.push(['Listing reference', listingRef(listing.id)]);

  return (
    <dl className="grid gap-px overflow-hidden rounded-[24px] bg-navy-100 shadow-card ring-1 ring-navy-100 sm:grid-cols-2">
      {rows.map(([label, value], i) => (
        <div
          key={label}
          className={`flex items-baseline justify-between gap-4 bg-white px-5 py-4 ${i === rows.length - 1 && rows.length % 2 === 1 ? 'sm:col-span-2' : ''}`}
        >
          <dt className="text-[13px] font-semibold text-navy-800/55">{label}</dt>
          <dd className="text-right text-[14px] font-bold text-navy-950">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

/* ---------------------------------------------------------------- Features */

export function FeatureLists({ amenities, nearby }: { amenities: string[]; nearby: string[] }) {
  if (amenities.length === 0 && nearby.length === 0) return null;
  const group = (title: string, items: string[], icon: React.ReactNode) =>
    items.length > 0 && (
      <div>
        <h3 className="mb-3 text-[12px] font-extrabold uppercase tracking-[0.22em] text-navy-800/55">{title}</h3>
        <ul className="flex flex-wrap gap-2">
          {items.map((item) => (
            <li key={item} className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-[13px] font-semibold text-navy-900 shadow-sm ring-1 ring-navy-100">
              {icon}
              {item}
            </li>
          ))}
        </ul>
      </div>
    );
  return (
    <div className="space-y-6">
      {group('On the property', amenities, <Check className="h-3.5 w-3.5 text-sea-600" aria-hidden="true" />)}
      {group('Close by', nearby, <MapPin className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />)}
    </div>
  );
}

/* ---------------------------------------------------------------- Video tour */

export function VideoTour({ src, poster }: { src: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden rounded-[24px] bg-navy-950 shadow-card">
      {playing ? (
        <video src={src} controls autoPlay playsInline className="h-full w-full object-contain" />
      ) : (
        <button type="button" onClick={() => setPlaying(true)} className="group absolute inset-0" aria-label="Play the video tour">
          {poster && <img src={optimizedImage(poster, 1200)} alt="" loading="lazy" decoding="async" className="h-full w-full object-cover opacity-70 transition duration-700 group-hover:scale-105 group-hover:opacity-60" />}
          <span className="absolute inset-0 grid place-items-center">
            <span className="grid h-20 w-20 place-items-center rounded-full bg-amber-500 text-navy-950 shadow-2xl transition-transform duration-500 group-hover:scale-110">
              <Play className="ml-1 h-8 w-8 fill-navy-950" aria-hidden="true" />
            </span>
          </span>
          <span className="absolute bottom-5 left-5 rounded-full bg-navy-950/80 px-4 py-2 text-[13px] font-bold text-white">Watch the walkthrough</span>
        </button>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------- Location */

export function LocationSection({ listing }: { listing: ListingDetail }) {
  const frameRef = useRef<HTMLDivElement>(null);
  // Only load Google Maps once the visitor is close to it
  const near = useInView(frameRef, { once: true, margin: '400px 0px' });
  const hasCoords = listing.lat != null && listing.lng != null;
  const query = hasCoords ? `${listing.lat},${listing.lng}` : `${listing.address || ''}, ${listing.city || ''}, Sri Lanka`;
  const embed = `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${hasCoords ? 15 : 13}&ie=UTF8&iwloc=&output=embed`;
  const open = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(query)}`;

  return (
    <div className="overflow-hidden rounded-[24px] bg-white shadow-card ring-1 ring-navy-100">
      <div ref={frameRef} className="relative aspect-[16/10] bg-navy-100 sm:aspect-[16/8]">
        {near ? (
          <iframe
            title={`Map showing ${listing.title}`}
            src={embed}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 h-full w-full border-0"
            allowFullScreen
          />
        ) : (
          <div className="skeleton-shimmer absolute inset-0" />
        )}
      </div>
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-[15px] font-bold text-navy-950">{formatPlace(listing.city, listing.district)}</p>
          <p className="mt-0.5 text-[13px] text-navy-800/55">{hasCoords ? 'Exact location shown' : 'Approximate area shown; exact location on request'}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={directions} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-navy-950 px-4 text-[13px] font-bold text-white transition hover:bg-navy-800">
            <Navigation className="h-4 w-4 text-amber-400" aria-hidden="true" />
            Directions
          </a>
          <a href={open} target="_blank" rel="noopener noreferrer" className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-bold text-navy-950 ring-1 ring-navy-200 transition hover:ring-navy-400">
            <ExternalLink className="h-4 w-4" aria-hidden="true" />
            Google Maps
          </a>
        </div>
      </div>
    </div>
  );
}
