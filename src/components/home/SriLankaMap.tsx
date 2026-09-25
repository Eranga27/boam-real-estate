'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ArrowRight, X, Home, Trees, Building2, Layers, Map as MapIcon, Globe, Moon, Maximize2 } from 'lucide-react';
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
  saleOrRent?: string;
  district?: string;
}

interface SriLankaMapProps {
  properties: PropertyMapItem[];
  selectedId?: string | null;
  /** Listing hovered in a linked list; its pin (or the group holding it) is highlighted */
  hoveredId?: string | null;
  onSelectProperty?: (id: string) => void;
}

// Map Tile Layers (Free, non-API-key tile layers)
const BASE_MAPS = {
  road: {
    name: 'Roadmap',
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &bull; Boam Real Estate',
  },
  satellite: {
    name: 'Satellite',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri World Imagery &bull; Boam Real Estate',
  },
  dark: {
    name: 'Dark Mode',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri Dark &bull; Boam Real Estate',
  },
  terrain: {
    name: 'Terrain',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Terrain_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri Terrain &bull; Boam Real Estate',
  },
};

type MapStyle = keyof typeof BASE_MAPS;

const ISLAND_CENTER: [number, number] = [7.8731, 80.7718];
const ISLAND_ZOOM = 7;
/** Framing used for "all listings": the island view swoops in to where the listings are */
const FIT_PADDING: [number, number] = [70, 70];
const FIT_MAX_ZOOM = 10;
/** Deepest zoom used to pull a group apart; closer than this they fan out instead */
const MAX_SPLIT_ZOOM = 16;
/** Zoom used when a listing is picked from the list */
const FOCUS_ZOOM = 14;
/** Matches the .boam-map--bursting transition in globals.css */
const BURST_MS = 620;

interface Group {
  key: string;
  items: PropertyMapItem[];
  lat: number;
  lng: number;
}

interface Spider {
  key: string;
  cluster: any;
  pins: Map<string, any>;
  legs: any[];
  center: any;
}

const HOUSE_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5"/></svg>';
const LAND_SVG =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M10 10v.2A3 3 0 0 1 8.9 16H5a3 3 0 0 1-1-5.8V10a3 3 0 0 1 6 0Z"/><path d="M7 16v6"/><path d="M13 19v3"/><path d="M12 19h8.3a1 1 0 0 0 .7-1.7L18 14h.3a1 1 0 0 0 .7-1.7L16 9h.2a1 1 0 0 0 .8-1.7L13 3l-1.4 1.5"/></svg>';

const isHouse = (item: PropertyMapItem) => item.propertyType.toLowerCase() === 'house';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const priceLabel = (item: PropertyMapItem) =>
  formatPrice(item.price, item.saleOrRent?.toLowerCase() === 'rent' ? 'rent' : 'sale');

const mostCommon = (values: string[]) => {
  const counts = new Map<string, number>();
  values.forEach((v) => counts.set(v, (counts.get(v) || 0) + 1));
  return Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0];
};

/** Name for a group bubble: the town ("Kandy") when all listings share one, otherwise the
 *  district visitors recognise ("Colombo area") rather than whichever suburb is most common */
const groupLabel = (items: PropertyMapItem[]) => {
  if (new Set(items.map((i) => i.city)).size === 1) return items[0].city;
  const district = mostCommon(items.map((i) => i.district).filter((d): d is string => !!d));
  return `${district || mostCommon(items.map((i) => i.city)) || 'Sri Lanka'} area`;
};

const bubbleSize = (n: number) => Math.round(58 + Math.min(n, 10) * 1.8);

/** On-screen box a marker occupies around its anchor: [left, top, right, bottom] in px.
 *  Pins sit above their point (tail tip on the spot); bubbles are centred with a label below. */
const footprint = (items: PropertyMapItem[]): [number, number, number, number] => {
  if (items.length === 1) return [-52, -44, 52, 2];
  const r = bubbleSize(items.length) / 2;
  const half = Math.max(r, (groupLabel(items).length * 6.4 + 22) / 2);
  return [-half, -r, half, r + 28];
};

/**
 * Group listings whose markers would collide on screen at `zoom`, using each marker's real
 * footprint (pin, or bubble + label). Groups keep merging until nothing collides. Keys are
 * stable for the same listings, so markers that didn't change survive a zoom untouched.
 */
function groupListings(map: any, items: PropertyMapItem[], zoom: number): Group[] {
  const groups = items.map((item) => {
    const pt = map.project([item.lat, item.lng], zoom);
    return { items: [item], x: pt.x, y: pt.y };
  });

  let merged = true;
  while (merged) {
    merged = false;
    outer: for (let i = 0; i < groups.length; i++) {
      for (let j = i + 1; j < groups.length; j++) {
        const a = groups[i];
        const b = groups[j];
        const fa = footprint(a.items);
        const fb = footprint(b.items);
        const collide =
          a.x + fa[0] < b.x + fb[2] - 2 &&
          b.x + fb[0] < a.x + fa[2] - 2 &&
          a.y + fa[1] < b.y + fb[3] - 2 &&
          b.y + fb[1] < a.y + fa[3] - 2;
        if (collide) {
          const n = a.items.length + b.items.length;
          groups[i] = {
            items: [...a.items, ...b.items],
            x: (a.x * a.items.length + b.x * b.items.length) / n,
            y: (a.y * a.items.length + b.y * b.items.length) / n,
          };
          groups.splice(j, 1);
          merged = true;
          break outer;
        }
      }
    }
  }

  return groups.map((g) => {
    const center = map.unproject([g.x, g.y], zoom);
    return {
      key: g.items.map((i) => i.id).sort().join('|'),
      items: g.items,
      lat: center.lat,
      lng: center.lng,
    };
  });
}

function pinHtml(item: PropertyMapItem, delayMs: number) {
  const house = isHouse(item);
  return `<div class="boam-pin ${house ? 'boam-pin--house' : 'boam-pin--land'}" style="--d:${delayMs}ms">
    <div class="boam-pin__preview"></div>
    <div class="boam-pin__inner">
      <div class="boam-pin__body">
        <span class="boam-pin__icon">${house ? HOUSE_SVG : LAND_SVG}</span>
        <span class="boam-pin__price">${escapeHtml(priceLabel(item))}</span>
      </div>
      <span class="boam-pin__tail"></span>
    </div>
  </div>`;
}

function clusterHtml(group: Group, delayMs: number) {
  const n = group.items.length;
  const houses = group.items.filter(isHouse).length;
  const lands = n - houses;
  const size = bubbleSize(n);
  const mix = [houses && `${houses} house${houses > 1 ? 's' : ''}`, lands && `${lands} land`].filter(Boolean).join(' · ');
  return `<div class="boam-cluster" style="--d:${delayMs}ms;--size:${size}px;--house:${((houses / n) * 100).toFixed(1)}%">
    <span class="boam-cluster__hint">${mix} · tap to explore</span>
    <div class="boam-cluster__inner">
      <span class="boam-cluster__halo"></span>
      <span class="boam-cluster__ring"></span>
      <span class="boam-cluster__core">
        <span class="boam-cluster__count">${n}</span>
        <span class="boam-cluster__unit">listings</span>
      </span>
    </div>
    <span class="boam-cluster__label">${escapeHtml(groupLabel(group.items))}</span>
  </div>`;
}

export function SriLankaMap({ properties, selectedId, hoveredId, onSelectProperty }: SriLankaMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const leafletRef = useRef<any>(null);
  const tileLayerRef = useRef<any>(null);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);

  const [mapReady, setMapReady] = useState(false);
  const [inView, setInView] = useState(false);
  const [zoom, setZoom] = useState(ISLAND_ZOOM);
  const [activeProperty, setActiveProperty] = useState<PropertyMapItem | null>(null);
  const [mapStyle, setMapStyle] = useState<MapStyle>('road');

  // Marker state lives outside React: Leaflet owns the DOM for pins and bubbles
  const markersRef = useRef(new Map<string, { marker: any; group: Group }>());
  const lastPosRef = useRef(new Map<string, any>());
  const spiderRef = useRef<Spider | null>(null);
  const pendingSpiderRef = useRef<string[] | null>(null);
  const burstTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const localSelectRef = useRef<string | null>(null);

  // Latest props for Leaflet event handlers bound once
  const propsRef = useRef({ properties, selectedId, hoveredId, onSelectProperty });
  propsRef.current = { properties, selectedId, hoveredId, onSelectProperty };

  // Stable handles to the marker engine, filled in once the map exists
  const engineRef = useRef<{
    render: () => void;
    applyHighlights: () => void;
    focusListing: (item: PropertyMapItem) => void;
    collapseSpider: (animated: boolean) => void;
    fitListings: (duration: number) => void;
  } | null>(null);
  const fittedRef = useRef(false);
  const [fittedZoom, setFittedZoom] = useState<number | null>(null);

  // 1. Initialize Leaflet Map Instance ONCE on mount
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;
    let disposed = false;

    import('leaflet').then((L) => {
      if (disposed || !mapContainerRef.current || mapInstanceRef.current) return;
      const Leaflet = L.default || L;

      // Center map on Sri Lanka — zoom 7 fits the whole island including south (Hikkaduwa)
      const map = Leaflet.map(mapContainerRef.current, {
        center: ISLAND_CENTER,
        zoom: ISLAND_ZOOM,
        zoomSnap: 0.5,
        minZoom: 6,
        maxZoom: 18,
        zoomControl: false,
        scrollWheelZoom: false,
        fadeAnimation: true,
        zoomAnimation: true,
      });
      // Bottom-right keeps the zoom buttons clear of the map style switcher
      Leaflet.control.zoom({ position: 'bottomright' }).addTo(map);

      mapInstanceRef.current = map;
      leafletRef.current = Leaflet;

      // Add default tile layer
      const tileLayer = Leaflet.tileLayer(BASE_MAPS.road.url, {
        attribution: BASE_MAPS.road.attribution,
        maxZoom: 19,
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // ResizeObserver to ensure Leaflet recalculates dimensions smoothly without grey tile glitches
      const invalidate = () => {
        if (mapInstanceRef.current) {
          mapInstanceRef.current.invalidateSize();
        }
      };

      invalidate();
      setTimeout(invalidate, 100);
      setTimeout(invalidate, 400);

      const resizeObserver = new ResizeObserver(() => {
        invalidate();
      });
      resizeObserver.observe(mapContainerRef.current);
      resizeObserverRef.current = resizeObserver;

      // ---- Marker engine ----

      /** Move markers with a springy transition (e.g. listings bursting out of a group bubble) */
      const burst = (moves: Array<[any, any]>) => {
        if (moves.length === 0) return;
        const container = map.getContainer();
        moves.forEach(([m]) => m.getElement()?.getBoundingClientRect());
        container.classList.add('boam-map--bursting');
        requestAnimationFrame(() => {
          moves.forEach(([m, target]) => m.setLatLng(target));
          clearTimeout(burstTimerRef.current);
          burstTimerRef.current = setTimeout(() => container.classList.remove('boam-map--bursting'), BURST_MS + 80);
        });
      };

      const removeMarker = (marker: any) => {
        const el = marker.getElement();
        if (!el) return marker.remove();
        el.classList.add('is-leaving');
        setTimeout(() => marker.remove(), 220);
      };

      /** Photo preview above a pin, built on first hover (images can be large data URIs) */
      const fillPreview = (marker: any, item: PropertyMapItem) => {
        const preview = marker.getElement()?.querySelector('.boam-pin__preview');
        if (!preview || preview.childElementCount > 0) return;
        const media = document.createElement('div');
        media.className = 'boam-pin__preview-media';
        if (item.images?.[0]) {
          const img = document.createElement('img');
          img.src = getImageUrl(item.images[0]);
          img.alt = '';
          img.decoding = 'async';
          media.appendChild(img);
        }
        const text = document.createElement('div');
        text.className = 'boam-pin__preview-text';
        const city = document.createElement('span');
        city.textContent = item.city;
        const title = document.createElement('strong');
        title.textContent = item.title;
        text.append(city, title);
        preview.append(media, text);
      };

      const selectListing = (item: PropertyMapItem) => {
        localSelectRef.current = item.id;
        setActiveProperty(item);
        propsRef.current.onSelectProperty?.(item.id);
        // Keep the pin clear of the details card along the bottom
        map.panInside([item.lat, item.lng], { paddingTopLeft: [60, 90], paddingBottomRight: [60, 230] });
      };

      const createPin = (item: PropertyMapItem, at: any, delayMs: number) => {
        const icon = Leaflet.divIcon({ className: 'boam-marker', html: pinHtml(item, delayMs), iconSize: [0, 0], iconAnchor: [0, 0] });
        const marker = Leaflet.marker(at, { icon, keyboard: true, riseOnHover: true, riseOffset: 1000 });
        marker.on('click', () => selectListing(item));
        marker.on('mouseover', () => fillPreview(marker, item));
        marker.addTo(map);
        const el = marker.getElement();
        el?.setAttribute('role', 'button');
        el?.setAttribute('aria-label', `${item.title}, ${item.city}, ${priceLabel(item)}`);
        return marker;
      };

      const collapseSpider = (animated: boolean) => {
        const spider = spiderRef.current;
        if (!spider) return;
        spiderRef.current = null;
        spider.legs.forEach((leg) => leg.remove());
        spider.cluster.getElement()?.firstElementChild?.classList.remove('is-spidered');
        const pins = Array.from(spider.pins.values());
        if (animated) {
          burst(pins.map((m) => [m, spider.center] as [any, any]));
          pins.forEach((m) => m.getElement()?.classList.add('is-leaving'));
          setTimeout(() => pins.forEach((m) => m.remove()), BURST_MS * 0.55);
        } else {
          pins.forEach((m) => m.remove());
        }
      };

      /** Fan a group out around its bubble, joined by gold leader lines */
      const spiderfy = (group: Group, cluster: any) => {
        collapseSpider(false);
        const center = Leaflet.latLng(group.lat, group.lng);
        const c = map.latLngToLayerPoint(center);
        const n = group.items.length;
        const rx = 64 + n * 13;
        const ry = 44 + n * 8;
        const pins = new Map<string, any>();
        const legs: any[] = [];
        const moves: Array<[any, any]> = [];
        const startAngle = n === 2 ? 0 : -Math.PI / 2;
        group.items.forEach((item, i) => {
          const angle = startAngle + (2 * Math.PI * i) / n;
          const target = map.layerPointToLatLng(Leaflet.point(c.x + rx * Math.cos(angle), c.y + ry * Math.sin(angle)));
          legs.push(
            Leaflet.polyline([center, target], {
              className: 'boam-spider-leg',
              interactive: false,
              color: '#F4A300',
              weight: 1.5,
              opacity: 0.9,
              dashArray: '4 5',
            }).addTo(map)
          );
          const pin = createPin(item, center, i * 35);
          pins.set(item.id, pin);
          moves.push([pin, target]);
        });
        cluster.getElement()?.firstElementChild?.classList.add('is-spidered');
        spiderRef.current = { key: group.key, cluster, pins, legs, center };
        burst(moves);
        applyHighlights();
      };

      /** Bubble tapped: fly in until the group splits, or fan it out if it never will */
      const openGroup = (group: Group, cluster: any) => {
        if (spiderRef.current?.key === group.key) {
          collapseSpider(true);
          return;
        }
        const current = map.getZoom();
        let splitZoom: number | null = null;
        for (let z = Math.ceil(current + 0.01); z <= MAX_SPLIT_ZOOM; z++) {
          if (groupListings(map, group.items, z).length > 1) {
            splitZoom = z;
            break;
          }
        }
        const bounds = Leaflet.latLngBounds(group.items.map((i) => [i.lat, i.lng]));
        if (splitZoom !== null) {
          const fitZoom = map.getBoundsZoom(bounds, false, Leaflet.point(120, 120));
          map.flyTo(bounds.getCenter(), Math.min(MAX_SPLIT_ZOOM, Math.max(splitZoom, fitZoom)), { duration: 0.9 });
        } else if (current < 12) {
          // Same street or plot: get close first, then fan out on arrival
          pendingSpiderRef.current = group.items.map((i) => i.id);
          map.flyTo([group.lat, group.lng], 15, { duration: 0.9 });
        } else {
          spiderfy(group, cluster);
        }
      };

      const createCluster = (group: Group, at: any, delayMs: number) => {
        const icon = Leaflet.divIcon({ className: 'boam-marker', html: clusterHtml(group, delayMs), iconSize: [0, 0], iconAnchor: [0, 0] });
        const marker = Leaflet.marker(at, { icon, keyboard: true, zIndexOffset: 500, riseOnHover: true, riseOffset: 1000 });
        marker.on('click', () => openGroup(group, marker));
        marker.addTo(map);
        const el = marker.getElement();
        el?.setAttribute('role', 'button');
        el?.setAttribute('aria-label', `${group.items.length} listings, ${groupLabel(group.items)}. Open to see them`);
        return marker;
      };

      /** Highlight the selected / list-hovered listing, or the group bubble that holds it */
      const applyHighlights = () => {
        const { selectedId: sel, hoveredId: hov } = propsRef.current;
        const mark = (marker: any, ids: string[]) => {
          const root = marker.getElement()?.firstElementChild as HTMLElement | null;
          if (!root) return;
          const single = ids.length === 1;
          root.classList.toggle(single ? 'is-selected' : 'has-selected', !!sel && ids.includes(sel));
          root.classList.toggle('is-hovered', !!hov && ids.includes(hov));
          if (single) marker.setZIndexOffset(sel === ids[0] ? 2000 : hov === ids[0] ? 1500 : 0);
        };
        markersRef.current.forEach(({ marker, group }) => mark(marker, group.items.map((i) => i.id)));
        spiderRef.current?.pins.forEach((marker, id) => mark(marker, [id]));
      };

      /** Diff groups for the current zoom: unchanged markers stay, new ones pop in from where
       *  their listings were last shown, so zooming in makes bubbles burst into their pins. */
      const render = () => {
        const z = map.getZoom();
        const groups = groupListings(map, propsRef.current.properties, z);
        const next = new Map(groups.map((g) => [g.key, g]));
        if (spiderRef.current && !next.has(spiderRef.current.key)) collapseSpider(false);

        markersRef.current.forEach((entry, key) => {
          if (!next.has(key)) {
            removeMarker(entry.marker);
            markersRef.current.delete(key);
          }
        });

        const moves: Array<[any, any]> = [];
        let order = 0;
        groups.forEach((group) => {
          if (markersRef.current.has(group.key)) return;
          const target = Leaflet.latLng(group.lat, group.lng);
          const previous = group.items.map((i) => lastPosRef.current.get(i.id)).filter(Boolean);
          const start = previous.length
            ? Leaflet.latLng(
                previous.reduce((s: number, p: any) => s + p.lat, 0) / previous.length,
                previous.reduce((s: number, p: any) => s + p.lng, 0) / previous.length
              )
            : target;
          const delay = Math.min(order++ * 45, 650);
          const marker =
            group.items.length === 1 ? createPin(group.items[0], start, delay) : createCluster(group, start, delay);
          markersRef.current.set(group.key, { marker, group });
          if (map.latLngToLayerPoint(start).distanceTo(map.latLngToLayerPoint(target)) > 3) {
            moves.push([marker, target]);
          }
        });
        burst(moves);

        groups.forEach((g) => g.items.forEach((i) => lastPosRef.current.set(i.id, Leaflet.latLng(g.lat, g.lng))));
        applyHighlights();
      };

      /** Listing picked from the list: fly to it, fanning out its group if it's still grouped */
      const focusListing = (item: PropertyMapItem) => {
        pendingSpiderRef.current = [item.id];
        map.flyTo([item.lat, item.lng], Math.max(map.getZoom(), FOCUS_ZOOM), { duration: 1.1 });
      };

      /** Frame every listing; markers (re)group when the flight lands */
      const fitListings = (duration: number) => {
        const items = propsRef.current.properties;
        if (items.length === 0) return;
        const bounds = Leaflet.latLngBounds(items.map((i) => [i.lat, i.lng]));
        setFittedZoom(Math.min(FIT_MAX_ZOOM, map.getBoundsZoom(bounds, false, Leaflet.point(FIT_PADDING[0] * 2, FIT_PADDING[1] * 2))));
        map.flyToBounds(bounds, { padding: FIT_PADDING, maxZoom: FIT_MAX_ZOOM, duration });
      };

      const onZoomEnd = () => setZoom(map.getZoom());
      const onMoveEnd = () => {
        if (fittedRef.current) render();
        const pending = pendingSpiderRef.current;
        if (!pending) return;
        pendingSpiderRef.current = null;
        const entry = Array.from(markersRef.current.values()).find(
          ({ group }) => group.items.length > 1 && pending.every((id) => group.items.some((i) => i.id === id))
        );
        if (entry) spiderfy(entry.group, entry.marker);
      };
      map.on('zoomstart', () => collapseSpider(false));
      map.on('zoomend', onZoomEnd);
      map.on('moveend', onMoveEnd);
      map.on('click', () => collapseSpider(true));

      engineRef.current = { render, applyHighlights, focusListing, collapseSpider, fitListings };
      setMapReady(true);
    });

    return () => {
      disposed = true;
      clearTimeout(burstTimerRef.current);
      engineRef.current = null;
      markersRef.current.clear();
      lastPosRef.current.clear();
      spiderRef.current = null;
      if (resizeObserverRef.current) {
        resizeObserverRef.current.disconnect();
        resizeObserverRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Pins cascade in when the map is well on screen, and only once scrolling pauses: the fly-in
  // redraws tiles and markers, which would otherwise compete with the page scroll
  useEffect(() => {
    const el = mapContainerRef.current;
    if (!el || inView) return;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;
    const start = () => {
      window.removeEventListener('scroll', onScroll);
      setInView(true);
    };
    const onScroll = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(start, 180);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      clearTimeout(idleTimer);
      window.removeEventListener('scroll', onScroll);
    };
  }, [inView]);

  // 2. First time on screen: swoop from the island to the listings (markers pop in on landing).
  //    After that, re-group in place when listings or filters change.
  useEffect(() => {
    const engine = engineRef.current;
    if (!mapReady || !inView || !engine || properties.length === 0) return;
    if (!fittedRef.current) {
      fittedRef.current = true;
      engine.fitListings(1.6);
    } else {
      engine.render();
    }
  }, [properties, mapReady, inView]);

  // 3. Highlight follows selection and list hover without rebuilding markers
  useEffect(() => {
    engineRef.current?.applyHighlights();
  }, [selectedId, hoveredId, mapReady]);

  // 4. Selection from outside the map (the listing sidebar): show its card and fly to it
  useEffect(() => {
    if (!selectedId) return;
    const found = properties.find((p) => p.id === selectedId);
    if (!found) return;
    setActiveProperty(found);
    // A pin tapped on the map is already in view: only list selections fly the map
    const fromMap = localSelectRef.current === selectedId;
    localSelectRef.current = null;
    if (fromMap) return;
    if (mapReady && inView) engineRef.current?.focusListing(found);
  }, [selectedId, properties, mapReady, inView]);

  // Handle map style / layer changes
  const handleMapStyleChange = (style: MapStyle) => {
    setMapStyle(style);
    if (tileLayerRef.current && mapInstanceRef.current) {
      tileLayerRef.current.setUrl(BASE_MAPS[style].url);
    }
  };

  const showAllListings = () => {
    engineRef.current?.collapseSpider(true);
    setActiveProperty(null);
    engineRef.current?.fitListings(1);
  };

  return (
    <div className="relative w-full overflow-hidden rounded-3xl bg-[#f8fafc] shadow-2xl ring-1 ring-navy-100/10">
      {/* Map Layer Mode Controls */}
      <div className="absolute top-4 left-4 z-20 flex flex-wrap items-center gap-1.5 rounded-2xl bg-white/95 p-1.5 shadow-lg backdrop-blur-md ring-1 ring-navy-900/10">
        <button
          onClick={() => handleMapStyleChange('road')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            mapStyle === 'road'
              ? 'bg-navy-900 text-white shadow-sm'
              : 'text-navy-700 hover:bg-navy-100/60'
          }`}
        >
          <MapIcon className="h-3.5 w-3.5" />
          <span>Roadmap</span>
        </button>

        <button
          onClick={() => handleMapStyleChange('satellite')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            mapStyle === 'satellite'
              ? 'bg-amber-500 text-navy-950 shadow-sm'
              : 'text-navy-700 hover:bg-navy-100/60'
          }`}
        >
          <Globe className="h-3.5 w-3.5" />
          <span>Satellite</span>
        </button>

        <button
          onClick={() => handleMapStyleChange('dark')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            mapStyle === 'dark'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-navy-700 hover:bg-navy-100/60'
          }`}
        >
          <Moon className="h-3.5 w-3.5" />
          <span>Dark</span>
        </button>

        <button
          onClick={() => handleMapStyleChange('terrain')}
          className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
            mapStyle === 'terrain'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-navy-700 hover:bg-navy-100/60'
          }`}
        >
          <Layers className="h-3.5 w-3.5" />
          <span>Terrain</span>
        </button>
      </div>

      {/* Legend + back-to-island control */}
      {/* Sits below the style switcher on phones, where that bar spans the map's width */}
      <div className="absolute top-[4.25rem] right-4 z-20 flex flex-col items-end gap-2 sm:top-4">
        <AnimatePresence>
          {fittedZoom !== null && Math.abs(zoom - fittedZoom) > 0.4 && (
            <motion.button
              type="button"
              onClick={showAllListings}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-1.5 rounded-xl bg-navy-900 px-3 py-2 text-xs font-bold text-white shadow-lg transition-colors hover:bg-amber-500 hover:text-navy-950"
            >
              <Maximize2 className="h-3.5 w-3.5" />
              <span>Show all listings</span>
            </motion.button>
          )}
        </AnimatePresence>
        <div className="hidden items-center gap-3 rounded-xl bg-white/95 px-3 py-2 text-[11px] font-bold text-navy-800 shadow-lg ring-1 ring-navy-900/10 backdrop-blur-md sm:flex">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-500" /> Houses
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-sea-500" /> Land
          </span>
          <span className="flex items-center gap-1.5 text-navy-800/60">
            <span className="h-3 w-3 rounded-full bg-navy-900 ring-2 ring-amber-500" /> Tap a group to explore
          </span>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div ref={mapContainerRef} className="h-[580px] w-full z-0 min-h-[580px] bg-[#f8fafc]" />

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
