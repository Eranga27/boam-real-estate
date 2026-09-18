'use client';
import React, { useEffect, useState } from 'react';
import { Hero } from '@/components/home/Hero';
import { StatsStrip } from '@/components/home/StatsStrip';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { CategoryIntro } from '@/components/home/CategoryIntro';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PopularLocations } from '@/components/home/PopularLocations';
import { CtaBanner } from '@/components/home/CtaBanner';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/lib/format';
import { properties as staticProperties } from '@/data/properties';
import { fetchLivePropertiesList, getCachedProperties } from '@/lib/api';

/** Shape properties.ts data into what PropertyCard expects */
function toCardShape(p: typeof staticProperties[0]): any {
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    listingType: p.listingType,
    type: p.type,
    city: p.city,
    district: p.district,
    beds: p.beds,
    baths: p.baths,
    houseSize: p.houseSize,
    landSize: p.landSize,
    images: p.images,
    video: p.video,
    listedDaysAgo: p.listedDaysAgo,
    negotiable: p.negotiable,
  };
}

function mapDbToCard(p: any): any {
  const createdTime = p.createdAt ? new Date(p.createdAt).getTime() : Date.now();
  const daysAgo = Math.max(0, Math.floor((Date.now() - createdTime) / (1000 * 3600 * 24)));
  return {
    id: p.id,
    title: p.title,
    price: p.price,
    listingType: p.saleOrRent?.toLowerCase() === 'sale' ? 'sale' : 'rent',
    type: p.propertyType,
    city: p.city,
    district: p.district,
    beds: p.bedrooms || p.beds || 0,
    baths: p.bathrooms || p.baths || 0,
    houseSize: p.houseSize || 0,
    landSize: p.landSize || 0,
    images: (p.images || []).map((img: string) => getImageUrl(img)),
    video: p.video || null,
    listedDaysAgo: daysAgo,
    negotiable: p.negotiable || false,
  };
}

export default function HomePage() {
  const { user } = useAuth();
  // Pre-fill with cached or static listings — visible immediately, zero latency
  const [featuredProperties, setFeaturedProperties] = useState<any[]>(() => {
    const cached = getCachedProperties();
    if (cached && cached.length > 0) {
      const feat = cached.filter((p: any) => p.isFeatured || p.featured);
      return (feat.length > 0 ? feat : cached).slice(0, 3).map(mapDbToCard);
    }
    return staticProperties.filter((p) => p.featured).slice(0, 3).map(toCardShape);
  });
  const [loadingProperties] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        const liveData = await fetchLivePropertiesList(30);
        if (isMounted && Array.isArray(liveData) && liveData.length > 0) {
          const feat = liveData.filter((p: any) => p.isFeatured || p.featured);
          const toDisplay = (feat.length > 0 ? feat : liveData).slice(0, 3);
          setFeaturedProperties(toDisplay.map(mapDbToCard));
        }
      } catch {
        // Backend offline — static or cached featured data already showing
      }
    };
    fetchFeatured();

    const handleInvalidate = () => {
      fetchFeatured();
    };
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'boam_properties_cache_time_v2') {
        fetchFeatured();
      }
    };
    window.addEventListener('boam:properties_invalidated', handleInvalidate);
    window.addEventListener('storage', handleStorage);
    return () => {
      isMounted = false;
      window.removeEventListener('boam:properties_invalidated', handleInvalidate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return (
    <div className="w-full">
      <Hero />
      <StatsStrip />
      <FeaturedProperties properties={featuredProperties} loading={loadingProperties} />
      <CategoryIntro />
      <PopularLocations />
      <WhyChooseUs />
      <HowItWorks />
      <CtaBanner />
    </div>
  );
}
