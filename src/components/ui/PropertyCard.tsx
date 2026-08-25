import React from 'react';
import { MapPin, Bed, Bath, Square } from 'lucide-react';
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
    <Card className="group cursor-pointer overflow-hidden rounded-3xl">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant={type === 'sale' ? 'primary' : 'secondary'} className="bg-white/90 backdrop-blur shadow-sm">
            For {type === 'sale' ? 'Sale' : 'Rent'}
          </Badge>
          {isFeatured && (
            <Badge variant="accent" className="bg-amber-500 text-navy-950 font-bold shadow-sm">
              Featured
            </Badge>
          )}
        </div>
      </div>
      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="text-2xl font-bold text-navy-950 mb-1">{price}</h3>
          <p className="font-semibold text-navy-900 line-clamp-1">{title}</p>
        </div>
        
        <div className="flex items-center text-navy-800/60 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-amber-500" />
          <span className="line-clamp-1">{address}</span>
        </div>

        <div className="flex items-center justify-between border-t border-navy-100 pt-4 text-navy-800/70 text-sm">
          <div className="flex items-center gap-1 font-semibold">
            <Bed className="w-4 h-4 text-amber-500" />
            <span>{beds} Beds</span>
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <Bath className="w-4 h-4 text-amber-500" />
            <span>{baths} Baths</span>
          </div>
          <div className="flex items-center gap-1 font-semibold">
            <Square className="w-4 h-4 text-amber-500" />
            <span>{sqft} sqft</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
