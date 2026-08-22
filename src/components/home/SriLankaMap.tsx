'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, X, Home, Trees, Building2, Layers, Map as MapIcon, Globe } from 'lucide-react';
import { formatFullPrice, getImageUrl } from '@/lib/format';

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

type GoogleMapMode = 'roadmap' | 'satellite' | 'hybrid' | 'osm';

const TILE_URLS: Record<GoogleMapMode, string> = {
  roadmap: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
  satellite: 'https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}',
  hybrid: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}',
  osm: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
};

export function SriLankaMap({ properties, selectedId, onSelectProperty }: SriLankaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  
  const [activeProperty, setActiveProperty] = useState<PropertyMapItem | null>(null);
  const [mapMode, setMapMode] = useState<GoogleMapMode>('roadmap');

  // Synchronize internal active state with external selectedId
  useEffect(() => {
    if (selectedId) {
      const found = properties.find((p) => p.id === selectedId);
      if (found) {
        setActiveProperty(found);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([found.lat, found.lng], 12, { duration: 1.2 });
        }
      }
    }
  }, [selectedId, properties]);

  // Handle map initialization and marker updates
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
        maxZoom: 18,
        zoomControl: true,
        scrollWheelZoom: false,
      });

      mapInstanceRef.current = map;

      // Invalidate size on mount to eliminate small-box rendering
      const invalidate = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };
      setTimeout(invalidate, 100);
      setTimeout(invalidate, 300);
      setTimeout(invalidate, 800);
      window.addEventListener('resize', invalidate);

      // Add Google Maps Tile Layer
      const googleTileLayer = Leaflet.tileLayer(TILE_URLS.roadmap, {
        attribution: '&copy; Google Maps &bull; Boam Real Estate',
        maxZoom: 20,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
      }).addTo(map);

      tileLayerRef.current = googleTileLayer;

      // Plot all property pins on Google Maps layer
      properties.forEach((prop) => {
        const isHouse = prop.propertyType.toLowerCase() === 'house';
        const isSelected = activeProperty?.id === prop.id;

        const customHtml = `
          <div class="relative group cursor-pointer">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-xl border-2 border-white transition-all duration-300 transform group-hover:scale-110 ${
              isHouse ? 'bg-amber-500 text-navy-950 font-black' : 'bg-navy-900 text-white font-bold'
            } ${isSelected ? 'ring-4 ring-amber-400 scale-110 z-50' : ''}">
              <span class="w-2.5 h-2.5 rounded-full ${isHouse ? 'bg-navy-900' : 'bg-emerald-400'} animate-pulse"></span>
              <span class="text-xs whitespace-nowrap">${prop.city}</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 ${
              isHouse ? 'bg-amber-500' : 'bg-navy-900'
            } rotate-45 border-r border-b border-white"></div>
          </div>
        `;

        const icon = Leaflet.divIcon({
          className: 'google-maps-custom-marker',
          html: customHtml,
          iconSize: [90, 36],
          iconAnchor: [45, 36],
        });

        const marker = Leaflet.marker([prop.lat, prop.lng], { icon }).addTo(map);

        marker.on('click', () => {
          setActiveProperty(prop);
          if (onSelectProperty) onSelectProperty(prop.id);
          map.flyTo([prop.lat, prop.lng], 12, { duration: 1 });
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

  // Handle map mode / layer changes (Roadmap vs Satellite vs Hybrid vs OSM)
  const handleMapModeChange = (mode: GoogleMapMode) => {
    setMapMode(mode);
    if (tileLayerRef.current && mapInstanceRef.current) {
      tileLayerRef.current.setUrl(TILE_URLS[mode]);
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-navy-900 shadow-2xl ring-1 ring-navy-100/10">
      {/* Map Layer Mode Switcher Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/90 p-1.5 shadow-lg backdrop-blur-md ring-1 ring-navy-900/10">
        <button
          onClick={() => handleMapModeChange('roadmap')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            mapMode === 'roadmap'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-navy-700 hover:bg-navy-100/60'
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          <span>Google Map</span>
        </button>

        <button
          onClick={() => handleMapModeChange('satellite')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            mapMode === 'satellite'
              ? 'bg-amber-500 text-navy-950 shadow-sm'
              : 'text-navy-700 hover:bg-navy-100/60'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Satellite</span>
        </button>

        <button
          onClick={() => handleMapModeChange('hybrid')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            mapMode === 'hybrid'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-navy-700 hover:bg-navy-100/60'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Hybrid</span>
        </button>

        <button
          onClick={() => handleMapModeChange('osm')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            mapMode === 'osm'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-navy-700 hover:bg-navy-100/60'
          }`}
        >
          <MapPin className="h-3.5 w-3.5" />
          <span>OpenStreet</span>
        </button>
      </div>

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="h-[580px] w-full z-0 min-h-[580px]" />

      {/* Floating Active Mini Card Popup */}
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
    </div>
  );
}
