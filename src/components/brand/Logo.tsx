'use client';
import React from 'react';

interface LogoProps {
  /** 'light' for dark/hero backgrounds, 'dark' for white backgrounds */
  variant?: 'light' | 'dark';
  /** 'horizontal' (default), 'compact' monogram, or 'normal' full logo */
  type?: 'horizontal' | 'compact' | 'normal';
  showWordmark?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'responsive';
}

export function Logo({
  variant = 'dark',
  type = 'horizontal',
  showWordmark = true,
  className = '',
  size = 'responsive',
}: LogoProps) {
  // Select appropriate PNG logo asset from /images/
  let logoSrc = '/images/boamhorizontallogo.png';
  if (type === 'compact' || !showWordmark) {
    logoSrc = '/images/boamcompactmonogram.png';
  } else if (type === 'normal') {
    logoSrc = '/images/boamnormallogo.png';
  }

  // Responsive sizing presets to maintain header balance without layout shift
  const sizeClasses = {
    sm: 'h-8 sm:h-9',
    md: 'h-9 sm:h-10 lg:h-11',
    lg: 'h-10 sm:h-12 lg:h-14',
    responsive: 'h-9 sm:h-[42px] lg:h-[46px]',
  };

  // Contrast filter: On dark hero backgrounds, invert navy text to crisp white with subtle drop-shadow
  const contrastClass =
    variant === 'light'
      ? 'brightness-0 invert drop-shadow-[0_1px_3px_rgba(0,0,0,0.4)] opacity-95 hover:opacity-100'
      : 'brightness-100 drop-shadow-none opacity-100';

  return (
    <span className={`inline-flex items-center shrink-0 ${className}`}>
      <img
        src={logoSrc}
        alt="BOAM Real-Estates"
        loading="eager"
        decoding="async"
        className={`w-auto object-contain transition-all duration-300 ${sizeClasses[size]} ${contrastClass}`}
      />
    </span>
  );
}
