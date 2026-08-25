'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled BOAM Application Error:', error);
  }, [error]);

  return (
    <main className="min-h-screen bg-navy-50/50 flex flex-col items-center justify-center text-center px-4 pt-24 pb-20">
      <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-500/20">
        <AlertCircle className="w-9 h-9 text-amber-600" aria-hidden="true" />
      </div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-amber-600 mb-3">
        Unexpected Error
      </p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-navy-950 mb-3 tracking-tight">
        Something went wrong
      </h1>
      <p className="text-navy-800/70 max-w-md mb-8 text-sm sm:text-base leading-relaxed">
        We encountered a temporary issue while loading this page. Please try again or return to the homepage.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 items-center">
        <Button
          onClick={() => reset()}
          className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-7 py-3 text-xs sm:text-sm font-bold text-navy-950 shadow-sm transition-all hover:bg-amber-400"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          Try Again
        </Button>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-navy-200 bg-white px-7 py-3 text-xs sm:text-sm font-bold text-navy-800 transition-all hover:border-navy-900 hover:bg-navy-900 hover:text-white"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Go to Homepage
        </Link>
      </div>
    </main>
  );
}
