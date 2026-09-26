'use client';

import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown, LayoutGrid, Map as MapIcon, MapPin, Search, SlidersHorizontal, X } from 'lucide-react';
import { EASE_OUT_EXPO } from '@/components/motion/Reveal';
import {
  BED_OPTIONS,
  LAND_OPTIONS,
  PRICE_PRESETS,
  SORT_OPTIONS,
  advancedFilterCount,
  pluralType,
  priceLabel,
  type SearchState,
  type SortKey,
} from './searchState';

export interface Place {
  label: string;
  kind: 'District' | 'Area';
  count: number;
}

interface SearchToolbarProps {
  state: SearchState;
  update: (patch: Partial<SearchState>) => void;
  typeCounts: { type: string; count: number }[];
  places: Place[];
  hasRentals: boolean;
  resultCount: number;
}

const SPRING = { type: 'spring', stiffness: 420, damping: 36 } as const;

/** Height of the fixed site header, so sticky bars can sit just beneath it */
export function useHeaderOffset(): number {
  const [offset, setOffset] = useState(72);
  useLayoutEffect(() => {
    const header = document.querySelector<HTMLElement>('.site-header');
    if (!header) return;
    const measure = () => setOffset(header.offsetHeight);
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(header);
    return () => ro.disconnect();
  }, []);
  return offset;
}

function useIsDesktop(): boolean {
  const [desktop, setDesktop] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const sync = () => setDesktop(mq.matches);
    sync();
    mq.addEventListener('change', sync);
    return () => mq.removeEventListener('change', sync);
  }, []);
  return desktop;
}

/* ---------------------------------------------------------------- Location */

function LocationField({ value, onChange, places }: { value: string; onChange: (v: string) => void; places: Place[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();

  const suggestions = useMemo(() => {
    const q = value.trim().toLowerCase();
    const list = q ? places.filter((p) => p.label.toLowerCase().includes(q) && p.label.toLowerCase() !== q) : places;
    return list.slice(0, 8);
  }, [value, places]);

  useEffect(() => setActive(-1), [value]);

  const pick = (label: string) => {
    onChange(label);
    setOpen(false);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => Math.min(suggestions.length - 1, i + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(-1, i - 1));
    } else if (e.key === 'Enter') {
      if (open && active >= 0 && suggestions[active]) {
        e.preventDefault();
        pick(suggestions[active].label);
      } else {
        setOpen(false);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  const showList = open && suggestions.length > 0;

  return (
    <div className="relative min-w-0 flex-1">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-amber-500" aria-hidden="true" />
      <input
        type="text"
        role="combobox"
        aria-label="Search by city or district"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={onKeyDown}
        placeholder="Search a city or district"
        autoComplete="off"
        className="h-12 w-full rounded-2xl bg-navy-50/80 pl-11 pr-10 text-[15px] font-semibold text-navy-950 outline-none ring-1 ring-transparent transition placeholder:font-medium placeholder:text-navy-800/45 focus:bg-white focus:ring-amber-500/60"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Clear location"
          className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-navy-800/50 transition hover:bg-navy-100 hover:text-navy-950"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}

      <AnimatePresence>
        {showList && (
          <motion.ul
            id={listId}
            role="listbox"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full z-40 mt-2 overflow-hidden rounded-2xl bg-white py-1.5 shadow-float ring-1 ring-navy-100"
          >
            {suggestions.map((place, i) => (
              <li
                key={`${place.kind}-${place.label}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                // Keep focus in the input so the pick lands before blur closes the list
                onMouseDown={(e) => {
                  e.preventDefault();
                  pick(place.label);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-center gap-3 px-4 py-2.5 text-sm transition-colors ${
                  i === active ? 'bg-navy-50' : ''
                }`}
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-amber-500/10">
                  <MapPin className="h-4 w-4 text-amber-600" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-semibold text-navy-950">{place.label}</span>
                  <span className="block text-[11px] font-medium text-navy-800/50">{place.kind}</span>
                </span>
                <span className="text-xs font-bold text-navy-800/50">
                  {place.count} {place.count === 1 ? 'listing' : 'listings'}
                </span>
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------------------------------------------------------------- Type tabs */

function TypeTabs({
  value,
  onChange,
  counts,
  pillId,
}: {
  value: string;
  onChange: (v: string) => void;
  counts: { type: string; count: number }[];
  pillId: string;
}) {
  return (
    <div role="radiogroup" aria-label="Property type" className="flex shrink-0 items-center gap-1 rounded-2xl bg-navy-50/80 p-1">
      {counts.map(({ type, count }) => {
        const active = value.toLowerCase() === type.toLowerCase();
        return (
          <button
            key={type || 'all'}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(type)}
            className="relative h-10 whitespace-nowrap rounded-xl px-3.5 text-[13px] font-bold"
          >
            {active && <motion.span layoutId={pillId} transition={SPRING} className="absolute inset-0 rounded-xl bg-navy-950 shadow-md" />}
            <span className={`relative z-10 flex items-center gap-1.5 transition-colors ${active ? 'text-white' : 'text-navy-800/70 hover:text-navy-950'}`}>
              {type ? pluralType(type) : 'All'}
              <span className={`text-[11px] tabular-nums ${active ? 'text-amber-400' : 'text-navy-800/40'}`}>{count}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- View toggle */

function ViewToggle({ value, onChange, pillId }: { value: SearchState['view']; onChange: (v: SearchState['view']) => void; pillId: string }) {
  const options = [
    { value: 'grid' as const, label: 'Grid', icon: LayoutGrid },
    { value: 'map' as const, label: 'Map', icon: MapIcon },
  ];
  return (
    <div role="radiogroup" aria-label="Results view" className="flex shrink-0 items-center gap-1 rounded-2xl bg-navy-50/80 p-1">
      {options.map(({ value: v, label, icon: Icon }) => {
        const active = value === v;
        return (
          <button
            key={v}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(v)}
            className="relative h-10 rounded-xl px-3 text-[13px] font-bold"
          >
            {active && <motion.span layoutId={pillId} transition={SPRING} className="absolute inset-0 rounded-xl bg-white shadow-md ring-1 ring-navy-100" />}
            <span className={`relative z-10 flex items-center gap-1.5 transition-colors ${active ? 'text-navy-950' : 'text-navy-800/55 hover:text-navy-950'}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">{label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ---------------------------------------------------------------- Filters panel */

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`h-10 rounded-full px-4 text-[13px] font-bold transition-all duration-200 ${
        active ? 'bg-navy-950 text-white shadow-md' : 'bg-navy-50 text-navy-800/75 ring-1 ring-navy-100 hover:bg-white hover:text-navy-950 hover:ring-navy-300'
      }`}
    >
      {children}
    </button>
  );
}

function PanelSection({ title, children }: { title: string; children: React.ReactNode }) {
  const id = useId();
  return (
    <div role="group" aria-labelledby={id}>
      <p id={id} className="mb-3 text-[11px] font-extrabold uppercase tracking-[0.2em] text-navy-800/50">
        {title}
      </p>
      {children}
    </div>
  );
}

function MillionsInput({ label, value, onCommit }: { label: string; value: number | null; onCommit: (v: number | null) => void }) {
  const [draft, setDraft] = useState(value ? String(+(value / 1_000_000).toFixed(2)) : '');
  useEffect(() => setDraft(value ? String(+(value / 1_000_000).toFixed(2)) : ''), [value]);
  const commit = () => {
    const n = Number(draft);
    onCommit(draft.trim() && Number.isFinite(n) && n > 0 ? Math.round(n * 1_000_000) : null);
  };
  return (
    <label className="flex h-11 flex-1 items-center gap-2 rounded-xl bg-navy-50 px-3 ring-1 ring-navy-100 focus-within:bg-white focus-within:ring-amber-500/60">
      <span className="text-[11px] font-bold uppercase tracking-wider text-navy-800/50">{label}</span>
      <input
        inputMode="decimal"
        value={draft}
        onChange={(e) => setDraft(e.target.value.replace(/[^0-9.]/g, ''))}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && commit()}
        placeholder="Any"
        className="w-full min-w-0 bg-transparent text-right text-sm font-bold text-navy-950 outline-none placeholder:font-medium placeholder:text-navy-800/35"
      />
      <span className="text-xs font-semibold text-navy-800/50">Mn</span>
    </label>
  );
}

function FiltersPanel({
  state,
  update,
  hasRentals,
  typeCounts,
  resultCount,
  onClose,
  desktop,
}: {
  state: SearchState;
  update: (patch: Partial<SearchState>) => void;
  hasRentals: boolean;
  typeCounts: { type: string; count: number }[];
  resultCount: number;
  onClose: () => void;
  desktop: boolean;
}) {
  const clear = () => update({ purpose: '', minPrice: null, maxPrice: null, beds: 0, land: 0 });

  return (
    <motion.div
      role="dialog"
      aria-label="More filters"
      initial={desktop ? { opacity: 0, y: -8, scale: 0.98 } : { y: '100%' }}
      animate={desktop ? { opacity: 1, y: 0, scale: 1 } : { y: 0 }}
      exit={desktop ? { opacity: 0, y: -8, scale: 0.98 } : { y: '100%' }}
      transition={{ duration: desktop ? 0.25 : 0.45, ease: EASE_OUT_EXPO }}
      className="fixed inset-x-0 bottom-0 z-[60] flex max-h-[88vh] flex-col rounded-t-[28px] bg-white shadow-2xl md:absolute md:inset-x-auto md:bottom-auto md:right-0 md:top-full md:z-40 md:mt-3 md:max-h-none md:w-[560px] md:origin-top-right md:rounded-[24px] md:ring-1 md:ring-navy-100"
    >
      <div className="flex items-center justify-between px-6 pb-2 pt-5">
        <p className="text-lg font-extrabold tracking-tight text-navy-950">Refine your search</p>
        <button type="button" onClick={onClose} aria-label="Close filters" className="grid h-9 w-9 place-items-center rounded-full bg-navy-50 text-navy-900 transition hover:bg-navy-100">
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="min-h-0 flex-1 space-y-6 overflow-y-auto overscroll-contain px-6 pb-4 pt-2">
        {hasRentals && (
          <PanelSection title="Looking to">
            <div className="flex flex-wrap gap-2">
              {[
                { v: '' as const, l: 'Buy or rent' },
                { v: 'Sale' as const, l: 'Buy' },
                { v: 'Rent' as const, l: 'Rent' },
              ].map(({ v, l }) => (
                <Chip key={l} active={state.purpose === v} onClick={() => update({ purpose: v })}>
                  {l}
                </Chip>
              ))}
            </div>
          </PanelSection>
        )}

        <PanelSection title="Price (LKR)">
          <div className="flex flex-wrap gap-2">
            {PRICE_PRESETS.map((p) => {
              const active = state.minPrice === p.min && state.maxPrice === p.max;
              return (
                <Chip key={p.key} active={active} onClick={() => update(active ? { minPrice: null, maxPrice: null } : { minPrice: p.min, maxPrice: p.max })}>
                  {p.label}
                </Chip>
              );
            })}
          </div>
          <div className="mt-3 flex items-center gap-2">
            <MillionsInput label="Min" value={state.minPrice} onCommit={(v) => update({ minPrice: v })} />
            <span className="h-px w-3 bg-navy-200" aria-hidden="true" />
            <MillionsInput label="Max" value={state.maxPrice} onCommit={(v) => update({ maxPrice: v })} />
          </div>
        </PanelSection>

        <PanelSection title="Bedrooms">
          <div className="flex flex-wrap gap-2">
            {BED_OPTIONS.map((n) => (
              <Chip key={n} active={state.beds === n} onClick={() => update({ beds: n })}>
                {n === 0 ? 'Any' : `${n}+`}
              </Chip>
            ))}
          </div>
        </PanelSection>

        <PanelSection title="Land size">
          <div className="flex flex-wrap gap-2">
            {LAND_OPTIONS.map((o) => (
              <Chip key={o.value} active={state.land === o.value} onClick={() => update({ land: o.value })}>
                {o.label}
              </Chip>
            ))}
          </div>
        </PanelSection>

        <div className="space-y-6 lg:hidden">
          <PanelSection title="Property type">
            <div className="flex flex-wrap gap-2">
              {typeCounts.map(({ type, count }) => (
                <Chip key={type || 'all'} active={state.type.toLowerCase() === type.toLowerCase()} onClick={() => update({ type })}>
                  {type ? pluralType(type) : 'All'} <span className="ml-1 opacity-50">{count}</span>
                </Chip>
              ))}
            </div>
          </PanelSection>
          <PanelSection title="Sort by">
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((o) => (
                <Chip key={o.value} active={state.sort === o.value} onClick={() => update({ sort: o.value })}>
                  {o.label}
                </Chip>
              ))}
            </div>
          </PanelSection>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-navy-100 px-6 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] pt-4">
        <button type="button" onClick={clear} className="text-sm font-bold text-navy-800/60 underline-offset-4 transition hover:text-navy-950 hover:underline">
          Clear filters
        </button>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-12 items-center gap-2 rounded-full bg-amber-500 px-6 text-sm font-extrabold text-navy-950 shadow-md transition hover:bg-amber-400 active:scale-[0.98]"
        >
          <Check className="h-4 w-4" aria-hidden="true" />
          Show {resultCount} {resultCount === 1 ? 'property' : 'properties'}
        </button>
      </div>
    </motion.div>
  );
}

/* ---------------------------------------------------------------- Toolbar */

export function SearchToolbar({ state, update, typeCounts, places, hasRentals, resultCount }: SearchToolbarProps) {
  const top = useHeaderOffset();
  const desktop = useIsDesktop();
  const [panelOpen, setPanelOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const [stuck, setStuck] = useState(false);
  const filterCount = advancedFilterCount(state);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  useEffect(() => setPortalTarget(document.body), []);

  // Tighter shadow once the bar is docked under the header (no scroll listeners)
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), { rootMargin: `-${top + 12}px 0px 0px 0px` });
    io.observe(el);
    return () => io.disconnect();
  }, [top]);

  // Close the desktop panel on outside click or Escape; lock page scroll behind the phone sheet
  useEffect(() => {
    if (!panelOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (desktop && wrapRef.current && !wrapRef.current.contains(e.target as Node)) setPanelOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanelOpen(false);
    document.addEventListener('pointerdown', onPointer);
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    if (!desktop) document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('pointerdown', onPointer);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [panelOpen, desktop]);

  const panel = (
    <AnimatePresence>
      {panelOpen && (
        <>
          {!desktop && (
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setPanelOpen(false)}
              className="fixed inset-0 z-[55] bg-navy-950/50"
              aria-hidden="true"
            />
          )}
          <FiltersPanel
            key="panel"
            state={state}
            update={update}
            hasRentals={hasRentals}
            typeCounts={typeCounts}
            resultCount={resultCount}
            onClose={() => setPanelOpen(false)}
            desktop={desktop}
          />
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-0" />
      <div ref={wrapRef} className="sticky z-30" style={{ top: top + 10 }}>
        <div
          className={`flex flex-col gap-2 rounded-[24px] bg-white p-2 ring-1 ring-navy-100/90 transition-shadow duration-500 lg:flex-row lg:items-center ${
            stuck ? 'shadow-[0_18px_40px_-18px_rgba(8,26,46,0.35)]' : 'shadow-float'
          }`}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <LocationField value={state.location} onChange={(location) => update({ location })} places={places} />
            <button
              type="button"
              onClick={() => setPanelOpen((o) => !o)}
              aria-expanded={panelOpen}
              aria-label="More filters"
              className={`relative flex h-12 shrink-0 items-center gap-2 rounded-2xl px-4 text-[13px] font-bold transition lg:hidden ${
                panelOpen || filterCount ? 'bg-navy-950 text-white' : 'bg-navy-50/80 text-navy-900 hover:bg-navy-100'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Filters</span>
              {filterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-navy-950">{filterCount}</span>}
            </button>
            <div className="lg:hidden">
              <ViewToggle value={state.view} onChange={(view) => update({ view })} pillId="search-view-pill-compact" />
            </div>
          </div>

          <div className="hidden min-w-0 items-center gap-2 lg:flex">
            <TypeTabs value={state.type} onChange={(type) => update({ type })} counts={typeCounts} pillId="search-type-pill" />

            <button
              type="button"
              onClick={() => setPanelOpen((o) => !o)}
              aria-expanded={panelOpen}
              className={`relative hidden h-12 shrink-0 items-center gap-2 rounded-2xl px-4 text-[13px] font-bold transition lg:flex ${
                panelOpen || filterCount ? 'bg-navy-950 text-white' : 'bg-navy-50/80 text-navy-900 hover:bg-navy-100'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              Filters
              {filterCount > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-amber-500 px-1 text-[10px] font-extrabold text-navy-950">{filterCount}</span>}
            </button>

            <label className="relative shrink-0">
              <span className="sr-only">Sort results</span>
              <select
                value={state.sort}
                onChange={(e) => update({ sort: e.target.value as SortKey })}
                className="h-12 appearance-none rounded-2xl bg-navy-50/80 pl-4 pr-9 text-[13px] font-bold text-navy-900 outline-none transition hover:bg-navy-100 focus:ring-2 focus:ring-amber-500/60"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-800/50" aria-hidden="true" />
            </label>

            <ViewToggle value={state.view} onChange={(view) => update({ view })} pillId="search-view-pill" />
          </div>
        </div>

        {/* The phone sheet is portalled so it layers above the fixed site header */}
        {desktop ? panel : portalTarget ? createPortal(panel, portalTarget) : null}
      </div>

      {/* Below desktop the type tabs scroll with the page, keeping the docked bar to one row */}
      <div className="no-scrollbar -mx-4 mt-3 overflow-x-auto px-4 lg:hidden">
        <div className="inline-flex rounded-2xl bg-white p-1 shadow-sm ring-1 ring-navy-100">
          <TypeTabs value={state.type} onChange={(type) => update({ type })} counts={typeCounts} pillId="search-type-pill-compact" />
        </div>
      </div>
    </>
  );
}

/* ---------------------------------------------------------------- Active filter chips */

export function ActiveFilters({ state, update, onClearAll }: { state: SearchState; update: (patch: Partial<SearchState>) => void; onClearAll: () => void }) {
  const chips: { key: string; label: string; clear: Partial<SearchState> }[] = [];
  if (state.location.trim()) chips.push({ key: 'location', label: state.location.trim(), clear: { location: '' } });
  if (state.type) chips.push({ key: 'type', label: pluralType(state.type), clear: { type: '' } });
  if (state.purpose) chips.push({ key: 'purpose', label: state.purpose === 'Sale' ? 'To buy' : 'To rent', clear: { purpose: '' } });
  const price = priceLabel(state.minPrice, state.maxPrice);
  if (price) chips.push({ key: 'price', label: `LKR ${price}`, clear: { minPrice: null, maxPrice: null } });
  if (state.beds) chips.push({ key: 'beds', label: `${state.beds}+ beds`, clear: { beds: 0 } });
  if (state.land) chips.push({ key: 'land', label: LAND_OPTIONS.find((o) => o.value === state.land)?.label || `${state.land}+ perches`, clear: { land: 0 } });
  if (state.saved) chips.push({ key: 'saved', label: 'Shortlist only', clear: { saved: false } });

  return (
    <AnimatePresence initial={false}>
      {chips.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
          className="overflow-hidden"
        >
          <ul className="flex flex-wrap items-center gap-2 pt-4" aria-label="Active filters">
            <AnimatePresence initial={false} mode="popLayout">
              {chips.map((chip) => (
                <motion.li
                  key={chip.key}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.25 }}
                >
                  <button
                    type="button"
                    onClick={() => update(chip.clear)}
                    className="group inline-flex h-9 items-center gap-1.5 rounded-full bg-white pl-3.5 pr-2 text-[13px] font-semibold text-navy-900 shadow-sm ring-1 ring-navy-100 transition hover:ring-navy-300"
                    aria-label={`Remove filter: ${chip.label}`}
                  >
                    {chip.label}
                    <span className="grid h-5 w-5 place-items-center rounded-full bg-navy-50 transition group-hover:bg-amber-500">
                      <X className="h-3 w-3" aria-hidden="true" />
                    </span>
                  </button>
                </motion.li>
              ))}
              <motion.li key="clear-all" layout>
                <button type="button" onClick={onClearAll} className="h-9 px-2 text-[13px] font-bold text-amber-700 underline-offset-4 hover:underline">
                  Clear all
                </button>
              </motion.li>
            </AnimatePresence>
          </ul>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
