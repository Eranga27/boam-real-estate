import React from 'react';
import { FolderSearch } from 'lucide-react';
import { Button } from './Button';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
  icon?: React.ReactNode;
}

export function EmptyState({
  title = "No results found",
  description = "Try adjusting your search criteria or filters to find what you're looking for.",
  actionLabel,
  onAction,
  className,
  icon
}: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-6 text-center rounded-2xl border border-dashed border-navy-200/80 bg-navy-50/40", className)}>
      <div className="w-14 h-14 mb-4 rounded-2xl bg-navy-100 text-navy-800 flex items-center justify-center shadow-subtle">
        {icon || <FolderSearch className="w-7 h-7 text-navy-700" />}
      </div>
      <h3 className="text-lg font-bold text-navy-900 mb-1.5">{title}</h3>
      <p className="text-navy-800/60 text-sm max-w-sm mb-6 leading-relaxed">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary" size="md">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

