'use client';
import React, { useEffect, useState } from 'react';
import { MotionConfig } from 'framer-motion';
import { Hero } from '@/components/home/Hero';
import { StatsStrip } from '@/components/home/StatsStrip';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { CategoryIntro } from '@/components/home/CategoryIntro';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PopularLocations } from '@/components/home/PopularLocations';
import { CtaBanner } from '@/components/home/CtaBanner';
import BoamIntro from '@/components/intro/BoamIntro';
import { fetchLivePropertiesList, getCachedProperties, onPropertiesInvalidated } from '@/lib/api';
import { toFeaturedCards } from '@/lib/featured';

interface HomeClientProps {
  /** Featured cards pre-rendered on the server from the live database (empty if it was unreachable) */
  initialFeatured: any[];
}

export default function HomeClient({ initialFeatured }: HomeClientProps) {
  // Start from the server-rendered cards so the first client render matches the HTML
  const [featuredProperties, setFeaturedProperties] = useState<any[]>(initialFeatured);
  const [loadingProperties, setLoadingProperties] = useState(initialFeatured.length === 0);

  useEffect(() => {
    let isMounted = true;

    // Server had no data (cold backend): show a returning visitor's cached listings instantly
    if (initialFeatured.length === 0) {
      const cached = getCachedProperties();
      if (cached && cached.length > 0) {
        setFeaturedProperties(toFeaturedCards(cached));
        setLoadingProperties(false);
      }
    }

    const fetchFeatured = async () => {
      try {
        const liveData = await fetchLivePropertiesList();
        if (isMounted && Array.isArray(liveData) && liveData.length > 0) {
          setFeaturedProperties(toFeaturedCards(liveData));
        }
      } catch {
        // Backend offline: server-rendered or cached cards stay; with neither, use the bundled listings
        if (isMounted) {
          const { getBundledListings } = await import('@/lib/fallbackListings');
          if (isMounted) setFeaturedProperties((current) => (current.length > 0 ? current : toFeaturedCards(getBundledListings())));
        }
      } finally {
        if (isMounted) setLoadingProperties(false);
      }
    };
    fetchFeatured();

    const unsubscribe = onPropertiesInvalidated(fetchFeatured);
    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  return (
    // Visitors who ask for reduced motion get fades instead of movement across every section
    <MotionConfig reducedMotion="user">
      <div className="w-full">
        <BoamIntro />
        <Hero />
        <StatsStrip />
        <FeaturedProperties properties={featuredProperties} loading={loadingProperties} />
        <CategoryIntro />
        <PopularLocations />
        <WhyChooseUs />
        <HowItWorks />
        <CtaBanner />
      </div>
    </MotionConfig>
  );
}
