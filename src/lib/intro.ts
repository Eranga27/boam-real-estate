'use client';

import { useEffect, useState } from 'react';

/**
 * Coordination between the homepage intro and the hero's entrance.
 *
 * The hero must not play its entrance while it is hidden behind the intro, so it
 * waits for a reveal signal. Mount order between the two components isn't
 * guaranteed, so subscribing after the reveal has already fired still invokes
 * the callback immediately rather than waiting forever.
 */

export { INTRO_SESSION_KEY } from './introScript';

let revealed = false;
let playedThisLoad = false;
let revealedAt = 0;
const waiters = new Set<() => void>();

/** Called by the intro when the page underneath starts to show. */
export function markRevealed(introPlayed: boolean) {
  if (revealed) return;
  revealed = true;
  playedThisLoad = introPlayed;
  revealedAt = Date.now();
  for (const fn of waiters) fn();
  waiters.clear();
}

export function onReveal(cb: () => void): () => void {
  if (revealed) {
    cb();
    return () => {};
  }
  waiters.add(cb);
  return () => {
    waiters.delete(cb);
  };
}

/**
 * Extra delay (seconds) for hero entrance animations. When the intro just played,
 * the reveal fires as its house-shaped window starts expanding, so the headline
 * waits until that window has swept past it. Later visits to the homepage get no delay.
 */
export function getEntranceDelay(): number {
  return playedThisLoad && Date.now() - revealedAt < 2000 ? 0.55 : 0;
}

/** False until the intro reveals the page (immediately true if it was skipped). */
export function useIntroRevealed(): boolean {
  const [isRevealed, setIsRevealed] = useState(false);
  useEffect(() => onReveal(() => setIsRevealed(true)), []);
  return isRevealed;
}

/**
 * Resolves once the hero's first photo has loaded, so the intro never opens onto
 * a blank hero. Capped so a slow connection can't trap the visitor in the intro.
 */
export function waitForHeroImage(timeoutMs = 5000): Promise<void> {
  return new Promise((resolve) => {
    const img = document.querySelector<HTMLImageElement>('img[data-hero-image]');
    if (!img || (img.complete && img.naturalWidth > 0)) {
      resolve();
      return;
    }

    const done = () => {
      img.removeEventListener('load', done);
      img.removeEventListener('error', done);
      clearTimeout(timer);
      resolve();
    };

    const timer = setTimeout(done, timeoutMs);
    img.addEventListener('load', done);
    img.addEventListener('error', done);
  });
}
