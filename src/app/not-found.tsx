import React from 'react';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-navy-50/50 flex flex-col items-center justify-center text-center px-4 pt-24 pb-20">
      <div className="w-20 h-20 bg-navy-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="w-9 h-9 text-navy-400" aria-hidden="true" />
      </div>
      <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600 mb-3">404 — Page Not Found</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 mb-3 tracking-tight">
        We couldn&apos;t find that page.
      </h1>
      <p className="text-navy-800/60 max-w-md mb-10 text-base leading-relaxed">
        The page you&apos;re looking for may have been removed, renamed, or never existed.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 text-sm font-bold text-navy-950 shadow-[0_8px_24px_-8px_rgba(244,163,0,0.7)] transition-all hover:bg-amber-400 hover:-translate-y-0.5"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Go to Homepage
        </Link>
        <Link
          href="/search"
          className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-7 py-3 text-sm font-bold text-navy-800 transition-all hover:border-navy-900 hover:bg-navy-900 hover:text-white"
        >
          Browse Properties
        </Link>
      </div>
    </main>
  );
}
