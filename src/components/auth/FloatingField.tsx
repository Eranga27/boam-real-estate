import React, { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';

interface FloatingFieldProps {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
}

export function FloatingField({
  id,
  label,
  type = 'text',
  autoComplete,
  required = true,
  defaultValue
}: FloatingFieldProps) {
  const isPassword = type === 'password';
  const [reveal, setReveal] = useState(false);

  return (
    <div className="float-field relative">
      <input
        id={id}
        name={id}
        type={isPassword && reveal ? 'text' : type}
        placeholder=" "
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className={`peer w-full rounded-xl border border-navy-200 bg-white px-4 pb-2.5 pt-6 text-[15px] font-medium text-navy-900 transition-colors focus:border-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-800/10 ${
        isPassword ? 'pr-12' : ''}`
        } />
      
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-4 top-4 origin-left text-[15px] font-medium text-navy-800/45 transition-all duration-200">
        
        {label}
      </label>
      {isPassword &&
      <button
        type="button"
        onClick={() => setReveal((v) => !v)}
        aria-label={reveal ? 'Hide password' : 'Show password'}
        className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-navy-800/45 transition-colors hover:bg-navy-50 hover:text-navy-800">
        
          {reveal ?
        <EyeOffIcon className="h-[18px] w-[18px]" aria-hidden="true" /> :

        <EyeIcon className="h-[18px] w-[18px]" aria-hidden="true" />
        }
        </button>
      }
    </div>);

}
