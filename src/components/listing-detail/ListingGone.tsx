import React from 'react';
import Link from 'next/link';
import { ArrowLeft, ImageOff } from 'lucide-react';

/** Shown for a listing that was deleted or never existed */
export function ListingGone() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50/50 p-6 pt-24 text-center">
      <span className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-card ring-1 ring-navy-100">
        <ImageOff className="h-7 w-7 text-navy-400" aria-hidden="true" />
      </span>
      <h1 className="text-3xl font-extrabold tracking-tight text-navy-950">This property has moved on</h1>
      <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-navy-800/60">
        The listing may have sold or been withdrawn. There&apos;s plenty more to explore, or ask us to find something similar.
      </p>
      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Link href="/search" className="inline-flex h-12 items-center gap-2 rounded-full bg-navy-950 px-6 text-sm font-bold text-white transition hover:bg-navy-800">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Browse all properties
        </Link>
        <Link href="/request" className="inline-flex h-12 items-center gap-2 rounded-full bg-amber-500 px-6 text-sm font-extrabold text-navy-950 transition hover:bg-amber-400">
          Request a property
        </Link>
      </div>
    </div>
  );
}
