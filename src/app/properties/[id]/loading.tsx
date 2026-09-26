'use client';

import { useParams } from 'next/navigation';
import { getHandoff } from '@/lib/listingTransition';
import { DetailSkeleton } from './DetailSkeleton';

/** Shown instantly while a listing page loads, already holding the clicked card's photo */
export default function Loading() {
  const params = useParams<{ id: string }>();
  const id = typeof params?.id === 'string' ? decodeURIComponent(params.id) : '';
  return <DetailSkeleton handoff={id ? getHandoff(id) : null} />;
}
