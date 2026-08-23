import React from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy-800/45 shrink-0 pointer-events-none transition-colors">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            'flex h-11 sm:h-12 w-full rounded-xl border border-navy-200 bg-white px-3.5 py-2 text-sm text-navy-900 font-medium placeholder:text-navy-800/40 shadow-subtle transition-all duration-200 focus-visible:outline-none focus-visible:border-navy-800 focus-visible:ring-2 focus-visible:ring-navy-800/20 disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);
Input.displayName = 'Input';

