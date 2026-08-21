'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, X, Home, Trees, Building2, ChevronRight } from 'lucide-react';
import { formatFullPrice, formatPrice, getImageUrl } from '@/lib/format';

export interface PropertyMapItem {
  id: string;
  title: string;
  propertyType: 'House' | 'Land' | string;
  price: number;
  city: string;
  address?: string;
  images: string[];
  lat: number;
  lng: number;
  description?: string;
}

interface SriLankaMapProps {
  properties: PropertyMapItem[];
  selectedId?: string | null;
  onSelectProperty?: (id: string) => void;
}

export function SriLankaMap({ properties, selectedId, onSelectProperty }: SriLankaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  
  const [activeProperty, setActiveProperty] = useState<PropertyMapItem | null>(null);

  // Synchronize internal active state with external selectedId
  useEffect(() => {
    if (selectedId) {
      const found = properties.find((p) => p.id === selectedId);
      if (found) {
        setActiveProperty(found);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([found.lat, found.lng], 11, { duration: 1.2 });
        }
      }
    }
  }, [selectedId, properties]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    import('leaflet').then((L) => {
      const Leaflet = L.default || L;

      // Fix icon URL default issues
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      // Center map on Sri Lanka
      const map = Leaflet.map(mapContainerRef.current!, {
        center: [7.8731, 80.7718],
        zoom: 8,
        minZoom: 7,
        maxZoom: 15,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // CartoDB Voyager tiles for modern aesthetics
      Leaflet.tileLayer(
        'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: 'abcd',
          maxZoom: 19,
        }
      ).addTo(map);

      // Plot all property pins
      properties.forEach((prop) => {
        const isHouse = prop.propertyType.toLowerCase() === 'house';
        const isSelected = activeProperty?.id === prop.id;

        const customHtml = `
          <div class="relative group cursor-pointer">
            <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-lg border-2 border-white transition-all duration-300 transform group-hover:scale-110 ${
              isHouse ? 'bg-amber-500 text-navy-950 font-bold' : 'bg-navy-800 text-white font-semibold'
            } ${isSelected ? 'ring-4 ring-amber-400 scale-110 z-50' : ''}">
              <span class="w-2 h-2 rounded-full ${isHouse ? 'bg-navy-900' : 'bg-emerald-400'} animate-pulse"></span>
              <span class="text-xs whitespace-nowrap">${prop.city}</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${
              isHouse ? 'bg-amber-500' : 'bg-navy-800'
            } rotate-45 border-r border-b border-white"></div>
          </div>
        `;

        const icon = Leaflet.divIcon({
          className: 'sri-lanka-custom-marker',
          html: customHtml,
          iconSize: [80, 32],
          iconAnchor: [40, 32],
        });

        const marker = Leaflet.marker([prop.lat, prop.lng], { icon }).addTo(map);

        marker.on('click', () => {
          setActiveProperty(prop);
          if (onSelectProperty) onSelectProperty(prop.id);
          map.flyTo([prop.lat, prop.lng], 11, { duration: 1 });
        });

        markersRef.current[prop.id] = marker;
      });
    });

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  const handleSelect = (prop: PropertyMapItem) => {
    setActiveProperty(prop);
    if (onSelectProperty) onSelectProperty(prop.id);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([prop.lat, prop.lng], 11, { duration: 1 });
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-navy-900 shadow-2xl ring-1 ring-navy-100/10">
      {/* Leaflet Map Canvas */}
      <div ref={mapContainerRef} className="h-[580px] w-full z-0" />

      {/* Floating Active Mini Card */}
      <AnimatePresence>
        {activeProperty && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="absolute bottom-6 left-6 right-6 md:left-6 md:right-auto md:max-w-md z-30 overflow-hidden rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur-md ring-1 ring-navy-900/10"
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveProperty(null)}
              className="absolute right-3 top-3 z-10 rounded-full bg-navy-900/40 p-1.5 text-white transition hover:bg-navy-900/80"
              aria-label="Close details"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Thumbnail Image */}
              <div className="relative h-40 sm:h-36 sm:w-40 shrink-0 overflow-hidden rounded-xl bg-navy-100">
                {activeProperty.images && activeProperty.images.length > 0 ? (
                  <img
                    src={getImageUrl(activeProperty.images[0])}
                    alt={activeProperty.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-navy-800 text-navy-400">
                    <Building2 className="h-10 w-10 opacity-40" />
                  </div>
                )}
                <span className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow-md ${
                  activeProperty.propertyType.toLowerCase() === 'house'
                    ? 'bg-amber-500 text-navy-950'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {activeProperty.propertyType.toLowerCase() === 'house' ? (
                    <Home className="h-3 w-3" />
                  ) : (
                    <Trees className="h-3 w-3" />
                  )}
                  {activeProperty.propertyType}
                </span>
              </div>

              {/* Card Details */}
              <div className="flex flex-1 flex-col justify-between pt-1 sm:pt-0">
                <div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-amber-600">
                    <MapPin className="h-3.5 w-3.5" />
                    <span>{activeProperty.city}</span>
                  </div>

                  <h3 className="mt-1 text-base font-extrabold text-navy-900 line-clamp-2 leading-snug">
                    {activeProperty.title}
                  </h3>

                  <p className="mt-2 text-base font-black text-amber-600">
                    {formatFullPrice(activeProperty.price)}
                  </p>
                </div>

                {/* Explore More Button */}
                <div className="mt-3 pt-2 border-t border-navy-100">
                  <Link
                    href={`/properties/${activeProperty.id}`}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all hover:bg-amber-500 hover:text-navy-950"
                  >
                    <span>Explore More</span>
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend Overlay */}
      <div className="absolute top-4 left-4 z-10 hidden sm:flex items-center gap-3 rounded-xl bg-white/90 px-3.5 py-2 shadow-md backdrop-blur-md ring-1 ring-navy-900/10 text-xs font-bold text-navy-900">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500"></span>
          <span>House</span>
        </span>
        <span className="h-3 w-px bg-navy-200"></span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-navy-800"></span>
          <span>Land</span>
        </span>
      </div>
    </div>
  );
}
