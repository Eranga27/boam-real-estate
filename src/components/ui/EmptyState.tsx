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
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50", className)}>
      <div className="w-16 h-16 mb-4 rounded-full bg-primary/10 text-primary flex items-center justify-center">
        {icon || <FolderSearch className="w-8 h-8" />}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
