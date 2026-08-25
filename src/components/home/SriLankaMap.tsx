'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, X, Home, Trees, Building2, Layers, Map as MapIcon, Globe, Moon } from 'lucide-react';
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

const BASE_MAPS = {
  road: {
    name: 'Roadmap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    subdomains: 'abc',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; BOAM Real Estate',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    subdomains: '',
    attribution: '&copy; Esri World Imagery &bull; BOAM Real Estate',
  },
  dark: {
    name: 'Dark Mode',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    subdomains: 'abcd',
    attribution: '&copy; CARTO Dark &bull; BOAM Real Estate',
  },
  terrain: {
    name: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
    subdomains: '',
    attribution: '&copy; Esri Terrain &bull; BOAM Real Estate',
  },
};

type MapStyle = keyof typeof BASE_MAPS;

export function SriLankaMap({ properties, selectedId, onSelectProperty }: SriLankaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const markersRef = useRef<Record<string, any>>({});
  
  const [activeProperty, setActiveProperty] = useState<PropertyMapItem | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('road');

  // Synchronize active property and flyTo on selectedId change
  useEffect(() => {
    if (selectedId) {
      const found = properties.find((p) => p.id === selectedId);
      if (found) {
        setActiveProperty(found);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([found.lat, found.lng], 12, { animate: true, duration: 1.2 });
        }
      }
    }
  }, [selectedId, properties]);

  // Handle Leaflet map initialization & pin updates
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;

    let isMounted = true;

    import('leaflet').then((L) => {
      if (!isMounted || !mapContainerRef.current) return;
      const Leaflet = L.default || L;
      leafletRef.current = Leaflet;

      // Fix Leaflet default icon paths
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });

      // Initialize map instance if not created yet
      if (!mapInstanceRef.current) {
        const map = Leaflet.map(mapContainerRef.current, {
          center: [7.8731, 80.7718],
          zoom: 8,
          minZoom: 7,
          maxZoom: 18,
          zoomControl: true,
          scrollWheelZoom: false,
        });

        mapInstanceRef.current = map;

        // Add tile layer with correct subdomain config
        const config = BASE_MAPS[mapStyle];
        const tileLayer = Leaflet.tileLayer(config.url, {
          attribution: config.attribution,
          maxZoom: 19,
          subdomains: config.subdomains || 'abc',
        }).addTo(map);

        tileLayerRef.current = tileLayer;

        // Force Leaflet container recalculation on initial render & layout transitions
        const invalidate = () => {
          if (mapInstanceRef.current) {
            mapInstanceRef.current.invalidateSize();
          }
        };

        invalidate();
        setTimeout(invalidate, 100);
        setTimeout(invalidate, 300);
        setTimeout(invalidate, 600);

        // Add ResizeObserver & IntersectionObserver for guaranteed map tile rendering
        if (typeof ResizeObserver !== 'undefined' && mapContainerRef.current) {
          const resizeObserver = new ResizeObserver(() => invalidate());
          resizeObserver.observe(mapContainerRef.current);
        }

        if (typeof IntersectionObserver !== 'undefined' && mapContainerRef.current) {
          const observer = new IntersectionObserver((entries) => {
            if (entries[0]?.isIntersecting) {
              invalidate();
            }
          });
          observer.observe(mapContainerRef.current);
        }

        window.addEventListener('resize', invalidate);
      }

      const map = mapInstanceRef.current;

      // Clear existing markers before re-adding
      Object.values(markersRef.current).forEach((marker) => marker.remove());
      markersRef.current = {};

      // Add custom HTML markers with House/Land BOAM styling
      properties.forEach((prop) => {
        const isHouse = prop.propertyType.toLowerCase() === 'house';
        const isSelected = selectedId === prop.id;

        const customHtml = `
          <div class="relative group cursor-pointer transition-all duration-300">
            <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full shadow-lg border transition-all duration-300 ${
              isSelected
                ? 'ring-4 ring-amber-400/50 scale-110 z-30 ' + (isHouse ? 'bg-navy-950 text-amber-400 border-amber-400 font-extrabold' : 'bg-emerald-900 text-emerald-200 border-emerald-400 font-extrabold')
                : (isHouse ? 'bg-navy-900 text-white border-navy-700 hover:border-amber-400' : 'bg-emerald-700 text-white border-emerald-500 hover:border-white')
            }">
              <span class="w-2 h-2 rounded-full ${
                isSelected ? 'bg-amber-400 animate-ping' : (isHouse ? 'bg-amber-400' : 'bg-emerald-300')
              }"></span>
              <span class="text-[11px] tracking-tight font-bold whitespace-nowrap">${prop.city}</span>
            </div>
            <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 ${
              isSelected ? 'bg-amber-400' : (isHouse ? 'bg-navy-900' : 'bg-emerald-700')
            } rotate-45 border-r border-b border-white/30"></div>
          </div>
        `;

        const icon = Leaflet.divIcon({
          className: 'bg-transparent border-none',
          html: `
            <div style="transform: translate(-50%, -100%); width: max-content; padding-bottom: 4px; position: relative;">
              ${customHtml}
            </div>
          `,
          iconSize: [0, 0],
          iconAnchor: [0, 0],
        });

        const marker = Leaflet.marker([prop.lat, prop.lng], { icon }).addTo(map);

        marker.on('click', () => {
          setActiveProperty(prop);
          if (onSelectProperty) onSelectProperty(prop.id);
          map.flyTo([prop.lat, prop.lng], 12, { animate: true, duration: 1 });
        });

        markersRef.current[prop.id] = marker;
      });
    });

    return () => {
      isMounted = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties, selectedId]);

  // Clean up map instance on unmount
  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Handle map style / layer changes with clean replacement
  const handleMapStyleChange = (style: MapStyle) => {
    setMapStyle(style);
    if (mapInstanceRef.current && leafletRef.current) {
      if (tileLayerRef.current) {
        tileLayerRef.current.remove();
      }
      const config = BASE_MAPS[style];
      const newTileLayer = leafletRef.current.tileLayer(config.url, {
        attribution: config.attribution,
        maxZoom: 19,
        subdomains: config.subdomains || 'abc',
      }).addTo(mapInstanceRef.current);

      tileLayerRef.current = newTileLayer;
    }
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-navy-950 shadow-2xl border border-navy-800">
      {/* Restyled Compact Map Layer Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1 rounded-2xl bg-navy-950/85 p-1.5 shadow-xl backdrop-blur-md border border-white/10">
        <button
          onClick={() => handleMapStyleChange('road')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
            mapStyle === 'road'
              ? 'bg-amber-500 text-navy-950 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          <span>Roadmap</span>
        </button>

        <button
          onClick={() => handleMapStyleChange('satellite')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
            mapStyle === 'satellite'
              ? 'bg-amber-500 text-navy-950 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Satellite</span>
        </button>

        <button
          onClick={() => handleMapStyleChange('dark')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
            mapStyle === 'dark'
              ? 'bg-amber-500 text-navy-950 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Moon className="h-3.5 w-3.5" />
          <span>Dark</span>
        </button>

        <button
          onClick={() => handleMapStyleChange('terrain')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[11px] font-bold transition-all ${
            mapStyle === 'terrain'
              ? 'bg-amber-500 text-navy-950 shadow'
              : 'text-white/70 hover:bg-white/10 hover:text-white'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Terrain</span>
        </button>
      </div>

      {/* Map Canvas Container with Explicit Dimensions */}
      <div ref={mapContainerRef} className="h-[520px] sm:h-[580px] w-full min-h-[520px] relative z-0" />

      {/* Floating Active Mini Card Popup */}
      <AnimatePresence>
        {activeProperty && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-auto sm:max-w-md z-30 overflow-hidden rounded-2xl bg-white/95 p-4 shadow-2xl backdrop-blur-md border border-navy-100"
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
              <div className="relative h-36 sm:h-32 sm:w-36 shrink-0 overflow-hidden rounded-xl bg-navy-100">
                {activeProperty.images && activeProperty.images.length > 0 ? (
                  <img
                    src={getImageUrl(activeProperty.images[0])}
                    alt={activeProperty.title}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-navy-900 text-white/40">
                    <Building2 className="h-8 w-8" />
                  </div>
                )}
                <span className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold shadow ${
                  activeProperty.propertyType.toLowerCase() === 'house'
                    ? 'bg-navy-900 text-amber-400 border border-amber-400/30'
                    : 'bg-emerald-700 text-white'
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

                  <h3 className="mt-1 text-sm sm:text-base font-extrabold text-navy-950 line-clamp-2 leading-snug">
                    {activeProperty.title}
                  </h3>

                  <p className="mt-1 text-sm font-extrabold text-navy-900">
                    {formatFullPrice(activeProperty.price)}
                  </p>
                </div>

                {/* Explore Button */}
                <div className="mt-3 pt-2 border-t border-navy-100">
                  <Link
                    href={`/properties/${activeProperty.id}`}
                    className="group inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-950 px-4 py-2.5 text-xs font-bold text-white shadow transition-all hover:bg-amber-500 hover:text-navy-950"
                  >
                    <span>Explore Listing</span>
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
