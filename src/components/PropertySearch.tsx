'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, MapPin, Bed, Bath, Square, Grid, List as ListIcon, Filter, ChevronLeft, ChevronRight, SlidersHorizontal } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, getImageUrl } from '@/lib/format';

interface PropertySearchProps {
  initialType: 'Sale' | 'Rent' | '';
  title: string;
  subtitle: string;
}

export default function PropertySearch({ initialType, title, subtitle }: PropertySearchProps) {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Filters
  const [filters, setFilters] = useState({
    saleOrRent: initialType,
    propertyType: '',
    district: '',
    city: '',
    minPrice: '',
    maxPrice: '',
    bedrooms: '',
    bathrooms: '',
    sort: 'newest'
  });

  const [showFilters, setShowFilters] = useState(false);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams();
      queryParams.append('page', page.toString());
      queryParams.append('limit', '12');
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value.toString());
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/properties?${queryParams.toString()}`);
      const data = await res.json();
      
      if (data.success) {
        setProperties(data.data);
        setTotalPages(data.totalPages || 1);
        setTotalCount(data.total || 0);
      }
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters.sort, initialType]); // Re-fetch on page or sort change

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPage(1);
    fetchProperties();
    setShowFilters(false);
  };

  const clearFilters = () => {
    setFilters({
      saleOrRent: initialType,
      propertyType: '',
      district: '',
      city: '',
      minPrice: '',
      maxPrice: '',
      bedrooms: '',
      bathrooms: '',
      sort: 'newest'
    });
    setPage(1);
    setTimeout(fetchProperties, 0);
  };

  return (
    <main className="min-h-screen bg-light-gray py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                name="city" 
                value={filters.city} 
                onChange={handleFilterChange} 
                placeholder="Search by city..." 
                className="pl-10 w-full"
              />
            </div>
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input 
                name="district" 
                value={filters.district} 
                onChange={handleFilterChange} 
                placeholder="Search by district/state..." 
                className="pl-10 w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={applyFilters} className="flex-1 md:flex-none">Search</Button>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="md:flex-none">
                <SlidersHorizontal className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Advanced Filters */}
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6 mt-4 border-t border-gray-100 overflow-hidden"
            >
              {!initialType && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Purpose</label>
                  <select name="saleOrRent" value={filters.saleOrRent} onChange={handleFilterChange} className="w-full h-10 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-primary">
                    <option value="">Any</option>
                    <option value="Sale">Buy</option>
                    <option value="Rent">Rent</option>
                  </select>
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Property Type</label>
                <select name="propertyType" value={filters.propertyType} onChange={handleFilterChange} className="w-full h-10 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Any</option>
                  <option value="House">House</option>
                  <option value="Apartment">Apartment</option>
                  <option value="Condo">Condo</option>
                  <option value="Land">Land</option>
                  <option value="Commercial">Commercial</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Min Price</label>
                <Input name="minPrice" type="number" value={filters.minPrice} onChange={handleFilterChange} placeholder="Any" className="h-10" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Max Price</label>
                <Input name="maxPrice" type="number" value={filters.maxPrice} onChange={handleFilterChange} placeholder="Any" className="h-10" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Bedrooms</label>
                <select name="bedrooms" value={filters.bedrooms} onChange={handleFilterChange} className="w-full h-10 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                  <option value="4">4+</option>
                  <option value="5">5+</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Bathrooms</label>
                <select name="bathrooms" value={filters.bathrooms} onChange={handleFilterChange} className="w-full h-10 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-primary">
                  <option value="">Any</option>
                  <option value="1">1+</option>
                  <option value="2">2+</option>
                  <option value="3">3+</option>
                </select>
              </div>
              <div className="md:col-span-2 flex items-end justify-end gap-2">
                <Button variant="ghost" onClick={clearFilters}>Clear Filters</Button>
                <Button onClick={applyFilters}>Apply Filters</Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
          <div className="text-gray-600 font-medium">
            Showing {properties.length} of {totalCount} properties
          </div>
          <div className="flex items-center gap-4">
            <div className="flex bg-white rounded-lg border border-gray-200 p-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-primary/10 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <ListIcon className="w-5 h-5" />
              </button>
            </div>
            <select name="sort" value={filters.sort} onChange={handleFilterChange} className="h-10 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:ring-2 focus:ring-primary bg-white">
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Properties Grid/List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No properties found</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Try adjusting your filters or search criteria to find what you're looking for.</p>
            <Button onClick={clearFilters} variant="outline">Clear All Filters</Button>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {properties.map((property, idx) => (
              <motion.div 
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 group ${viewMode === 'list' ? 'flex flex-col sm:flex-row' : 'flex flex-col'}`}
              >
                <div className={`relative ${viewMode === 'list' ? 'w-full sm:w-2/5 aspect-[4/3] sm:aspect-auto sm:h-full' : 'aspect-[4/3] w-full'} bg-gray-100 overflow-hidden`}>
                  {property.images && property.images.length > 0 ? (
                    <img src={getImageUrl(property.images[0])} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 bg-gray-100">No Image</div>
                  )}
                  <div className="absolute top-4 left-4 flex gap-2">
                    <Badge variant={property.saleOrRent === 'Sale' ? 'accent' : 'secondary'} className="shadow-sm">
                      For {property.saleOrRent}
                    </Badge>
                  </div>
                  <div className="absolute bottom-4 left-4">
                    <div className="text-xl font-bold text-white drop-shadow-md">
                      {formatPrice(property.price, property.saleOrRent === 'Rent' ? 'rent' : 'sale')}
                    </div>
                  </div>
                </div>
                
                <div className={`p-6 flex flex-col flex-1`}>
                  <div className="text-sm text-primary font-medium mb-1">{property.propertyType}</div>
                  <Link href={`/properties/${property.id}`} className="block">
                    <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">{property.title}</h3>
                  </Link>
                  <p className="text-gray-500 text-sm flex items-center mb-4 line-clamp-1">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    {property.city}, {property.district}
                  </p>
                  
                  <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between text-gray-600 text-sm">
                    {property.bedrooms && (
                      <div className="flex items-center gap-1">
                        <Bed className="w-4 h-4" /> <span>{property.bedrooms} Beds</span>
                      </div>
                    )}
                    {property.bathrooms && (
                      <div className="flex items-center gap-1">
                        <Bath className="w-4 h-4" /> <span>{property.bathrooms} Baths</span>
                      </div>
                    )}
                    {property.houseSize && (
                      <div className="flex items-center gap-1">
                        <Square className="w-4 h-4" /> <span>{property.houseSize} sqft</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-12">
            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-10 h-10 p-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            
            <div className="flex gap-2">
              {Array.from({ length: totalPages }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPage(i + 1)}
                  className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                    page === i + 1 ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            <Button 
              variant="outline" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-10 h-10 p-0"
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
