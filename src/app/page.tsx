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
    listedDaysAgo: p.listedDaysAgo,
    negotiable: p.negotiable,
  };
}

export default function HomePage() {
  const { user } = useAuth();
  // Pre-fill with 3 featured static listings — visible immediately, no backend needed
  const [featuredProperties, setFeaturedProperties] = useState<any[]>(
    staticProperties.filter((p) => p.featured).slice(0, 3).map(toCardShape)
  );
  const [loadingProperties] = useState(false);

  useEffect(() => {
    // Try enhancing with live API data in the background (silently ignored if offline/unconfigured)
    const fetchFeatured = async () => {
      if (!process.env.NEXT_PUBLIC_API_URL) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/v1/properties?limit=3&sort=newest`,
          { signal: AbortSignal.timeout(4000) }
        );
        const data = await res.json();
        if (data.success && data.data && data.data.length > 0) {
          const mapped = data.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            listingType: p.saleOrRent?.toLowerCase() === 'sale' ? 'sale' : 'rent',
            type: p.propertyType,
            city: p.city,
            district: p.district,
            beds: p.bedrooms || 0,
            baths: p.bathrooms || 0,
            houseSize: p.houseSize || 0,
            landSize: p.landSize || 0,
            images: (p.images || []).map((img: string) => getImageUrl(img)),
            listedDaysAgo:
              Math.floor((Date.now() - new Date(p.createdAt).getTime()) / (1000 * 3600 * 24)) || 0,
          }));
          setFeaturedProperties(mapped);
        }
      } catch {
        // Backend offline — static featured data already showing
      }
    };
    fetchFeatured();
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
