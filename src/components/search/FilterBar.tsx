'use client';
import React from 'react';
import { MapPinIcon, MinusIcon, PlusIcon, SlidersHorizontalIcon, XIcon } from 'lucide-react';
import { districts, propertyTypes } from '@/data/properties';
import { formatPrice } from '@/lib/format';

export interface Filters {
  types: string[];
  minPrice: number;
  maxPrice: number;
  beds: number;
  baths: number;
  location: string;
  district: string;
}

export const PRICE_MIN = 0;
export const PRICE_MAX = 200_000_000;
const PRICE_STEP = 2_500_000;

export const emptyFilters: Filters = {
  types: [],
  minPrice: PRICE_MIN,
  maxPrice: PRICE_MAX,
  beds: 0,
  baths: 0,
  location: '',
  district: ''
};

interface FilterBarProps {
  filters: Filters;
  onChange: (filters: Filters) => void;
  onApply: () => void;
  onClear: () => void;
  resultCount: number;
}

function Counter({
  label,
  value,
  onChange




}: {label: string;value: number;onChange: (value: number) => void;}) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-800/45">{label}</p>
      <div className="mt-2 flex items-center gap-1 rounded-full border border-navy-200 p-1">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          aria-label={`Decrease minimum ${label}`}
          className="grid h-7 w-7 place-items-center rounded-full text-navy-700 transition-colors hover:bg-navy-100 disabled:opacity-30"
          disabled={value === 0}>
          
          <MinusIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
        <span className="w-9 text-center text-sm font-bold text-navy-800" aria-live="polite">
          {value === 0 ? 'Any' : `${value}+`}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(6, value + 1))}
          aria-label={`Increase minimum ${label}`}
          className="grid h-7 w-7 place-items-center rounded-full text-navy-700 transition-colors hover:bg-navy-100">
          
          <PlusIcon className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>);

}

export function FilterBar({ filters, onChange, onApply, onClear, resultCount }: FilterBarProps) {
  const set = <K extends keyof Filters,>(key: K, value: Filters[K]) =>
  onChange({ ...filters, [key]: value });

  const toggleType = (type: string) =>
  set(
    'types',
    filters.types.includes(type) ?
    filters.types.filter((t) => t !== type) :
    [...filters.types, type]
  );

  const minPct = filters.minPrice / PRICE_MAX * 100;
  const maxPct = filters.maxPrice / PRICE_MAX * 100;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-800/45">
          Property type
        </p>
        <div className="mt-2.5 flex flex-wrap gap-2">
          {propertyTypes.map((type) => {
            const active = filters.types.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                aria-pressed={active}
                className={`rounded-full border px-4 py-2 text-[13px] font-semibold transition-all ${
                active ?
                'border-navy-800 bg-navy-800 text-white' :
                'border-navy-200 bg-white text-navy-800/70 hover:border-navy-400 hover:text-navy-800'}`
                }>
                
                {type}
              </button>);

          })}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto_auto_minmax(0,1fr)] lg:items-end">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-800/45">
              Price range
            </p>
            <p className="text-xs font-bold text-navy-800">
              {formatPrice(filters.minPrice, 'sale')} –{' '}
              {filters.maxPrice >= PRICE_MAX ? 'Any' : formatPrice(filters.maxPrice, 'sale')}
            </p>
          </div>
          <div className="relative mt-5 h-5">
            <div className="absolute inset-x-0 top-2 h-1.5 rounded-full bg-navy-100" />
            <div
              className="absolute top-2 h-1.5 rounded-full bg-amber-500"
              style={{ left: `${minPct}%`, right: `${100 - maxPct}%` }} />
            
            <label htmlFor="min-price" className="sr-only">
              Minimum price
            </label>
            <input
              id="min-price"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={filters.minPrice}
              onChange={(e) =>
              set('minPrice', Math.min(Number(e.target.value), filters.maxPrice - PRICE_STEP))
              }
              className="brand-range absolute inset-x-0 top-0 h-5 w-full" />
            
            <label htmlFor="max-price" className="sr-only">
              Maximum price
            </label>
            <input
              id="max-price"
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={PRICE_STEP}
              value={filters.maxPrice}
              onChange={(e) =>
              set('maxPrice', Math.max(Number(e.target.value), filters.minPrice + PRICE_STEP))
              }
              className="brand-range absolute inset-x-0 top-0 h-5 w-full" />
            
          </div>
        </div>

        <Counter label="Beds" value={filters.beds} onChange={(v) => set('beds', v)} />
        <Counter label="Baths" value={filters.baths} onChange={(v) => set('baths', v)} />

        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-800/45">
            Location
          </p>
          <div className="mt-2 flex flex-col gap-2 sm:flex-row">
            <div className="flex flex-1 items-center gap-2 rounded-full border border-navy-200 px-4 py-2.5 transition-colors focus-within:border-navy-800">
              <MapPinIcon className="h-4 w-4 shrink-0 text-amber-500" aria-hidden="true" />
              <label htmlFor="filter-location" className="sr-only">
                City or area
              </label>
              <input
                id="filter-location"
                value={filters.location}
                onChange={(e) => set('location', e.target.value)}
                placeholder="City or area"
                className="w-full bg-transparent text-sm font-medium text-navy-900 placeholder:text-navy-800/40 focus:outline-none" />
              
            </div>
            <label htmlFor="filter-district" className="sr-only">
              District
            </label>
            <select
              id="filter-district"
              value={filters.district}
              onChange={(e) => set('district', e.target.value)}
              className="rounded-full border border-navy-200 bg-white px-4 py-2.5 text-sm font-medium text-navy-800 transition-colors focus:border-navy-800 focus:outline-none">
              
              <option value="">All districts</option>
              {districts.map((d) =>
              <option key={d} value={d}>
                  {d}
                </option>
              )}
            </select>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-navy-100 pt-5">
        <p className="flex items-center gap-2 text-sm font-semibold text-navy-800/60">
          <SlidersHorizontalIcon className="h-4 w-4 text-navy-300" aria-hidden="true" />
          {resultCount} {resultCount === 1 ? 'property' : 'properties'} match
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClear}
            className="inline-flex items-center gap-1.5 rounded-full px-4 py-2.5 text-sm font-bold text-navy-800/60 transition-colors hover:bg-navy-50 hover:text-navy-800">
            
            <XIcon className="h-4 w-4" aria-hidden="true" />
            Clear All
          </button>
          <button
            type="button"
            onClick={onApply}
            className="rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-navy-900 transition-all hover:-translate-y-0.5 hover:bg-amber-400">
            
            Apply Filters
          </button>
        </div>
      </div>
    </div>);

}