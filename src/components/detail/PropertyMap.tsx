'use client';
import React, { useEffect, useRef } from 'react';

interface PropertyMapProps {
  lat: number;
  lng: number;
  label: string;
}

export function PropertyMap({ lat, lng, label }: PropertyMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return;

    import('leaflet').then((L) => {
      const Leaflet = L.default || L;

      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = Leaflet.map(containerRef.current!).setView([lat, lng], 14);
      mapRef.current = map;

      Leaflet.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png').addTo(map);

      Leaflet.circleMarker([lat, lng], {
        radius: 12,
        color: '#12355B',
        weight: 3,
        fillColor: '#F4A300',
        fillOpacity: 0.9,
      }).addTo(map).bindPopup(label);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lat, lng]);

  return (
    <div className="h-[320px] overflow-hidden rounded-3xl ring-1 ring-navy-100">
      <div ref={containerRef} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}