'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Check, EyeOff, Heart, RotateCw, Share2, WifiOff } from 'lucide-react';
import { fetchLivePropertyById } from '@/lib/api';
import { formatPrice } from '@/lib/format';
import { getPropertyUrl } from '@/lib/site';
import { getPropertyWhatsAppHref } from '@/lib/contact';
import { toListingDetail, type Listing, type ListingDetail } from '@/lib/listings';
import { useIsSaved } from '@/lib/savedListings';
import { getHandoff, getPreviousPath } from '@/lib/listingTransition';
import { useHeaderOffset } from '@/components/search/SearchToolbar';
import { ListingCard } from '@/components/listing/ListingCard';
import MobileContactBar from '@/components/detail/MobileContactBar';
import { GalleryHero } from '@/components/listing-detail/GalleryHero';
import { Lightbox } from '@/components/listing-detail/Lightbox';
import { EnquiryCard } from '@/components/listing-detail/EnquiryCard';
import { SectionNav } from '@/components/listing-detail/SectionNav';
import {
  FeatureLists,
  KeyFacts,
  ListingHeader,
  LocationSection,
  RevealSection,
  RichDescription,
  SectionTitle,
  SpecSheet,
  VideoTour,
} from '@/components/listing-detail/ListingSections';
import { ListingGone } from '@/components/listing-detail/ListingGone';
import { DetailSkeleton } from './DetailSkeleton';

interface PropertyDetailsClientProps {
  listing: ListingDetail | null;
  similar: Listing[];
  /** Set when the server couldn't load the listing, so the browser retries */
  propertyId?: string;
}

function BackLink() {
  const router = useRouter();
  // Coming from search: step back so the visitor lands on their filters and scroll position
  const fromSearch = getPreviousPath() === '/search';
  return (
    <Link
      href="/search"
      onClick={(e) => {
        if (fromSearch && window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
      className="group inline-flex h-10 items-center gap-2 rounded-full bg-white pl-3 pr-4 text-[13px] font-bold text-navy-950 shadow-sm ring-1 ring-navy-100 transition hover:ring-navy-300"
    >
      <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" aria-hidden="true" />
      {fromSearch ? 'Back to results' : 'All properties'}
    </Link>
  );
}

function SaveToggle({ id, title }: { id: string; title: string }) {
  const [saved, toggle] = useIsSaved(id);
  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${title} from your shortlist` : `Save ${title} to your shortlist`}
      data-saved={saved || undefined}
      className="listing-save inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-bold text-navy-950 shadow-sm ring-1 ring-navy-100 transition hover:ring-navy-300"
    >
      <Heart className={`h-4 w-4 transition-colors ${saved ? 'fill-amber-500 text-amber-500' : ''}`} aria-hidden="true" />
      <span className="hidden sm:inline">{saved ? 'Saved' : 'Save'}</span>
    </button>
  );
}

/** The backend couldn't be reached (as opposed to the listing not existing) */
function ListingUnavailable({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50/50 p-6 pt-24 text-center">
      <span className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-card ring-1 ring-navy-100">
        <WifiOff className="h-7 w-7 text-navy-400" aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-950">We couldn&apos;t load this property</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-800/60">
        Our listings service didn&apos;t respond just now. Please try again in a moment.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <button type="button" onClick={onRetry} className="inline-flex h-12 items-center gap-2 rounded-full bg-amber-500 px-6 text-sm font-extrabold text-navy-950 transition hover:bg-amber-400">
          <RotateCw className="h-4 w-4" aria-hidden="true" />
          Try again
        </button>
        <Link href="/search" className="inline-flex h-12 items-center gap-2 rounded-full bg-navy-950 px-6 text-sm font-bold text-white transition hover:bg-navy-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Browse all properties
        </Link>
      </div>
    </div>
  );
}

const STATUS_NOTES: Record<string, string> = {
  PENDING_APPROVAL: 'is waiting for approval',
  DRAFT: 'is a draft',
  REJECTED: 'was not approved',
};

/** Unpublished listings open by direct link (e.g. an admin reviewing one); say so plainly */
function UnpublishedNotice({ status }: { status: string }) {
  if (status === 'PUBLISHED') return null;
  return (
    <div role="status" className="mb-4 flex items-start gap-3 rounded-2xl bg-amber-50 px-4 py-3 text-[13px] font-medium text-amber-900 ring-1 ring-amber-200">
      <EyeOff className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden="true" />
      <p>
        <span className="font-bold">Not live on the site.</span> This listing {STATUS_NOTES[status] || 'is not published'}, so it
        doesn&apos;t appear in search. Only people with this link can open it.
      </p>
    </div>
  );
}

export default function PropertyDetailsClient({ listing: initial, similar, propertyId }: PropertyDetailsClientProps) {
  const [listing, setListing] = useState<ListingDetail | null>(initial);
  // The server fetch can time out while the backend cold-starts; retry from the browser
  const [isRecovering, setIsRecovering] = useState(!initial && !!propertyId);
  const [loadFailed, setLoadFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [lightboxAt, setLightboxAt] = useState<number | null>(null);
  const [toast, setToast] = useState(false);
  const headerOffset = useHeaderOffset();
  // The cover photo a search card handed over (client navigations only; null on first load)
  const [handoff] = useState(() => {
    const id = initial?.id || propertyId;
    return id ? getHandoff(id) : null;
  });
  const coverPreview = handoff?.preview || null;

  useEffect(() => {
    if (initial || !propertyId) return;
    let alive = true;
    setIsRecovering(true);
    setLoadFailed(false);
    fetchLivePropertyById(propertyId)
      .then((p) => {
        if (alive && p) setListing(toListingDetail(p));
      })
      // Unreachable, not missing: offer a retry rather than "this property has moved on"
      .catch(() => {
        if (alive) setLoadFailed(true);
      })
      .finally(() => {
        if (alive) setIsRecovering(false);
      });
    return () => {
      alive = false;
    };
  }, [initial, propertyId, attempt]);

  const sections = useMemo(() => {
    if (!listing) return [];
    const list = [
      { id: 'overview', label: 'Overview' },
      { id: 'details', label: 'Details' },
    ];
    if (listing.amenities.length || listing.nearby.length) list.push({ id: 'features', label: 'Features' });
    if (listing.tour && listing.images.length > 0) list.push({ id: 'tour', label: 'Video tour' });
    list.push({ id: 'location', label: 'Location' });
    if (similar.length) list.push({ id: 'similar', label: 'Similar' });
    return list;
  }, [listing, similar.length]);

  if (!listing && isRecovering) return <DetailSkeleton handoff={handoff} />;
  if (!listing && loadFailed) return <ListingUnavailable onRetry={() => setAttempt((n) => n + 1)} />;
  if (!listing) return <ListingGone />;

  const shortPrice = formatPrice(listing.price, listing.saleOrRent === 'Rent' ? 'rent' : 'sale');
  const hasPhotos = listing.images.length > 0;

  const share = async () => {
    const url = getPropertyUrl(listing.id);
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, text: `Take a look at this property listed by BOAM Real Estates: ${listing.title}`, url });
      } catch {
        // Dismissed
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setToast(true);
      setTimeout(() => setToast(false), 2500);
    } catch {
      window.prompt('Copy listing link:', url);
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-screen bg-navy-50/50 pb-32 pt-[84px] sm:pt-24 md:pb-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <UnpublishedNotice status={listing.status} />
          <div className="mb-4 flex items-center justify-between gap-3">
            <BackLink />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={share}
                aria-label="Share this property"
                className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-[13px] font-bold text-navy-950 shadow-sm ring-1 ring-navy-100 transition hover:ring-navy-300"
              >
                <Share2 className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Share</span>
              </button>
              <SaveToggle id={listing.id} title={listing.title} />
            </div>
          </div>

          <GalleryHero
            images={listing.images}
            title={listing.title}
            video={hasPhotos ? null : listing.tour}
            onOpen={setLightboxAt}
            coverPreview={coverPreview}
          />

          <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_360px] xl:gap-16">
            <div className="min-w-0 space-y-16">
              <div id="listing-header" className="space-y-8">
                <ListingHeader listing={listing} />
                <KeyFacts listing={listing} />
              </div>

              <RevealSection id="overview">
                <SectionTitle eyebrow="Overview" title="About this property" />
                <RichDescription text={listing.description} />
              </RevealSection>

              <RevealSection id="details">
                <SectionTitle eyebrow="Details" title="The facts at a glance" />
                <SpecSheet listing={listing} />
              </RevealSection>

              {(listing.amenities.length > 0 || listing.nearby.length > 0) && (
                <RevealSection id="features">
                  <SectionTitle eyebrow="Features" title="What comes with it" />
                  <FeatureLists amenities={listing.amenities} nearby={listing.nearby} />
                </RevealSection>
              )}

              {listing.tour && hasPhotos && (
                <RevealSection id="tour">
                  <SectionTitle eyebrow="Video tour" title="Walk through it first" />
                  <VideoTour src={listing.tour} poster={listing.images[0]} />
                </RevealSection>
              )}

              <RevealSection id="location">
                <SectionTitle eyebrow="Location" title={`In ${listing.city || listing.district}`} />
                <LocationSection listing={listing} />
              </RevealSection>

              <div className="lg:hidden">
                <EnquiryCard listing={listing} />
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky" style={{ top: headerOffset + 80 }}>
                <motion.div
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                >
                  <EnquiryCard listing={listing} />
                </motion.div>
              </div>
            </aside>
          </div>

          {similar.length > 0 && (
            <RevealSection id="similar" className="mt-24">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <SectionTitle eyebrow="Keep exploring" title="You might also like" />
                <Link href="/search" className="group mb-6 inline-flex items-center gap-2 text-sm font-bold text-navy-950">
                  View all properties
                  <span className="grid h-8 w-8 place-items-center rounded-full bg-amber-500 transition-transform duration-500 group-hover:translate-x-1">
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </Link>
              </div>
              <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {similar.map((item) => (
                  <li key={item.id}>
                    <ListingCard listing={item} />
                  </li>
                ))}
              </ul>
            </RevealSection>
          )}
        </div>

        <SectionNav
          sections={sections}
          title={listing.title}
          price={shortPrice}
          triggerId="listing-header"
          headerOffset={headerOffset}
          enquireHref={getPropertyWhatsAppHref(listing.id, listing.title)}
        />

        <Lightbox images={listing.images} title={listing.title} openAt={lightboxAt} onClose={() => setLightboxAt(null)} />

        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center md:bottom-8" role="status">
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="flex items-center gap-2 rounded-full bg-navy-950 px-5 py-3 text-[13px] font-bold text-white shadow-2xl"
              >
                <Check className="h-4 w-4 text-amber-400" aria-hidden="true" />
                Link copied
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <MobileContactBar propertyId={listing.id} propertyTitle={listing.title} price={shortPrice} negotiable={listing.negotiable} />
      </div>
    </MotionConfig>
  );
}
