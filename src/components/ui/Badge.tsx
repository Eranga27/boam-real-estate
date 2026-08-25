import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'gray';
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium';
  const variants = {
    primary: 'bg-primary/10 text-primary',
    secondary: 'bg-secondary/10 text-secondary',
    accent: 'bg-accent/10 text-accent-foreground',
    outline: 'border border-gray-200 text-gray-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}
