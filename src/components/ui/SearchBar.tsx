'use client';

import React, { useState } from 'react';
import { Search, MapPin, Home } from 'lucide-react';
import { Button } from './Button';
import { Input } from './Input';
import { cn } from '@/lib/utils';

export function SearchBar({ className }: { className?: string }) {
  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'sell'>('buy');

  return (
    <div className={cn("w-full max-w-4xl mx-auto glass rounded-2xl p-4 md:p-6", className)}>
      <div className="flex items-center gap-2 mb-4 md:mb-6 overflow-x-auto pb-2">
        {(['buy', 'rent', 'sell'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-medium transition-all capitalize whitespace-nowrap",
              activeTab === tab 
                ? "bg-primary text-white shadow-md" 
                : "bg-white/50 text-gray-700 hover:bg-white"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1 relative">
          <Input 
            icon={<MapPin className="w-5 h-5" />} 
            placeholder="City, Neighborhood, or Zip"
            className="h-14 text-base bg-white/80"
          />
        </div>
        <div className="flex-1 relative">
          <Input 
            icon={<Home className="w-5 h-5" />} 
            placeholder="Property Type"
            className="h-14 text-base bg-white/80"
          />
        </div>
        <Button size="lg" className="h-14 px-8 shrink-0">
          <Search className="w-5 h-5 mr-2" />
          Search
        </Button>
      </div>
    </div>
  );
}
