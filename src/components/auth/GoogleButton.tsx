import React from 'react';

export function GoogleButton({ label }: {label: string;}) {
  return (
    <button
      type="button"
      className="inline-flex w-full items-center justify-center gap-3 rounded-full border border-navy-200 bg-white px-6 py-3.5 text-sm font-bold text-navy-800 transition-all hover:border-navy-400 hover:bg-navy-50">
      
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.71-1.57 2.68-3.89 2.68-6.62Z" />
        
        <path
          fill="#34A853"
          d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H1.01v2.34A8.99 8.99 0 0 0 9 18Z" />
        
        <path
          fill="#FBBC05"
          d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.94H1.01a9 9 0 0 0 0 8.12l2.96-2.34Z" />
        
        <path
          fill="#EA4335"
          d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.9 11.43 0 9 0A8.99 8.99 0 0 0 1.01 4.94l2.96 2.34C4.68 5.16 6.66 3.58 9 3.58Z" />
        
      </svg>
      {label}
    </button>);

}
