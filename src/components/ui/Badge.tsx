import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'primary'
    | 'secondary'
    | 'accent'
    | 'verified'
    | 'sale'
    | 'rent'
    | 'land'
    | 'featured'
    | 'outline'
    | 'gray';
}

export function Badge({ className, variant = 'primary', ...props }: BadgeProps) {
  const baseStyles =
    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider transition-colors';

  const variants = {
    primary: 'bg-navy-100 text-navy-800 border border-navy-200/60',
    secondary: 'bg-sea-50 text-sea-700 border border-sea-200/80',
    accent: 'bg-amber-500 text-navy-950 font-extrabold shadow-sm',
    verified: 'bg-sea-600 text-white font-bold tracking-wide shadow-sm',
    sale: 'bg-amber-500 text-navy-950 font-bold shadow-sm',
    rent: 'bg-sea-600 text-white font-bold shadow-sm',
    land: 'bg-emerald-600 text-white font-bold shadow-sm',
    featured: 'bg-amber-50 text-amber-800 border border-amber-300/80 font-bold',
    outline: 'border border-navy-200 text-navy-800 bg-white',
    gray: 'bg-navy-50 text-navy-700 border border-navy-100',
  };

  return (
    <span className={cn(baseStyles, variants[variant], className)} {...props} />
  );
}

