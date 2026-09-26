'use client';

import { useCallback, useSyncExternalStore } from 'react';

/**
 * A visitor's shortlist of listings, kept in this browser only. Cards subscribe to their
 * own id, so saving one listing re-renders just that card and the shortlist counter.
 */

const STORAGE_KEY = 'boam:saved-listings';
const listeners = new Set<() => void>();
const EMPTY: string[] = [];
let saved: string[] | null = null;

function read(): string[] {
  if (saved) return saved;
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    saved = Array.isArray(parsed) ? parsed.filter((id) => typeof id === 'string') : [];
  } catch {
    saved = [];
  }
  return saved;
}

function emit() {
  listeners.forEach((listener) => listener());
}

// Keeps the shortlist in step with other open tabs
function onStorage(e: StorageEvent) {
  if (e.key === STORAGE_KEY) {
    saved = null;
    emit();
  }
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (listeners.size === 1) window.addEventListener('storage', onStorage);
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) window.removeEventListener('storage', onStorage);
  };
}

export function toggleSaved(id: string) {
  const current = read();
  saved = current.includes(id) ? current.filter((x) => x !== id) : [id, ...current];
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
  } catch {
    // Private mode or full storage: the shortlist still works for this visit
  }
  emit();
}

/** All saved ids (empty on the server and during hydration) */
export function useSavedIds(): string[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function useIsSaved(id: string): [boolean, () => void] {
  const isSaved = useSyncExternalStore(
    subscribe,
    () => read().includes(id),
    () => false
  );
  const toggle = useCallback(() => toggleSaved(id), [id]);
  return [isSaved, toggle];
}
