import React from 'react';

export function EmptyState({ onClear }: {onClear: () => void;}) {
  return (
    <div className="col-span-full flex flex-col items-center rounded-3xl border border-dashed border-navy-200 bg-navy-50/40 px-6 py-16 text-center">
      <svg width="132" height="112" viewBox="0 0 132 112" fill="none" aria-hidden="true">
        <path
          d="M18 56 66 20l48 36"
          stroke="#12355B"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round" />
        
        <path
          d="M28 54v38h76V54"
          stroke="#94b3d5"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round" />
        
        <rect x="56" y="70" width="20" height="22" rx="2" stroke="#94b3d5" strokeWidth="3" />
        <circle cx="86" cy="52" r="19" fill="#fff" stroke="#F4A300" strokeWidth="4" />
        <path d="M99 66l14 14" stroke="#F4A300" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <h2 className="mt-7 text-xl font-bold text-navy-800">No properties match your filters</h2>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-navy-800/60">
        Try widening the price range or removing a property type — or clear everything and start
        again.
      </p>
      <button
        type="button"
        onClick={onClear}
        className="mt-7 rounded-full bg-navy-800 px-6 py-3 text-sm font-bold text-white transition-all hover:-translate-y-0.5 hover:bg-navy-700">
        
        Clear Filters
      </button>
    </div>);

}
