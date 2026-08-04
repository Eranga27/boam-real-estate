'use client';
import React from 'react';

interface LogoProps {
  /** 'light' for dark backgrounds, 'dark' for white backgrounds */
  variant?: 'light' | 'dark';
  showWordmark?: boolean;
  className?: string;
}

export function Logo({ variant = 'dark', showWordmark = true, className = '' }: LogoProps) {
  const primary = variant === 'light' ? '#FFFFFF' : '#12355B';
  const sub = variant === 'light' ? 'rgba(255,255,255,0.62)' : '#5e8abc';

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        width="38"
        height="38"
        viewBox="0 0 40 40"
        fill="none"
        aria-hidden="true"
        className="shrink-0">
        
        <rect width="40" height="40" rx="11" fill={variant === 'light' ? 'rgba(255,255,255,0.12)' : '#12355B'} />
        <path
          d="M11 21.6 20 12.4l9 9.2"
          stroke="#F4A300"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round" />
        
        <path
          d="M13.6 22.4V28h5.1v-4.1h2.6V28h5.1v-5.6"
          stroke={variant === 'light' ? '#FFFFFF' : '#FFFFFF'}
          strokeWidth="2.1"
          strokeLinecap="round"
          strokeLinejoin="round" />
        
      </svg>
      {showWordmark &&
      <span className="flex flex-col leading-none">
          <span
          className="text-[17px] font-extrabold tracking-tight"
          style={{ color: primary }}>
          
            BOAM
            <span style={{ color: '#F4A300' }}>.</span>
          </span>
          <span
          className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: sub }}>
          
            Real-Estates
          </span>
        </span>
      }
    </span>);

}