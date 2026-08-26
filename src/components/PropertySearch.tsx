'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '@/components/ui/Input';
import {
  Search, MapPin, Bed, Bath, Square, Grid, List as ListIcon, SlidersHorizontal,
  ChevronLeft, ChevronRight, LandPlot, ImageOff, RotateCcw
} from 'lucide-react';
import { formatPrice, getImageUrl } from '@/lib/format';
import { properties as staticProperties } from '@/data/properties';

interface PropertySearchProps {
  initialType: 'Sale' | 'Rent' | '';
  initialLocation?: string;
  initialPropertyType?: string;
  title: string;
  subtitle: string;
}

const CITIES = ['Colombo', 'Kandy', 'Galle', 'Negombo', 'Jaffna', 'Nugegoda', 'Mount Lavinia', 'Matara'];

function toApiShape(p: typeof staticProperties[0]): any {
  return {
    id: p.id,
    title: p.title,
    propertyType: p.type,
    saleOrRent: p.listingType === 'sale' ? 'Sale' : 'Rent',
    price: p.price,
    city: p.city,
    district: p.district,
    bedrooms: p.beds || null,
    bathrooms: p.baths || null,
    houseSize: p.houseSize || null,
    landSize: p.landSize || null,
    images: p.images,
    video: p.video,
    negotiable: p.negotiable,
    featured: p.featured,
  };
}

const STATIC_LISTINGS = staticProperties.map(toApiShape);
const PAGE_SIZE = 12;

export default function PropertySearch({
  initialType,
  initialLocation = '',
  initialPropertyType = '',
  title,
  subtitle,
}: PropertySearchProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [focusedLocation, setFocusedLocation] = useState(false);

  const [filters, setFilters] = useState({
    saleOrRent: initialType,
    propertyType: initialPropertyType,
    city: initialLocation,
    district: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    sort: 'newest',
  });

  // Sync when URL parameters change (e.g. from Hero search)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      city: initialLocation || prev.city,
      propertyType: initialPropertyType || prev.propertyType,
    }));
  }, [initialLocation, initialPropertyType]);

  const locationSuggestions = useMemo(() => {
    if (!filters.city.trim()) return CITIES;
    return CITIES.filter((c) => c.toLowerCase().includes(filters.city.trim().toLowerCase()));
  }, [filters.city]);

  const filtered = useMemo(() => {
    let list = [...STATIC_LISTINGS];
    if (filters.saleOrRent) list = list.filter((p) => p.saleOrRent === filters.saleOrRent);
    if (filters.propertyType) list = list.filter((p) => p.propertyType.toLowerCase() === filters.propertyType.toLowerCase());
    if (filters.city) list = list.filter((p) => p.city.toLowerCase().includes(filters.city.trim().toLowerCase()) || p.district.toLowerCase().includes(filters.city.trim().toLowerCase()));
    if (filters.district) list = list.filter((p) => p.district.toLowerCase().includes(filters.district.toLowerCase()));
    if (filters.minPrice) list = list.filter((p) => p.price >= Number(filters.minPrice));
    if (filters.maxPrice) list = list.filter((p) => p.price <= Number(filters.maxPrice));
    if (filters.bedrooms) list = list.filter((p) => p.bedrooms && p.bedrooms >= Number(filters.bedrooms));

    if (filters.sort === 'price_asc') list.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price_desc') list.sort((a, b) => b.price - a.price);

    return list;
  }, [filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({ saleOrRent: initialType, propertyType: '', city: '', district: '', minPrice: '', maxPrice: '', bedrooms: '', sort: 'newest' });
  };

  // Natural result count message
  const resultMessage = useMemo(() => {
    const total = filtered.length;
    const activeLoc = filters.city.trim();
    if (total === 0) {
      return activeLoc ? `No properties found in "${activeLoc}"` : 'No properties match your filters';
    }
    if (activeLoc) {
      return `${total} ${total === 1 ? 'property' : 'properties'} found in ${activeLoc}`;
    }
    if (filters.propertyType) {
      return `${total} ${total === 1 ? 'property' : 'properties'} found for ${filters.propertyType}s`;
    }
    return `${total} ${total === 1 ? 'property' : 'properties'} available`;
  }, [filtered.length, filters.city, filters.propertyType]);

  const selectBase = 'w-full h-10 rounded-xl border border-navy-200 bg-white px-3 text-xs sm:text-sm text-navy-900 outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors';

  return (
    <main className="min-h-screen bg-navy-50/50 pt-20 sm:pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header — Compact on Mobile */}
        <div className="mb-6 sm:mb-8">
          <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.2em] text-amber-600">Property Discovery</p>
          <h1 className="mt-1 text-2xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-navy-950">{title}</h1>
          <p className="mt-1.5 text-sm sm:text-base leading-relaxed text-navy-800/70 max-w-2xl">{subtitle}</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-navy-100/80 p-3 sm:p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-2.5 sm:gap-3">
            {/* Location Autocomplete */}
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" aria-hidden="true" />
              <Input
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                onFocus={() => setFocusedLocation(true)}
                onBlur={() => setTimeout(() => setFocusedLocation(false), 200)}
                placeholder="City or district (e.g. Colombo, Kandy)..."
                autoComplete="off"
                className="pl-9 w-full border-navy-200 text-sm focus:ring-amber-500/40 focus:border-amber-500"
              />
              {/* Dropdown Suggestions */}
              {focusedLocation && locationSuggestions.length > 0 && (
                <ul className="absolute left-0 top-full z-30 mt-1.5 w-full max-h-48 overflow-y-auto rounded-xl bg-white py-1 shadow-xl border border-navy-100">
                  {locationSuggestions.map((city) => (
                    <li key={city}>
                      <button
                        type="button"
                        onMouseDown={() => {
                          setFilters((prev) => ({ ...prev, city }));
                          setFocusedLocation(false);
                        }}
                        className="flex w-full items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-semibold text-navy-800 hover:bg-navy-50 text-left transition-colors"
                      >
                        <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" aria-hidden="true" />
                        <span>{city}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Quick Type Filter & Filter Toggle */}
            <div className="flex gap-2">
              <select
                name="propertyType"
                value={filters.propertyType}
                onChange={handleFilterChange}
                aria-label="Filter by property type"
                className="flex-1 sm:w-44 h-10 rounded-xl border border-navy-200 bg-white px-3 text-xs sm:text-sm text-navy-900 outline-none focus:ring-2 focus:ring-amber-500/40"
              >
                <option value="">All Types</option>
                <option value="House">House</option>
                <option value="Land">Land</option>
                <option value="Apartment">Apartment</option>
                <option value="Commercial">Commercial</option>
              </select>

              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                aria-expanded={showFilters}
                aria-label="Toggle extra filters"
                className={`flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs sm:text-sm font-bold transition-colors shrink-0 ${
                  showFilters ? 'border-navy-950 bg-navy-950 text-white' : 'border-navy-200 bg-white text-navy-800 hover:border-navy-400'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" aria-hidden="true" />
                <span>Filters</span>
              </button>
            </div>
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 mt-3 border-t border-navy-100">
                  {!initialType && (
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-800/70 mb-1">Purpose</label>
                      <select name="saleOrRent" value={filters.saleOrRent} onChange={handleFilterChange} className={selectBase}>
                        <option value="">Any</option>
                        <option value="Sale">Buy</option>
                        <option value="Rent">Rent</option>
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-800/70 mb-1">Min Price</label>
                    <Input name="minPrice" type="number" value={filters.minPrice} onChange={handleFilterChange} placeholder="Min LKR" className="h-10 text-xs border-navy-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-800/70 mb-1">Max Price</label>
                    <Input name="maxPrice" type="number" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Max LKR" className="h-10 text-xs border-navy-200" />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-navy-800/70 mb-1">Min Beds</label>
                    <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className={selectBase}>
                      <option value="">Any</option>
                      <option value="1">1+ bed</option>
                      <option value="2">2+ beds</option>
                      <option value="3">3+ beds</option>
                      <option value="4">4+ beds</option>
                    </select>
                  </div>
                  <div className="col-span-2 sm:col-span-4 flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Results Header */}
        <div className="flex flex-row justify-between items-center mb-5 gap-2">
          <p className="text-xs sm:text-sm font-semibold text-navy-800/80">
            {resultMessage}
          </p>
          <div className="flex items-center gap-2">
            {/* View Mode */}
            <div className="flex bg-white rounded-xl border border-navy-200 p-0.5 shadow-sm">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                aria-pressed={viewMode === 'grid'}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-navy-950 text-white' : 'text-navy-400 hover:text-navy-700'}`}
              >
                <Grid className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                aria-pressed={viewMode === 'list'}
                className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-navy-950 text-white' : 'text-navy-400 hover:text-navy-700'}`}
              >
                <ListIcon className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
            {/* Sort */}
            <select
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              aria-label="Sort order"
              className="h-9 rounded-xl border border-navy-200 px-2.5 text-xs sm:text-sm text-navy-900 outline-none focus:ring-2 focus:ring-amber-500/40 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Properties Grid/List */}
        {paged.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 sm:p-14 text-center shadow-sm border border-navy-100">
            <div className="w-16 h-16 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-navy-300" aria-hidden="true" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-navy-950 mb-1.5">No properties found</h3>
            <p className="text-navy-800/60 max-w-sm mx-auto mb-6 text-xs sm:text-sm leading-relaxed">
              Try adjusting your search criteria or explore our entire portfolio.
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-xs sm:text-sm font-bold text-navy-950 transition-all hover:bg-amber-400 shadow-sm"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              Browse All Properties
            </button>
          </div>
        ) : (
          <div className={`grid gap-4 sm:gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {paged.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03, duration: 0.35 }}
                className={`group bg-white rounded-3xl overflow-hidden shadow-card ring-1 ring-navy-100/90 transition-shadow hover:shadow-lift ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}
              >
                {/* Image Container */}
                <div className={`relative overflow-hidden bg-navy-900 ${viewMode === 'list' ? 'aspect-[16/10] sm:aspect-auto sm:w-[260px] sm:shrink-0' : 'aspect-[16/10] sm:aspect-[4/3]'}`}>
                  <Link href={`/properties/${property.id}`}>
                    {property.video ? (
                      <video src={getImageUrl(property.video)} autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : property.images && property.images.length > 0 ? (
                      <img src={getImageUrl(property.images[0])} alt={property.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    ) : (
                      /* BOAM Refined Empty Visual State */
                      <div className="h-full w-full flex flex-col items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-4 text-center">
                        <div className="w-10 h-10 rounded-full bg-navy-800/80 flex items-center justify-center mb-2 border border-navy-700/50">
                          <ImageOff className="w-5 h-5 text-amber-400/80" aria-hidden="true" />
                        </div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-white/70">Image Unavailable</span>
                        <span className="text-[10px] text-white/40 mt-0.5">Contact broker for details</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/10 to-transparent pointer-events-none" />
                  </Link>

                  {/* Badge */}
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider shadow-sm ${property.saleOrRent === 'Sale' ? 'bg-amber-500 text-navy-950' : 'bg-sea-400 text-navy-950'}`}>
                      For {property.saleOrRent}
                    </span>
                  </div>

                  {/* Price */}
                  <p className="absolute bottom-2.5 left-3.5 text-base sm:text-lg font-extrabold tracking-tight text-white drop-shadow">
                    {formatPrice(property.price, property.saleOrRent === 'Rent' ? 'rent' : 'sale')}
                  </p>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col justify-between p-4 sm:p-5">
                  <div>
                    <p className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-[0.14em] text-amber-600">{property.propertyType}</p>
                    <h3 className="mt-1 text-base sm:text-[17px] font-bold leading-snug text-navy-950 line-clamp-1">
                      <Link href={`/properties/${property.id}`} className="transition-colors hover:text-amber-600">
                        {property.title}
                      </Link>
                    </h3>
                    <p className="mt-1 flex items-center gap-1.5 text-xs sm:text-sm text-navy-800/65 line-clamp-1">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                      {property.district}, {property.city}
                    </p>
                  </div>

                  <div className="mt-3 space-y-2.5">
                    <div className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 border-t border-navy-100/80 pt-2.5">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-navy-800">
                          <Bed className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                          {property.bedrooms} <span className="font-normal text-navy-800/60">beds</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-navy-800">
                          <Bath className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                          {property.bathrooms} <span className="font-normal text-navy-800/60">baths</span>
                        </div>
                      )}
                      {property.landSize > 0 && (
                        <div className="flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-navy-800">
                          <LandPlot className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                          {property.landSize} <span className="font-normal text-navy-800/60">{property.landUnit || 'perches'}</span>
                        </div>
                      )}
                      {property.houseSize > 0 && (
                        <div className="flex items-center gap-1 text-[12px] sm:text-[13px] font-semibold text-navy-800">
                          <Square className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
                          {property.houseSize.toLocaleString()} <span className="font-normal text-navy-800/60">sq ft</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-end pt-0.5">
                      <Link
                        href={`/properties/${property.id}`}
                        className="rounded-full bg-amber-500 px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-navy-950 transition-all hover:bg-amber-400 active:scale-[0.99]"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-10" role="navigation" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-navy-200 bg-white text-navy-800 transition-colors hover:bg-navy-950 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <div className="flex gap-1.5">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPage(i + 1)}
                  aria-label={`Page ${i + 1}`}
                  aria-current={page === i + 1 ? 'page' : undefined}
                  className={`w-10 h-10 rounded-xl text-xs sm:text-sm font-bold transition-colors ${page === i + 1 ? 'bg-navy-950 text-white' : 'bg-white text-navy-700 hover:bg-navy-50 border border-navy-200'}`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              aria-label="Next page"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-navy-200 bg-white text-navy-800 transition-colors hover:bg-navy-950 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
