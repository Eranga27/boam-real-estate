'use client';
import React, { useEffect, useState } from 'react';
import { Hero } from '@/components/home/Hero';
import { StatsStrip } from '@/components/home/StatsStrip';
import { FeaturedProperties } from '@/components/home/FeaturedProperties';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { HowItWorks } from '@/components/home/HowItWorks';
import { PopularLocations } from '@/components/home/PopularLocations';
import { CtaBanner } from '@/components/home/CtaBanner';
import { useAuth } from '@/context/AuthContext';
import { getImageUrl } from '@/lib/format';

export default function HomePage() {
  const { user } = useAuth();
  const [featuredProperties, setFeaturedProperties] = useState<any[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/properties?limit=3&sort=newest`);
        const data = await res.json();
        
        if (data.success && data.data) {
          // Map backend model to UI model expected by PropertyCard
          const mapped = data.data.map((p: any) => ({
            id: p.id,
            title: p.title,
            price: p.price,
            listingType: p.saleOrRent.toLowerCase() === 'sale' ? 'sale' : 'rent',
            type: p.propertyType,
            city: p.city,
            district: p.district,
            beds: p.bedrooms || 0,
            baths: p.bathrooms || 0,
            houseSize: p.houseSize || 0,
            landSize: p.landSize || 0,
            images: p.images.map((img: string) => getImageUrl(img)),
            listedDaysAgo: Math.floor((new Date().getTime() - new Date(p.createdAt).getTime()) / (1000 * 3600 * 24)) || 0,
          }));
          setFeaturedProperties(mapped);
        }
      } catch {
        // fail silently
      } finally {
        setLoadingProperties(false);
      }
    };
    fetchFeatured();
  }, []);

  return (
    <div className="w-full bg-white">
      <Hero />
      <StatsStrip />
      <FeaturedProperties properties={featuredProperties} loading={loadingProperties} />
      <WhyChooseUs />
      <HowItWorks />
      <PopularLocations />
      <CtaBanner />
    </div>
  );
}
