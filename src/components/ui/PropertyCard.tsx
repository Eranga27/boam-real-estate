import React from 'react';
import { MapPin, Bed, Bath, Square, Heart } from 'lucide-react';
import { Card, CardContent } from './Card';
import { Badge } from './Badge';

export interface PropertyCardProps {
  image: string;
  price: string;
  title: string;
  address: string;
  beds: number;
  baths: number;
  sqft: number;
  type: 'sale' | 'rent';
  isFeatured?: boolean;
}

export function PropertyCard({
  image,
  price,
  title,
  address,
  beds,
  baths,
  sqft,
  type,
  isFeatured,
}: PropertyCardProps) {
  return (
    <Card className="group cursor-pointer rounded-2xl border border-navy-100/80 shadow-card hover:shadow-lift hover:border-navy-200/90 transition-all duration-300">
      <div className="relative aspect-[4/3] overflow-hidden bg-navy-100/50">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-700 ease-out group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/70 via-transparent to-transparent pointer-events-none" />
        
        <div className="absolute top-3.5 left-3.5 flex gap-2">
          <Badge variant={type === 'sale' ? 'sale' : 'rent'}>
            For {type === 'sale' ? 'Sale' : 'Rent'}
          </Badge>
          {isFeatured && (
            <Badge variant="featured">
              Featured
            </Badge>
          )}
        </div>

        <button className="absolute top-3.5 right-3.5 p-2 rounded-full bg-white/90 backdrop-blur text-navy-700 hover:text-red-500 transition-colors shadow-sm">
          <Heart className="w-4 h-4" />
        </button>

        <div className="absolute bottom-3.5 left-4">
          <h3 className="text-xl font-extrabold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">{price}</h3>
        </div>
      </div>

      <CardContent className="p-5 flex flex-col justify-between gap-3">
        <div>
          <div className="flex items-center text-navy-800/60 text-xs font-semibold mb-1.5">
            <MapPin className="w-3.5 h-3.5 mr-1 flex-shrink-0 text-amber-500" />
            <span className="line-clamp-1">{address}</span>
          </div>
          <p className="font-bold text-navy-900 line-clamp-1 group-hover:text-navy-700 transition-colors text-base">{title}</p>
        </div>

        <div className="flex items-center justify-between border-t border-navy-100/70 pt-3.5 text-navy-800/70 text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <Bed className="w-4 h-4 text-navy-300" />
            <span>{beds} Beds</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bath className="w-4 h-4 text-navy-300" />
            <span>{baths} Baths</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Square className="w-4 h-4 text-navy-300" />
            <span>{sqft} sqft</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

