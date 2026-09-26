'use client';

import React, { Suspense, useCallback, useDeferredValue, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { MotionConfig, animate } from 'framer-motion';
import { Heart } from 'lucide-react';
import { fetchLivePropertiesList, getCachedProperties, onPropertiesInvalidated, setCachedProperties } from '@/lib/api';
import { toListing, type Listing } from '@/lib/listings';
import { useSavedIds } from '@/lib/savedListings';
import { SearchHero } from './SearchHero';
import { ActiveFilters, SearchToolbar, useHeaderOffset, type Place } from './SearchToolbar';
import { EmptyResults, GridSkeleton, ResultsGrid } from './ResultsGrid';
import { MapResults } from './MapResults';
import { DEFAULT_STATE, matches, parseState, pluralType, sortListings, toQuery, type SearchState } from './searchState';

interface PropertySearchProps {
  initialProperties?: any[];
}

const PAGE_SIZE = 12;

/** Number that counts to its new value instead of jumping */
function Count({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(value);
  useEffect(() => {
    const from = shown.current;
    if (from === value || !ref.current) return;
    const controls = animate(from, value, {
      duration: 0.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        shown.current = Math.round(v);
        if (ref.current) ref.current.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [value]);
  return (
    <span ref={ref} className="tabular-nums">
      {value}
    </span>
  );
}

/**
 * Reads the URL's filters. Isolated in its own Suspense boundary so the rest of the page is
 * still rendered on the server (useSearchParams would otherwise make the whole page client-only).
 */
function SearchParamsBridge({ onQuery }: { onQuery: (query: string) => void }) {
  const query = useSearchParams().toString();
  // Before paint, so a search arriving from another page never flashes unfiltered results
  useLayoutEffect(() => onQuery(query), [query, onQuery]);
  return null;
}

// Hides the server-rendered results until the URL's filters are applied (only when there are any)
const PENDING_SCRIPT = "if(location.search.length>1)document.documentElement.dataset.searchPending='1'";

export default function PropertySearch({ initialProperties }: PropertySearchProps) {
  const hasInitial = !!initialProperties && initialProperties.length > 0;
  const [listings, setListings] = useState<Listing[]>(() => (hasInitial ? initialProperties!.map(toListing) : []));
  const [isLoading, setIsLoading] = useState(!hasInitial);
  const [state, setState] = useState<SearchState>(DEFAULT_STATE);
  const [visible, setVisible] = useState(PAGE_SIZE);
  const savedIds = useSavedIds();
  const headerOffset = useHeaderOffset();

  // ---- Data: server props first, then browser cache, then the live API ----
  useEffect(() => {
    let alive = true;
    if (hasInitial) {
      setCachedProperties(initialProperties!);
    } else {
      const cached = getCachedProperties();
      if (cached && cached.length > 0) {
        setListings(cached.map(toListing));
        setIsLoading(false);
      }
    }

    const load = async () => {
      try {
        const live = await fetchLivePropertiesList(100);
        if (alive && Array.isArray(live) && live.length > 0) setListings(live.map(toListing));
      } catch {
        // Keep what we have; the page still works from the cache
      } finally {
        if (alive) setIsLoading(false);
      }
    };
    load();
    const unsubscribe = onPropertiesInvalidated(load);
    return () => {
      alive = false;
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- URL sync: filters live in the query string, so searches can be shared ----
  const written = useRef('');
  const applyQuery = useCallback((query: string) => {
    // A navigation from elsewhere (e.g. the homepage search) replaces the filters
    if (query !== written.current) {
      written.current = query;
      setState(parseState(query));
      setVisible(PAGE_SIZE);
    }
    delete document.documentElement.dataset.searchPending;
  }, []);

  useEffect(() => {
    const next = toQuery(state);
    if (next === written.current) return;
    written.current = next;
    window.history.replaceState(window.history.state, '', next ? `/search?${next}` : '/search');
  }, [state]);

  const update = useCallback((patch: Partial<SearchState>) => {
    setState((s) => ({ ...s, ...patch }));
    setVisible(PAGE_SIZE);
  }, []);

  const clearAll = useCallback(() => {
    setState((s) => ({ ...DEFAULT_STATE, view: s.view, sort: s.sort }));
    setVisible(PAGE_SIZE);
  }, []);

  // ---- Results (typing stays responsive; the grid catches up a frame later) ----
  const deferredState = useDeferredValue(state);
  const savedSet = useMemo(() => new Set(savedIds), [savedIds]);

  const results = useMemo(
    () => sortListings(listings.filter((l) => matches(l, deferredState, savedSet)), deferredState.sort),
    [listings, deferredState, savedSet]
  );

  const typeCounts = useMemo(() => {
    const pool = listings.filter((l) => matches(l, deferredState, savedSet, 'type'));
    const counts = new Map<string, number>();
    listings.forEach((l) => counts.set(l.propertyType, 0));
    pool.forEach((l) => counts.set(l.propertyType, (counts.get(l.propertyType) || 0) + 1));
    return [
      { type: '', count: pool.length },
      ...Array.from(counts.entries())
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([type, count]) => ({ type, count })),
    ];
  }, [listings, deferredState, savedSet]);

  const places = useMemo<Place[]>(() => {
    const byKey = new Map<string, Place>();
    const add = (label: string, kind: Place['kind']) => {
      const clean = label.trim();
      if (!clean) return;
      const key = clean.toLowerCase();
      const existing = byKey.get(key);
      if (existing) existing.count += 1;
      else byKey.set(key, { label: clean, kind, count: 1 });
    };
    listings.forEach((l) => {
      add(l.district, 'District');
      // "Polgolla, Katugastota" → offer "Polgolla" as the area
      const area = l.city.split(',')[0];
      if (area.trim().toLowerCase() !== l.district.trim().toLowerCase()) add(area, 'Area');
    });
    return Array.from(byKey.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [listings]);

  const stats = useMemo(() => {
    const priced = listings.filter((l) => l.price > 0).map((l) => l.price);
    return {
      districts: new Set(listings.map((l) => l.district.trim().toLowerCase()).filter(Boolean)).size,
      fromPrice: priced.length ? Math.min(...priced) : null,
    };
  }, [listings]);

  const hasRentals = listings.some((l) => l.saleOrRent === 'Rent');
  const filtersActive = toQuery({ ...deferredState, sort: 'newest', view: 'grid' }) !== '' || deferredState.saved;

  const summary = (() => {
    const s = deferredState;
    const one = results.length === 1;
    const what = s.type ? (one ? s.type : pluralType(s.type)).toLowerCase() : one ? 'property' : 'properties';
    const where = s.location.trim() ? ` in ${s.location.trim()}` : ' across Sri Lanka';
    return { what, where };
  })();

  return (
    <MotionConfig reducedMotion="user">
      <main className="min-h-screen bg-navy-50/50 pb-24">
        <script dangerouslySetInnerHTML={{ __html: PENDING_SCRIPT }} />
        <Suspense fallback={null}>
          <SearchParamsBridge onQuery={applyQuery} />
        </Suspense>
        <SearchHero total={listings.length} districts={stats.districts} fromPrice={stats.fromPrice} loading={isLoading} />

        <div className="relative z-20 mx-auto -mt-10 max-w-7xl px-4 sm:px-6 lg:px-8">
          <SearchToolbar
            state={state}
            update={update}
            typeCounts={typeCounts}
            places={places}
            hasRentals={hasRentals}
            resultCount={results.length}
          />

          <ActiveFilters state={state} update={update} onClearAll={clearAll} />

          <div data-search-results>
            <div className="mb-6 mt-8 flex flex-wrap items-end justify-between gap-3">
              <div aria-live="polite">
                <p className="text-2xl font-extrabold tracking-tight text-navy-950 sm:text-[28px]">
                  {isLoading ? (
                    'Finding properties…'
                  ) : (
                    <>
                      <Count value={results.length} /> {summary.what}
                    </>
                  )}
                </p>
                {!isLoading && <p className="mt-0.5 text-sm font-medium text-navy-800/55">{summary.where}</p>}
              </div>

              <button
                type="button"
                onClick={() => update({ saved: !state.saved })}
                aria-pressed={state.saved}
                className={`inline-flex h-10 items-center gap-2 rounded-full px-4 text-[13px] font-bold transition ${
                  state.saved ? 'bg-amber-500 text-navy-950 shadow-md' : 'bg-white text-navy-900 ring-1 ring-navy-100 hover:ring-navy-300'
                }`}
              >
                <Heart className={`h-4 w-4 ${state.saved ? 'fill-navy-950' : savedIds.length ? 'fill-amber-500 text-amber-500' : ''}`} aria-hidden="true" />
                Shortlist
                <span
                  className={`grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] tabular-nums ${
                    state.saved ? 'bg-navy-950 text-amber-400' : 'bg-navy-50 text-navy-800'
                  }`}
                >
                  {savedIds.length}
                </span>
              </button>
            </div>

            {isLoading && listings.length === 0 ? (
              <GridSkeleton />
            ) : results.length === 0 ? (
              <EmptyResults savedOnly={deferredState.saved && savedIds.length === 0} onClear={clearAll} />
            ) : deferredState.view === 'map' ? (
              <MapResults listings={results} stickyTop={headerOffset + 108} />
            ) : (
              <ResultsGrid
                listings={results}
                visible={visible}
                onShowMore={() => setVisible((v) => v + PAGE_SIZE)}
                feature={!filtersActive && deferredState.sort === 'newest'}
              />
            )}
          </div>
        </div>
      </main>
    </MotionConfig>
  );
}
