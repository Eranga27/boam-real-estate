'use client';

import React, { useState } from 'react';
import { Search, MapPin, Home } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/lib/utils';

export function SearchBar({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'sell'>('buy');

  return (
    <div className={cn('w-full max-w-4xl mx-auto rounded-2xl bg-white/95 backdrop-blur shadow-float border border-navy-100/90 p-4 md:p-6', className)}>
      <div className="flex items-center gap-2 mb-4 md:mb-6 overflow-x-auto pb-1">
        {(['buy', 'rent', 'sell'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-6 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-200 whitespace-nowrap',
              activeTab === tab 
                ? 'bg-navy-900 text-white shadow-sm' 
                : 'bg-navy-50/70 text-navy-800/70 hover:bg-navy-100 hover:text-navy-900'
            )}
          >
            For {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Input 
            icon={<MapPin className="w-5 h-5 text-amber-500" />} 
            placeholder="City, Neighborhood, or District"
            className="h-12 md:h-14 text-sm font-medium bg-white"
          />
        </div>
        <div className="flex-1 relative">
          <Input 
            icon={<Home className="w-5 h-5 text-amber-500" />} 
            placeholder="Property Type (House, Land, Villa)"
            className="h-12 md:h-14 text-sm font-medium bg-white"
          />
        </div>
        <Button variant="accent" size="lg" className="h-12 md:h-14 px-8 shrink-0">
          <Search className="w-5 h-5 mr-2" />
          Search Properties
        </Button>
      </div>
    </div>
  );
}

