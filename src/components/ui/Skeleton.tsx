import React from 'react';
import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-gray-200", className)}
      {...props}
    />
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-xl overflow-hidden border border-gray-100 bg-white">
      <Skeleton className="w-full aspect-[4/3] rounded-none" />
      <div className="p-5 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-5 w-3/4" />
        </div>
        <Skeleton className="h-4 w-1/2" />
        <div className="flex justify-between pt-4 border-t border-gray-100">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
  );
}
