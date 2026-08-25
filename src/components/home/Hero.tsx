'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter as useNavigate } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronDownIcon, MapPinIcon, SearchIcon } from 'lucide-react';
import { heroImage } from '@/data/locations';
import { propertyTypes } from '@/data/properties';

const CITIES = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Nugegoda', 'Mount Lavinia', 'Matara'];

/** Exactly 4 premium property/location hero images */
const HERO_SLIDES = [
  heroImage,
  '/uploads/upkotmaskeliya1.jpeg',
  '/uploads/kandy1.jpeg',
  '/uploads/kaluthara1.jpeg',
];

export function Hero() {
  const navigate = useNavigate();
  const [location, setLocation] = useState('');
  const [type, setType] = useState('');
  const [focused, setFocused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState<string[]>([heroImage]);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }
      setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 3500);
  }, []);

  const goToSlide = (idx: number) => {
    setCurrentIndex(idx);
    startTimer();
  };

  useEffect(() => {
    let isMounted = true;
    const preloadTimeout = setTimeout(() => {
      HERO_SLIDES.slice(1).forEach((src) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
          if (isMounted) {
            setLoadedImages((prev) => (prev.includes(src) ? prev : [...prev, src]));
          }
        };
      });
    }, 800);

    startTimer();

    return () => {
      isMounted = false;
      clearTimeout(preloadTimeout);
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  const suggestions = useMemo(() => {
    if (!location.trim()) return CITIES.slice(0, 5);
    return CITIES.filter((c) => c.toLowerCase().includes(location.trim().toLowerCase())).slice(0, 5);
  }, [location]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (location.trim()) params.set('location', location.trim());
    if (type) params.set('type', type);
    navigate.push(`/search${params.toString() ? `?${params.toString()}` : ''}`);
  };

  return (
    <section
      className="relative flex min-h-[100svh] items-center overflow-hidden pt-24 pb-20 lg:py-32"
      style={{
        backgroundColor: '#0E2A49',
        backgroundImage: `url(${heroImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Background Slideshow Layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {HERO_SLIDES.map((imgSrc, idx) => {
          const isVisible = idx === currentIndex;
          const isAvailable = idx === 0 || loadedImages.includes(imgSrc);
          if (!isAvailable) return null;

          return (
            <div
              key={imgSrc}
              className={`absolute inset-0 h-full w-full transition-opacity duration-[950ms] ease-in-out ${
                isVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={imgSrc}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-cover object-center sm:object-[center_35%]"
                {...(idx === 0 ? { fetchPriority: 'high' as any } : { loading: 'lazy' })}
              />
            </div>
          );
        })}
      </div>

      {/* Atmospheric Overlays preserving right-side photography while guaranteeing left text contrast */}
      <div className="absolute inset-0 bg-navy-950/30 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-r from-navy-950/90 via-navy-950/50 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-navy-950/30 pointer-events-none" />

      {/* Left-Aligned Editorial Composition */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl lg:max-w-2xl text-left">
          {/* Minimal BOAM Brand Treatment */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="flex items-center gap-2.5"
          >
            <img
              src="/images/boamcompactmonogram.png"
              alt="BOAM Monogram"
              className="h-6 w-auto brightness-0 invert opacity-90"
            />
            <span className="text-xs font-bold uppercase tracking-[0.25em] text-white/80">
              BOAM Real-Estates
            </span>
          </motion.div>

          {/* Editorial Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl leading-[1.05]"
          >
            Property, with{' '}
            <span className="text-amber-400">
              confidence.
            </span>
          </motion.h1>

          {/* Supporting Copy */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.22, ease: 'easeOut' }}
            className="mt-5 text-base font-normal leading-relaxed text-white/80 sm:text-lg lg:text-xl max-w-lg"
          >
            Explore houses, apartments, villas and prime land opportunities across Sri Lanka.
          </motion.p>

          {/* Left-Aligned Floating Search Panel */}
          <motion.form
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onSubmit={submit}
            className="mt-8 w-full max-w-2xl"
            role="search"
          >
            <div className="flex flex-col gap-2.5 rounded-3xl bg-white/95 p-3 shadow-2xl backdrop-blur-md border border-white/20 sm:flex-row sm:items-center sm:rounded-full sm:p-2 sm:pr-2.5">
              {/* Location Autocomplete Input */}
              <div className="relative flex-1">
                <label htmlFor="hero-location" className="sr-only">
                  Location
                </label>
                <div className="flex items-center gap-3 px-4 py-3 sm:py-2.5">
                  <MapPinIcon className="h-5 w-5 shrink-0 text-amber-500" aria-hidden="true" />
                  <input
                    id="hero-location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => window.setTimeout(() => setFocused(false), 150)}
                    placeholder="City, district or neighbourhood"
                    autoComplete="off"
                    className="w-full bg-transparent text-sm sm:text-base font-medium text-navy-900 placeholder:text-navy-800/40 focus:outline-none"
                  />
                </div>

                {/* Suggestions Popover */}
                {focused && suggestions.length > 0 && (
                  <ul className="absolute left-0 top-full z-30 mt-2.5 w-full overflow-hidden rounded-2xl bg-white py-2 text-left shadow-2xl border border-navy-100">
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
              <div className="hidden h-7 w-px bg-navy-100 sm:block" />

              {/* Property Type Dropdown */}
              <div className="relative sm:w-48">
                <label htmlFor="hero-type" className="sr-only">
                  Property type
                </label>
                <select
                  id="hero-type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full appearance-none rounded-2xl bg-transparent px-4 py-3 pr-10 text-sm sm:text-base font-medium text-navy-900 focus:outline-none sm:py-2.5 cursor-pointer"
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

              {/* Search Submit Button */}
              <button
                type="submit"
                className="flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-7 py-3 text-sm font-bold text-navy-950 transition-all duration-200 hover:bg-amber-400 hover:shadow-[0_8px_24px_-6px_rgba(244,163,0,0.6)] active:scale-[0.99] sm:rounded-full shrink-0"
              >
                <SearchIcon className="h-4 w-4" aria-hidden="true" />
                <span>Search</span>
              </button>
            </div>
          </motion.form>
        </div>
      </div>

      {/* Accessible Minimal Pagination Dots (Exactly 4 Dots) */}
      <div
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1"
        role="tablist"
        aria-label="Hero Image Slideshow Controls"
      >
        {HERO_SLIDES.map((_, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => goToSlide(idx)}
              className="min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer group focus:outline-none"
            >
              <span
                className={`block transition-all duration-300 rounded-full ${
                  isActive
                    ? 'w-7 h-2 bg-amber-500 shadow-md ring-2 ring-amber-400/40'
                    : 'w-2.5 h-2.5 bg-white/45 group-hover:bg-white/80'
                }`}
              />
            </button>
          );
        })}
      </div>
    </section>
  );
}