'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ContactForm from '@/components/ContactForm';
import {
  MapPin, Bed, Bath, Square, Calendar, CheckCircle2,
  Video, Heart, BookMarked, Share2, Flag, ChevronLeft, ChevronRight, Car,
  LandPlot, ExternalLink, Eye, ArrowLeft
} from 'lucide-react';
import { formatFullPrice, formatPrice, getImageUrl } from '@/lib/format';

export default function PropertyDetails() {
  const { isAuthenticated } = useAuth();
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<any>(null);
  const [relatedProperties, setRelatedProperties] = useState<any[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [saved, setSaved] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const updateRecentlyViewed = useCallback((prop: any) => {
    try {
      const stored = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      const filtered = stored.filter((p: any) => p.id !== prop.id);
      const updated = [prop, ...filtered].slice(0, 6);
      localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    } catch {}
  }, []);

  useEffect(() => {
    if (!id) return;
    const fetchProperty = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/properties/${id}`);
        const data = await res.json();
        if (data.success) {
          setProperty(data.data);
          updateRecentlyViewed(data.data);
          // Fetch related
          const relRes = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/properties?propertyType=${data.data.propertyType}&saleOrRent=${data.data.saleOrRent}&limit=4`
          );
          const relData = await relRes.json();
          if (relData.success) {
            setRelatedProperties(relData.data.filter((p: any) => p.id !== id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();

    // Load saved state
    try {
      const savedIds = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      setSaved(savedIds.includes(id));
      const rv = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(rv.filter((p: any) => p.id !== id).slice(0, 4));
    } catch {}

    // Load favorite state if authenticated
    if (isAuthenticated) {
      const fetchFavorites = async () => {
        try {
          const token = localStorage.getItem('token');
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/favorites/ids`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success && data.data.includes(id)) {
            setIsFavorite(true);
          }
        } catch (err) {}
      };
      fetchFavorites();
    }
  }, [id, updateRecentlyViewed, isAuthenticated]);

  const handleSave = () => {
    try {
      const savedIds = JSON.parse(localStorage.getItem('savedProperties') || '[]');
      const updated = saved ? savedIds.filter((sid: string) => sid !== id) : [...savedIds, id];
      localStorage.setItem('savedProperties', JSON.stringify(updated));
      setSaved(!saved);
    } catch {}
  };

  const handleFavorite = async () => {
    if (!isAuthenticated) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/favorites/${id}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setIsFavorite(data.favorited);
      }
    } catch (err) {}
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title: property?.title, url }); } catch {}
    } else {
      setShowShareMenu(true);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopySuccess(true);
      setTimeout(() => { setCopySuccess(false); setShowShareMenu(false); }, 2000);
    });
  };

  const handleReport = () => {
    setReportSent(true);
    setTimeout(() => setReportSent(false), 3000);
  };

  const prevImage = () => setActiveImage(i => (i - 1 + (property?.images?.length || 1)) % (property?.images?.length || 1));
  const nextImage = () => setActiveImage(i => (i + 1) % (property?.images?.length || 1));

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h2 className="text-2xl font-bold text-gray-700">Property not found</h2>
        <Link href="/buy">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse Properties
          </Button>
        </Link>
      </div>
    );
  }

  const locationQuery = `${property.address || ''}, ${property.city || ''}, ${property.district || ''}`;
  const mapsUrl = (property.latitude && property.longitude)
    ? `https://www.google.com/maps/embed/v1/place?key=YOUR_GOOGLE_MAPS_KEY&q=${property.latitude},${property.longitude}&zoom=15`
    : `https://www.google.com/maps/embed/v1/search?key=YOUR_GOOGLE_MAPS_KEY&q=${encodeURIComponent(locationQuery)}`;

  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(locationQuery)}&zoom=14&size=600x300&markers=color:red%7C${encodeURIComponent(locationQuery)}&key=YOUR_GOOGLE_MAPS_KEY`;

  return (
    <main className="min-h-screen bg-light-gray py-10">
      <div className="max-w-7xl mx-auto px-4">

        {/* Back Navigation */}
        <div className="flex items-center gap-4 mb-6">
          <Link href="/buy" className="flex items-center text-sm text-gray-500 hover:text-primary transition-colors">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to listings
          </Link>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-500">{property.propertyType}</span>
          <span className="text-gray-300">/</span>
          <span className="text-sm text-gray-800 font-medium line-clamp-1 max-w-[200px]">{property.title}</span>
        </div>

        {/* Header */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-100 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <Badge variant={property.saleOrRent === 'Sale' ? 'accent' : 'secondary'}>For {property.saleOrRent}</Badge>
                <Badge variant="outline">{property.propertyType}</Badge>
                {property.negotiable && <Badge variant="gray">Negotiable</Badge>}
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <p className="flex items-center text-gray-500 text-sm">
                <MapPin className="w-4 h-4 mr-1 flex-shrink-0 text-primary" />
                {property.address}, {property.city}, {property.district}
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                {formatFullPrice(property.price)}
                {property.saleOrRent === 'Rent' && <span className="text-lg font-normal text-gray-500">/mo</span>}
              </div>
              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-3 justify-end relative">
                {isAuthenticated && (
                  <button
                    onClick={handleFavorite}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${isFavorite ? 'bg-red-50 border-red-200 text-red-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-red-200 hover:text-red-500'}`}
                  >
                    <Heart className={`w-4 h-4 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
                    {isFavorite ? 'Favorited' : 'Favorite'}
                  </button>
                )}
                <button
                  onClick={handleSave}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${saved ? 'bg-primary/10 border-primary/20 text-primary' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-primary/20 hover:text-primary'}`}
                >
                  <BookMarked className={`w-4 h-4 ${saved ? 'fill-primary text-primary' : ''}`} />
                  {saved ? 'Saved' : 'Save'}
                </button>
                <button onClick={handleShare} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-gray-200 bg-gray-50 text-gray-600 hover:border-primary hover:text-primary transition-all">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={handleReport} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${reportSent ? 'bg-orange-50 border-orange-200 text-orange-600' : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-orange-200 hover:text-orange-500'}`}>
                  <Flag className="w-4 h-4" /> {reportSent ? 'Reported' : 'Report'}
                </button>
                {showShareMenu && (
                  <div className="absolute top-10 right-0 bg-white rounded-xl shadow-lg border border-gray-100 p-3 z-10 min-w-[200px]">
                    <p className="text-xs text-gray-500 mb-2 font-medium">Share this listing</p>
                    <button onClick={handleCopyLink} className="w-full text-left text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      {copySuccess ? '✓ Link Copied!' : '📋 Copy Link'}
                    </button>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}`} target="_blank" rel="noopener noreferrer" className="block text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      📘 Share on Facebook
                    </a>
                    <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(typeof window !== 'undefined' ? window.location.href : '')}&text=${encodeURIComponent(property.title)}`} target="_blank" rel="noopener noreferrer" className="block text-sm px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                      🐦 Share on X / Twitter
                    </a>
                    <a href={`https://wa.me/?text=${encodeURIComponent(`${property.title} - ${typeof window !== 'undefined' ? window.location.href : ''}`)}`} target="_blank" rel="noopener noreferrer" className="block text-sm px-3 py-2 rounded-lg hover:bg-green-50 transition-colors text-green-700">
                      📱 Share on WhatsApp
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Image Gallery */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
              {property.images && property.images.length > 0 ? (
                <>
                  <div className="relative aspect-[16/9] bg-gray-100">
                    <motion.img
                      key={activeImage}
                      src={getImageUrl(property.images[activeImage])}
                      alt="Property"
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 flex items-center justify-between px-4">
                      <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2.5 py-1 rounded-full backdrop-blur-sm">
                      {activeImage + 1} / {property.images.length}
                    </div>
                  </div>
                  {property.images.length > 1 && (
                    <div className="flex gap-2 p-4 overflow-x-auto">
                      {property.images.map((img: string, idx: number) => (
                        <button key={idx} onClick={() => setActiveImage(idx)}
                          className={`flex-shrink-0 w-20 h-16 rounded-xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-primary' : 'border-transparent opacity-60 hover:opacity-100'}`}
                        >
                          <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[16/9] bg-gray-100 flex items-center justify-center text-gray-400">No images available</div>
              )}
            </div>

            {/* Stats */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <div className="flex flex-wrap gap-6 justify-around">
                {property.bedrooms && (
                  <div className="flex flex-col items-center gap-1">
                    <Bed className="w-6 h-6 text-primary" />
                    <span className="text-2xl font-bold text-gray-900">{property.bedrooms}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Bedrooms</span>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="flex flex-col items-center gap-1">
                    <Bath className="w-6 h-6 text-primary" />
                    <span className="text-2xl font-bold text-gray-900">{property.bathrooms}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Bathrooms</span>
                  </div>
                )}
                {property.parking && (
                  <div className="flex flex-col items-center gap-1">
                    <Car className="w-6 h-6 text-primary" />
                    <span className="text-2xl font-bold text-gray-900">{property.parking}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Parking</span>
                  </div>
                )}
                {property.houseSize && (
                  <div className="flex flex-col items-center gap-1">
                    <Square className="w-6 h-6 text-primary" />
                    <span className="text-2xl font-bold text-gray-900">{property.houseSize.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">House sqft</span>
                  </div>
                )}
                {property.landSize && (
                  <div className="flex flex-col items-center gap-1">
                    <LandPlot className="w-6 h-6 text-primary" />
                    <span className="text-2xl font-bold text-gray-900">{property.landSize.toLocaleString()}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Land sqft</span>
                  </div>
                )}
                {property.yearBuilt && (
                  <div className="flex flex-col items-center gap-1">
                    <Calendar className="w-6 h-6 text-primary" />
                    <span className="text-2xl font-bold text-gray-900">{property.yearBuilt}</span>
                    <span className="text-xs text-gray-500 uppercase tracking-wider">Year Built</span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4">About this Property</h3>
              <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{property.description}</p>
            </div>

            {/* Amenities & Nearby */}
            {(property.amenities?.length > 0 || property.nearbyFacilities?.length > 0) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {property.amenities?.length > 0 && (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-4">Amenities</h3>
                    <ul className="space-y-3">
                      {property.amenities.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {property.nearbyFacilities?.length > 0 && (
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-bold mb-4">Nearby Facilities</h3>
                    <ul className="space-y-3">
                      {property.nearbyFacilities.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-3 text-gray-700">
                          <CheckCircle2 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Video */}
            {property.video && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Video className="w-5 h-5 text-primary" /> Property Video
                </h3>
                <div className="aspect-video rounded-2xl overflow-hidden bg-black">
                  <video src={property.video} controls className="w-full h-full" />
                </div>
              </div>
            )}

            {/* Map */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-primary" /> Location
              </h3>
              <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-gray-100 relative">
                {/* Google Maps embed - will show a map or fallback message */}
                <iframe
                  title="Property Location"
                  width="100%"
                  height="100%"
                  loading="lazy"
                  className="absolute inset-0"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(`${property.address}, ${property.city}, ${property.district}`)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${property.address}, ${property.city}, ${property.district}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-primary mt-3 hover:underline"
              >
                <ExternalLink className="w-4 h-4" /> View on Google Maps
              </a>
            </div>

            {/* Related Properties */}
            {relatedProperties.length > 0 && (
              <div>
                <h3 className="text-xl font-bold mb-4">Similar Properties</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {relatedProperties.slice(0, 4).map((rel: any) => (
                    <Link key={rel.id} href={`/properties/${rel.id}`} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-md transition-all group flex">
                      <div className="w-28 h-28 flex-shrink-0 bg-gray-100 overflow-hidden">
                        {rel.images?.[0] ? (
                          <img src={getImageUrl(rel.images[0])} alt={rel.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : <div className="w-full h-full bg-gray-100" />}
                      </div>
                      <div className="p-4 flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">{rel.title}</p>
                        <p className="text-xs text-gray-500 flex items-center mt-1"><MapPin className="w-3 h-3 mr-1" />{rel.city}</p>
                        <p className="text-primary font-bold mt-2">{formatPrice(rel.price, rel.saleOrRent === 'Rent' ? 'rent' : 'sale')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">

            {/* Contact Form Card (sticky) */}
            <div className="sticky top-24">
              <ContactForm
                propertyId={property.id}
                propertyTitle={property.title}
                sellerName={property.user?.fullName || 'Property Owner'}
                sellerPhone={property.contactPhone}
                sellerEmail={property.contactEmail}
                whatsappNumber={property.whatsappNumber}
              />
            </div>

            {/* Recently Viewed */}
            {recentlyViewed.length > 0 && (
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-400" /> Recently Viewed
                </h3>
                <div className="space-y-3">
                  {recentlyViewed.map((rv: any) => (
                    <Link key={rv.id} href={`/properties/${rv.id}`} className="flex items-center gap-3 group">
                      <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                        {rv.images?.[0] ? (
                          <img src={getImageUrl(rv.images[0])} alt={rv.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : <div className="w-full h-full bg-gray-100" />}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 group-hover:text-primary transition-colors line-clamp-1">{rv.title}</p>
                        <p className="text-xs text-primary font-bold">{formatPrice(rv.price, rv.saleOrRent === 'Rent' ? 'rent' : 'sale')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
