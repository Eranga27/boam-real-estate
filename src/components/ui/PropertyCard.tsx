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
    <Card className="group cursor-pointer">
      <div className="relative aspect-[4/3] overflow-hidden">
        <img
          src={image}
          alt={title}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <Badge variant={type === 'sale' ? 'primary' : 'secondary'} className="bg-white/90 backdrop-blur shadow-sm">
            For {type === 'sale' ? 'Sale' : 'Rent'}
          </Badge>
          {isFeatured && (
            <Badge variant="accent" className="bg-accent text-white shadow-sm">
              Featured
            </Badge>
          )}
        </div>
        <button className="absolute top-4 right-4 p-2 rounded-full bg-white/50 backdrop-blur hover:bg-white text-gray-600 hover:text-red-500 transition-colors">
          <Heart className="w-5 h-5" />
        </button>
      </div>
      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="text-2xl font-bold text-primary mb-1">{price}</h3>
          <p className="font-semibold text-gray-900 line-clamp-1">{title}</p>
        </div>
        
        <div className="flex items-center text-gray-500 text-sm mb-4">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{address}</span>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 pt-4 text-gray-600 text-sm">
          <div className="flex items-center gap-1">
            <Bed className="w-4 h-4" />
            <span>{beds} Beds</span>
          </div>
          <div className="flex items-center gap-1">
            <Bath className="w-4 h-4" />
            <span>{baths} Baths</span>
          </div>
          <div className="flex items-center gap-1">
            <Square className="w-4 h-4" />
            <span>{sqft} sqft</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
