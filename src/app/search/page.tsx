'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import PropertySearch from '@/components/PropertySearch';

function SearchPageInner() {
  const params = useSearchParams();
  const location = params.get('location') || '';
  const type = params.get('type') || '';

  return (
    <PropertySearch
      initialType=""
      initialLocation={location}
      initialPropertyType={type}
      title="Property Search"
      subtitle="Explore houses, apartments, villas and prime land opportunities across Sri Lanka."
    />
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-navy-50/50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <SearchPageInner />
    </Suspense>
  );
}
