'use client';

import React, { useMemo, useState } from 'react';
import { useRouter as useNavigate } from 'next/navigation';
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
    <section className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-navy-950">
      {/* Background Villa Photography with Cinematic Entrance */}
      <motion.img
        src={heroImage}
        alt="Exclusive ocean-facing villa in Sri Lanka"
        initial={{ scale: 1.06, opacity: 0.7 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        className="absolute inset-0 h-full w-full object-cover object-center"
      />

      {/* Editorial Sophisticated Dark Vignette Overlays */}
      <div className="absolute inset-0 bg-navy-950/55" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-navy-950/60" />

      {/* Main Content Area */}
      <div className="relative z-10 mx-auto w-full max-w-4xl px-4 pb-16 pt-32 text-center sm:px-6 lg:pb-24 lg:pt-36">
        {/* Subtle Broker Verification Pill */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 backdrop-blur-md shadow-sm"
        >
          <ShieldCheckIcon className="h-4 w-4 text-amber-400" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-white/90">
            Exclusive broker-verified portfolio
          </span>
        </motion.div>

        {/* Editorial Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.06]"
        >
          Property, with{' '}
          <span className="relative inline-block text-amber-400">
            confidence.
          </span>
        </motion.h1>

        {/* Supporting Copy */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
          className="mx-auto mt-5 max-w-2xl text-base font-normal leading-relaxed text-white/80 sm:text-xl"
        >
          Broker-verified homes, land and developments across Sri Lanka.
        </motion.p>

        {/* Premium Floating Search Panel */}
        <motion.form
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.38, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={submit}
          className="mx-auto mt-10 w-full max-w-3xl"
          role="search"
        >
          <div className="flex flex-col gap-2 rounded-3xl bg-white/95 p-3 shadow-float backdrop-blur-md border border-white/20 sm:flex-row sm:items-center sm:rounded-full">
            {/* Location Autocomplete Field */}
            <div className="relative flex-1">
              <label htmlFor="hero-location" className="sr-only">
                Location
              </label>
              <div className="flex items-center gap-3 rounded-2xl px-4 py-3 sm:rounded-full">
                <MapPinIcon className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                <input
                  id="hero-location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => window.setTimeout(() => setFocused(false), 140)}
                  placeholder="City, district or neighbourhood"
                  autoComplete="off"
                  className="w-full bg-transparent text-sm sm:text-base font-medium text-navy-900 placeholder:text-navy-800/40 focus:outline-none"
                />
              </div>

              {/* Suggestions Dropdown Popover */}
              {focused && suggestions.length > 0 && (
                <ul className="absolute left-0 top-full z-30 mt-2.5 w-full overflow-hidden rounded-2xl bg-white py-2 text-left shadow-float border border-navy-100/90">
                  {suggestions.map((city) => (
                    <li key={city}>
                      <button
                        type="button"
                        onClick={() => setLocation(city)}
                        className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
                      >
                        <MapPinIcon className="h-4 w-4 text-navy-400" aria-hidden="true" />
                        {city}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Vertical Separator */}
            <div className="hidden h-8 w-px bg-navy-100 sm:block" />

            {/* Property Type Field */}
            <div className="relative sm:w-56">
              <label htmlFor="hero-type" className="sr-only">
                Property type
              </label>
              <select
                id="hero-type"
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full appearance-none rounded-2xl bg-transparent px-4 py-3 pr-10 text-sm sm:text-base font-medium text-navy-900 focus:outline-none sm:rounded-full cursor-pointer"
              >
                <option value="">Any property type</option>
                {propertyTypes.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <ChevronDownIcon
                className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-navy-400"
                aria-hidden="true"
              />
            </div>

            {/* Search Submit Action Button */}
            <button
              type="submit"
              className="flex items-center justify-center gap-2.5 rounded-2xl bg-amber-500 px-8 py-3.5 text-sm font-bold text-navy-950 transition-all duration-200 hover:bg-amber-400 hover:shadow-[0_8px_24px_-6px_rgba(244,163,0,0.6)] active:scale-[0.99] sm:rounded-full shrink-0"
            >
              <SearchIcon className="h-4 w-4" aria-hidden="true" />
              <span>Search</span>
            </button>
          </div>
        </motion.form>
      </div>
    </section>
  );
}