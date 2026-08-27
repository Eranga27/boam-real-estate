'use client';
import React, { useEffect, useRef } from 'react';

interface MapPickerProps {
  position: [number, number];
  onChange: (position: [number, number]) => void;
}

export function MapPicker({ position, onChange }: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === 'undefined' || !containerRef.current || mapRef.current) return;

    // Dynamically import leaflet to avoid SSR issues
    Promise.all([
      import('leaflet'),
      import('leaflet/dist/leaflet.css' as any),
    ]).then(([L]) => {
      const Leaflet = L.default || L;

      // Fix default marker icon path
      delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
      Leaflet.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
      });

      const map = Leaflet.map(containerRef.current!).setView(position, 12);
      mapRef.current = map;

      Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const circle = Leaflet.circleMarker(position, {
        radius: 11,
        color: '#12355B',
        weight: 3,
        fillColor: '#F4A300',
        fillOpacity: 0.9,
      }).addTo(map);
      markerRef.current = circle;

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        circle.setLatLng([lat, lng]);
        onChange([lat, lng]);
      });
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep marker in sync with external position changes
  useEffect(() => {
    if (markerRef.current) {
      markerRef.current.setLatLng(position);
    }
  }, [position]);

  return (
    <div className="overflow-hidden rounded-2xl ring-1 ring-navy-200">
      <div ref={containerRef} style={{ height: 280, width: '100%' }} />
    </div>
  );
}