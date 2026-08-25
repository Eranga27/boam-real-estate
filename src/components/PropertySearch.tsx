'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, MapPin, Bed, Bath, Square, Grid, List as ListIcon, SlidersHorizontal, ChevronLeft, ChevronRight, LandPlot } from 'lucide-react';
import { formatPrice, getImageUrl } from '@/lib/format';
import { properties as staticProperties } from '@/data/properties';

interface PropertySearchProps {
  initialType: 'Sale' | 'Rent' | '';
  initialLocation?: string;
  initialPropertyType?: string;
  title: string;
  subtitle: string;
}

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

  // Sync if URL params change after mount (e.g. navigating from hero search)
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      city: initialLocation || prev.city,
      propertyType: initialPropertyType || prev.propertyType,
    }));
  }, [initialLocation, initialPropertyType]);

  const filtered = useMemo(() => {
    let list = [...STATIC_LISTINGS];
    if (filters.saleOrRent) list = list.filter((p) => p.saleOrRent === filters.saleOrRent);
    if (filters.propertyType) list = list.filter((p) => p.propertyType === filters.propertyType);
    if (filters.city) list = list.filter((p) => p.city.toLowerCase().includes(filters.city.toLowerCase()));
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

  const selectBase = 'w-full h-10 rounded-xl border border-navy-200 bg-white px-3 text-sm text-navy-900 outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-colors';

  return (
    <main className="min-h-screen bg-navy-50/50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Page Header */}
        <div className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-amber-600">Browse Listings</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl lg:text-5xl">{title}</h1>
          <p className="mt-2.5 text-base leading-relaxed text-navy-800/70 max-w-2xl">{subtitle}</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-navy-100/80 p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 w-4 h-4" aria-hidden="true" />
              <Input
                name="city"
                value={filters.city}
                onChange={handleFilterChange}
                placeholder="Search by city…"
                className="pl-9 w-full border-navy-200 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-navy-400 w-4 h-4" aria-hidden="true" />
              <Input
                name="district"
                value={filters.district}
                onChange={handleFilterChange}
                placeholder="Search by district…"
                className="pl-9 w-full border-navy-200 focus:ring-amber-500/40 focus:border-amber-500"
              />
            </div>
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              aria-expanded={showFilters}
              aria-label="Toggle advanced filters"
              className={`flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition-colors ${showFilters ? 'border-navy-900 bg-navy-900 text-white' : 'border-navy-200 bg-white text-navy-800 hover:border-navy-400'}`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-5 mt-4 border-t border-navy-100">
                {!initialType && (
                  <div>
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-800/70 mb-1.5">Purpose</label>
                    <select name="saleOrRent" value={filters.saleOrRent} onChange={handleFilterChange} className={selectBase}>
                      <option value="">Any</option>
                      <option value="Sale">Buy</option>
                      <option value="Rent">Rent</option>
                    </select>
                  </div>
                )}
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-800/70 mb-1.5">Property Type</label>
                  <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange} className={selectBase}>
                    <option value="">Any Type</option>
                    <option value="House">House</option>
                    <option value="Land">Land</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Condo">Condo</option>
                    <option value="Commercial">Commercial</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-800/70 mb-1.5">Min Price (LKR)</label>
                  <Input name="minPrice" type="number" value={filters.minPrice} onChange={handleFilterChange} placeholder="Any" className="h-10 border-navy-200 focus:ring-amber-500/40" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-800/70 mb-1.5">Max Price (LKR)</label>
                  <Input name="maxPrice" type="number" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Any" className="h-10 border-navy-200 focus:ring-amber-500/40" />
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-navy-800/70 mb-1.5">Min Bedrooms</label>
                  <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className={selectBase}>
                    <option value="">Any</option>
                    <option value="1">1+</option>
                    <option value="2">2+</option>
                    <option value="3">3+</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div className="sm:col-span-2 md:col-span-3 flex items-end justify-end">
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-navy-800/60 hover:text-navy-950 transition-colors px-4 py-2 rounded-xl hover:bg-navy-50"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <p className="text-sm font-semibold text-navy-800/70">
            Showing <span className="text-navy-950 font-bold">{paged.length}</span> of <span className="text-navy-950 font-bold">{filtered.length}</span> listings
          </p>
          <div className="flex items-center gap-3">
            {/* View Mode */}
            <div className="flex bg-white rounded-xl border border-navy-200 p-1">
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
              className="h-10 rounded-xl border border-navy-200 px-3 text-sm text-navy-900 outline-none focus:ring-2 focus:ring-amber-500/40 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Properties Grid/List */}
        {paged.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-navy-100/80">
            <div className="w-20 h-20 bg-navy-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-navy-300" aria-hidden="true" />
            </div>
            <h3 className="text-2xl font-extrabold text-navy-950 mb-2">No properties found</h3>
            <p className="text-navy-800/60 max-w-md mx-auto mb-6 text-sm leading-relaxed">Try adjusting your filters or search criteria.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="inline-flex items-center gap-2 rounded-full border border-navy-200 px-6 py-2.5 text-sm font-bold text-navy-800 transition-all hover:border-navy-900 hover:bg-navy-900 hover:text-white"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className={`grid gap-5 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {paged.map((property, idx) => (
              <motion.div
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.4 }}
                className={`group bg-white rounded-3xl overflow-hidden shadow-card ring-1 ring-navy-100 transition-shadow hover:shadow-lift ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}
              >
                {/* Image / Video */}
                <div className={`relative overflow-hidden bg-navy-100 ${viewMode === 'list' ? 'aspect-[4/3] sm:aspect-auto sm:w-[260px] sm:shrink-0' : 'aspect-[4/3]'}`}>
                  {property.video ? (
                    <video src={getImageUrl(property.video)} autoPlay loop muted playsInline className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : property.images && property.images.length > 0 ? (
                    <img src={getImageUrl(property.images[0])} alt={property.title} loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-navy-400 text-xs font-medium">No Preview</div>
                  )}
                  {/* Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/5 to-transparent pointer-events-none" />
                  {/* Badge */}
                  <div className="absolute top-3 left-3">
                    <span className={`rounded-full px-3 py-1 text-[11px] font-bold uppercase tracking-wider shadow-sm ${property.saleOrRent === 'Sale' ? 'bg-amber-500 text-navy-900' : 'bg-sea-500 text-white'}`}>
                      For {property.saleOrRent}
                    </span>
                  </div>
                  {/* Price */}
                  <p className="absolute bottom-3 left-4 text-lg font-extrabold tracking-tight text-white drop-shadow">
                    {formatPrice(property.price, property.saleOrRent === 'Rent' ? 'rent' : 'sale')}
                  </p>
                </div>

                {/* Content */}
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-sea-600">{property.propertyType}</p>
                    <h3 className="mt-1.5 text-[17px] font-bold leading-snug text-navy-800">
                      <Link href={`/properties/${property.id}`} className="transition-colors hover:text-navy-600">
                        {property.title}
                      </Link>
                    </h3>
                    <p className="mt-1.5 flex items-center gap-1.5 text-sm text-navy-800/55">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-amber-500" aria-hidden="true" />
                      {property.district}, {property.city}
                    </p>
                  </div>

                  <div className="mt-auto space-y-3">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-navy-100 pt-3">
                      {property.bedrooms > 0 && (
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-navy-800">
                          <Bed className="h-4 w-4 text-navy-300" aria-hidden="true" />
                          {property.bedrooms} <span className="font-medium text-navy-800/50">beds</span>
                        </div>
                      )}
                      {property.bathrooms > 0 && (
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-navy-800">
                          <Bath className="h-4 w-4 text-navy-300" aria-hidden="true" />
                          {property.bathrooms} <span className="font-medium text-navy-800/50">baths</span>
                        </div>
                      )}
                      {property.landSize > 0 && (
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-navy-800">
                          <LandPlot className="h-4 w-4 text-navy-300" aria-hidden="true" />
                          {property.landSize} <span className="font-medium text-navy-800/50">{['ratnapura-land', 'kalutara-estate-land'].includes(property.id) ? 'acres' : 'perches'}</span>
                        </div>
                      )}
                      {property.houseSize > 0 && (
                        <div className="flex items-center gap-1.5 text-[13px] font-semibold text-navy-800">
                          <Square className="h-4 w-4 text-navy-300" aria-hidden="true" />
                          {property.houseSize.toLocaleString()} <span className="font-medium text-navy-800/50">sq ft</span>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-end">
                      <Link
                        href={`/properties/${property.id}`}
                        className="rounded-full border border-navy-200 px-4 py-2 text-xs font-bold uppercase tracking-wide text-navy-800 transition-all hover:border-navy-800 hover:bg-navy-800 hover:text-white"
                      >
                        Inquire
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
          <div className="flex justify-center items-center gap-2 mt-12" role="navigation" aria-label="Pagination">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              aria-label="Previous page"
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-navy-200 bg-white text-navy-800 transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
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
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-colors ${page === i + 1 ? 'bg-navy-950 text-white' : 'bg-white text-navy-700 hover:bg-navy-50 border border-navy-200'}`}
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
              className="w-10 h-10 flex items-center justify-center rounded-xl border border-navy-200 bg-white text-navy-800 transition-colors hover:border-navy-900 hover:bg-navy-900 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
