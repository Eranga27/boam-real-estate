'use client';

import PropertySearch from '@/components/search/PropertySearch';

interface SearchClientProps {
  initialProperties?: any[];
}

export default function SearchClient({ initialProperties }: SearchClientProps) {
  return <PropertySearch initialProperties={initialProperties} />;
}
