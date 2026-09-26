import React from 'react';

/** Route-change placeholder in the site's own palette (shimmer, not grey boxes) */
export default function Loading() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-28 sm:px-6 lg:px-8" aria-busy="true" aria-label="Loading">
      <div className="skeleton-shimmer mb-8 h-10 w-1/3 rounded-2xl" />
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-[26px] bg-white p-2 ring-1 ring-navy-100">
            <div className="skeleton-shimmer aspect-[4/3] rounded-[20px]" />
            <div className="space-y-2.5 px-3 pb-3 pt-4">
              <div className="skeleton-shimmer h-5 w-1/3 rounded-full" />
              <div className="skeleton-shimmer h-3.5 w-3/4 rounded-full" />
              <div className="skeleton-shimmer h-3 w-1/2 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
