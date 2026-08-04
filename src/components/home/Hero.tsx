'use client';
import React, { useMemo, useState } from 'react';
import { useRouter as useNavigate  } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDownIcon, MapPinIcon, SearchIcon, ShieldCheckIcon } from 'lucide-react';
import { heroImage } from '@/data/locations';
import { propertyTypes } from '@/data/properties';

const cities = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Nugegoda', 'Mount Lavinia', 'Matara'];

export function Hero() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [focused, setFocused] = useState(false);

  const suggestions = useMemo(() => {
    if (!location.trim()) return cities.slice(0, 5);
    return cities.filter((c) => c.toLowerCase().includes(location.trim().toLowerCase())).slice(0, 5);
  }, [location]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (type) params.set('type', type);
    navigate.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden">
      <img
        src={heroImage}
        alt="Luxury ocean-facing villa on Sri Lanka's southern coast at dusk"
        className="absolute inset-0 h-full w-full object-cover" />
      
      <div className="absolute inset-0 bg-navy-950/72" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/25 to-navy-950/60" />

      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-28 text-center sm:px-6 lg:pb-24">
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/85 backdrop-blur">
          
          <ShieldCheckIcon className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          Exclusive broker-verified portfolio
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-6 text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl lg:text-[4.25rem]">
          
          Find Your Perfect Property in{' '}
          <span className="relative whitespace-nowrap">
            <span className="relative z-10">Sri Lanka</span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.7, delay: 0.75, ease: 'easeOut' }}
              style={{ originX: 0 }}
              className="absolute inset-x-0 bottom-1.5 z-0 h-3 rounded-full bg-amber-500/70 sm:bottom-2 sm:h-4" />
            
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
          
          Exclusive listings you won't find elsewhere, every title and boundary verified, and one
          dedicated broker with you from first viewing to final signature.
        </motion.p>

        <motion.form
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          onSubmit={submit}
          className="mx-auto mt-10 w-full max-w-3xl"
          role="search">
          
          <div className="flex flex-col gap-2 rounded-3xl bg-white/95 p-2.5 shadow-float backdrop-blur sm:flex-row sm:items-center sm:rounded-full">
            <div className="relative flex-1">
              <label htmlFor="hero-location" className="sr-only">
                Location
              </label>
              <div className="flex items-center gap-2.5 rounded-2xl px-4 py-3 sm:rounded-full">
                <MapPinIcon className="h-[18px] w-[18px] shrink-0 text-amber-500" aria-hidden="true" />
                <input
                  id="hero-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => window.setTimeout(() => setFocused(false), 120)}
                  placeholder="City, district or neighbourhood"
                  autoComplete="off"
                  className="w-full bg-transparent text-[15px] font-medium text-navy-900 placeholder:text-navy-800/40 focus:outline-none" />
                
              </div>
              {focused && suggestions.length > 0 &&
              <ul className="absolute left-0 top-full z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white py-1.5 text-left shadow-float ring-1 ring-navy-100">
                  {suggestions.map((city) =>
                <li key={city}>
                      <button
                    type="button"
                    onClick={() => setLocation(city)}
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-sm font-medium text-navy-800 transition-colors hover:bg-navy-50">
                    
                        <MapPinIcon className="h-3.5 w-3.5 text-navy-300" aria-hidden="true" />
                        {city}
                      </button>
                    </li>
                )}
                </ul>
              }
            </div>

            <div className="hidden h-8 w-px bg-navy-100 sm:block" />

            <div className="relative sm:w-52">
              <label htmlFor="hero-type" className="sr-only">
                Property type
              </label>
              <select
                id="hero-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none rounded-2xl bg-transparent px-4 py-3 pr-10 text-[15px] font-medium text-navy-900 focus:outline-none sm:rounded-full">
                
                <option value="">Any property type</option>
                {propertyTypes.map((t) =>
                <option key={t} value={t}>
                    {t}
                  </option>
                )}
              </select>
              <ChevronDownIcon
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                aria-hidden="true" />
              
            </div>

            <button
              type="submit"
              className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-7 py-3.5 text-sm font-bold text-navy-900 transition-all hover:bg-amber-400 hover:shadow-[0_12px_28px_-14px_rgba(244,163,0,1)] sm:rounded-full">
              
              <SearchIcon className="h-4 w-4" aria-hidden="true" />
              Search
            </button>
          </div>
        </motion.form>
      </div>
    </section>);

}