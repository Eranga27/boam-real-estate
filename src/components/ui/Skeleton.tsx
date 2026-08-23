import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('animate-pulse rounded-xl bg-navy-100/60', className)}
      {...props}
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl overflow-hidden border border-navy-100/80 bg-white shadow-card">
      <Skeleton className="w-full aspect-[4/3] rounded-none bg-navy-100/70" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-7 w-1/3" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between pt-4 border-t border-navy-100/60">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}

