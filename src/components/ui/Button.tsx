import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'accent' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none select-none';

    const variants = {
      primary:
        'bg-navy-900 text-white hover:bg-navy-950 focus:ring-navy-800 active:scale-[0.99] shadow-sm',
      secondary:
        'bg-white border border-navy-200 text-navy-800 hover:bg-navy-50/80 hover:border-navy-300 focus:ring-navy-800 active:scale-[0.99]',
      accent:
        'bg-amber-500 text-navy-950 font-bold hover:bg-amber-400 focus:ring-amber-500 active:scale-[0.99] shadow-[0_6px_20px_-6px_rgba(244,163,0,0.6)]',
      outline:
        'border border-navy-800 text-navy-800 hover:bg-navy-800 hover:text-white focus:ring-navy-800 active:scale-[0.99]',
      ghost:
        'text-navy-800 hover:bg-navy-50/80 focus:ring-navy-200',
    };

    const sizes = {
      sm: 'px-3.5 py-1.5 text-xs rounded-lg gap-1.5',
      md: 'px-4.5 py-2.5 text-sm rounded-xl gap-2',
      lg: 'px-6 py-3.5 text-base font-bold rounded-xl gap-2.5',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

