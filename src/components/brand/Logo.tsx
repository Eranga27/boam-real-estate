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

/** Height values in px for each size preset */
const SIZE_H: Record<NonNullable<LogoProps['size']>, number> = {
  sm: 30,
  md: 34,
  lg: 42,
  responsive: 36,
};

export function Logo({
  variant = 'dark',
  type = 'horizontal',
  showWordmark = true,
  className = '',
  size = 'responsive',
}: LogoProps) {
  const isLight = variant === 'light';
  const isCompact = type === 'compact' || !showWordmark;
  const h = SIZE_H[size];

  // Colour tokens
  const markBg   = isLight ? '#FFFFFF' : '#12355B';
  const markText = isLight ? '#12355B' : '#FFFFFF';
  const wordFill = isLight ? '#FFFFFF' : '#12355B';
  const goldFill = '#F4A300';
  const subFill  = isLight ? 'rgba(255,255,255,0.55)' : 'rgba(18,53,91,0.45)';

  const baseFont: React.CSSProperties = {
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 800,
    letterSpacing: '-0.02em',
  };

  // ── Compact monogram ─────────────────────────────────────────────
  if (isCompact) {
    return (
      <span className={`inline-flex items-center shrink-0 ${className}`}>
        <svg
          width={h}
          height={h}
          viewBox="0 0 40 40"
          fill="none"
          aria-label="BOAM"
          role="img"
        >
          <rect x="0" y="0" width="40" height="40" rx="9" fill={markBg} />
          <rect x="0" y="33" width="40" height="7" rx="4" fill={goldFill} />
          <text x="9" y="29" fontSize="23" style={{ ...baseFont, fill: markText }}>
            B
          </text>
        </svg>
      </span>
    );
  }

  // ── Horizontal wordmark ───────────────────────────────────────────
  const logoW = Math.round(h * 3.8);
  return (
    <span className={`inline-flex items-center shrink-0 ${className}`}>
      <svg
        width={logoW}
        height={h}
        viewBox="0 0 144 38"
        fill="none"
        aria-label="BOAM Real-Estates"
        role="img"
      >
        {/* Square mark */}
        <rect x="0" y="0" width="36" height="36" rx="8" fill={markBg} />
        <rect x="0" y="29" width="36" height="7" rx="3.5" fill={goldFill} />
        <text x="7" y="27" fontSize="21" style={{ ...baseFont, fill: markText }}>
          B
        </text>

        {/* Wordmark */}
        <text x="44" y="27" fontSize="22" style={{ ...baseFont, fill: wordFill }}>
          BOAM
        </text>

        {/* Sub-label */}
        <text
          x="45"
          y="37"
          fontSize="7.5"
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontWeight: 600,
            letterSpacing: '0.14em',
            fill: subFill,
          }}
        >
          REAL ESTATE
        </text>
      </svg>
    </span>
  );
}