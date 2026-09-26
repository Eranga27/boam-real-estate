'use client';

import { useCallback, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';

/**
 * Card → listing page transition. Clicking a card's photo morphs it into the listing page's
 * hero photo with the browser's View Transitions API (where supported; elsewhere it's a
 * normal navigation). The photo is also handed to the listing's loading screen, so the page
 * shows it instantly even while the listing itself is still loading.
 */

interface Handoff {
  id: string;
  src: string;
  title: string;
  /** The exact file the card displayed, already decoded, so the page can paint it instantly */
  preview: string;
}

let handoff: Handoff | null = null;
let currentPath: string | null = null;
let previousPath: string | null = null;

/** Path of the page visited before this one in this tab (client-side navigations only) */
export function getPreviousPath(): string | null {
  return previousPath;
}

/** The photo a card passed on for listing `id`, if the visitor just came from one */
export function getHandoff(id: string): Handoff | null {
  return handoff && handoff.id === id ? handoff : null;
}

const HERO_SELECTOR = '.vt-hero';
/** Longest the old page may stay frozen while the listing page mounts */
const MAX_WAIT_MS = 2500;

/**
 * Resolves once the listing page's hero photo is in the document (not the old page's, and
 * not a generic loading screen), so the browser captures a new state the photo can land on.
 * MutationObserver rather than rAF: rendering is paused while a transition waits.
 */
function waitForHero(): Promise<void> {
  return new Promise((resolve) => {
    const ready = () =>
      Array.from(document.querySelectorAll<HTMLElement>(HERO_SELECTOR)).some(
        (el) => el.dataset.vtOld === undefined && el.getClientRects().length > 0
      );
    const finish = () => {
      observer.disconnect();
      window.clearTimeout(timer);
      resolve();
    };
    const observer = new MutationObserver(() => ready() && finish());
    observer.observe(document.body, { childList: true, subtree: true });
    const timer = window.setTimeout(finish, MAX_WAIT_MS);
  });
}

/**
 * Click handler for links to a listing page. `photo` is the card's image element.
 * Modified clicks (new tab etc.) are left to the browser.
 */
export function useListingLink() {
  const router = useRouter();

  return useCallback(
    (
      e: React.MouseEvent<HTMLAnchorElement>,
      listing: { id: string; title: string; image: string | null },
      photo: HTMLElement | null
    ) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      const shown = photo?.querySelector('img')?.currentSrc;
      handoff = listing.image ? { id: listing.id, src: listing.image, title: listing.title, preview: shown || listing.image } : null;

      const doc = document as Document & { startViewTransition?: (cb: () => Promise<void>) => { finished: Promise<void> } };
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (!doc.startViewTransition || reduceMotion || !photo) return;

      e.preventDefault();
      const href = e.currentTarget.getAttribute('href') || `/properties/${listing.id}`;

      // Exactly one element may carry the shared name when the old page is captured
      document.querySelectorAll<HTMLElement>(HERO_SELECTOR).forEach((el) => {
        el.style.viewTransitionName = 'none';
        el.dataset.vtOld = '';
      });
      photo.style.viewTransitionName = 'listing-hero';
      document.documentElement.classList.add('vt-listing');

      const transition = doc.startViewTransition(() => {
        const mounted = waitForHero();
        router.push(href);
        return mounted;
      });

      transition.finished.finally(() => {
        photo.style.viewTransitionName = '';
        document.documentElement.classList.remove('vt-listing');
        document.querySelectorAll<HTMLElement>(HERO_SELECTOR).forEach((el) => {
          el.style.viewTransitionName = '';
          delete el.dataset.vtOld;
        });
      });
    },
    [router]
  );
}

/** Mounted once in the root layout: remembers the previous page for "Back to results" */
export function RouteTransitionListener() {
  const pathname = usePathname();
  useEffect(() => {
    if (pathname !== currentPath) {
      previousPath = currentPath;
      currentPath = pathname;
    }
  }, [pathname]);
  return null;
}
