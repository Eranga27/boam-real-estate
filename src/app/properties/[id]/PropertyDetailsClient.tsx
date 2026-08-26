'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import ContactForm from '@/components/ContactForm';
import {
  MapPin, Bed, Bath, Square, Calendar, CheckCircle2,
  Share2, ChevronLeft, ChevronRight, Car,
  LandPlot, ExternalLink, ArrowLeft, ImageOff, Check
} from 'lucide-react';
import { formatFullPrice, formatPrice, getImageUrl } from '@/lib/format';
import { getPropertyUrl } from '@/lib/site';

interface PropertyDetailsClientProps {
  property: any;
  relatedProperties: any[];
}

export default function PropertyDetailsClient({
  property,
  relatedProperties,
}: PropertyDetailsClientProps) {
  const [activeImage, setActiveImage] = useState(0);
  const [showShareToast, setShowShareToast] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  /** Native Web Share API + Clipboard Fallback using canonical production URL */
  const handleShare = async () => {
    if (typeof window === 'undefined' || !property) return;

    const canonicalUrl = getPropertyUrl(property.id);

    const shareData = {
      title: property.title,
      text: `Take a look at this property listed by BOAM Real Estates: ${property.title}`,
      url: canonicalUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // User cancelled or share dismissed
      }
    } else if (navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(canonicalUrl);
        setShowShareToast(true);
        setTimeout(() => setShowShareToast(false), 2500);
      } catch {
        window.prompt('Copy listing URL:', canonicalUrl);
      }
    }
  };

  const prevImage = () =>
    setActiveImage((i) => (i - 1 + (property?.images?.length || 1)) % (property?.images?.length || 1));
  const nextImage = () =>
    setActiveImage((i) => (i + 1) % (property?.images?.length || 1));

  if (!property) {
    return (
      <div className="min-h-screen bg-navy-50/50 flex flex-col items-center justify-center p-6 text-center pt-24">
        <div className="w-16 h-16 rounded-full bg-navy-100 flex items-center justify-center mb-4 text-navy-400">
          <ImageOff className="w-8 h-8" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mb-2">Property Not Found</h1>
        <p className="text-navy-800/60 max-w-md mx-auto mb-6 text-sm leading-relaxed">
          That listing may have been removed or is no longer available. Explore our available real estate portfolio.
        </p>
        <Link href="/search">
          <Button variant="primary" className="rounded-full bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold px-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Browse All Properties
          </Button>
        </Link>
      </div>
    );
  }

  const locationQuery = `${property.address || ''}, ${property.city || ''}, Sri Lanka`;
  const isLongDescription = property.description && property.description.length > 320;

  return (
    <div className="min-h-screen bg-navy-50/50 pt-20 sm:pt-24 pb-16">
      {/* Clipboard Toast Notification */}
      {showShareToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-2xl bg-navy-950 px-4 py-3 text-xs font-bold text-white shadow-2xl border border-navy-700">
          <Check className="w-4 h-4 text-amber-400" />
          <span>Listing link copied to clipboard</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Semantic Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 mb-4 sm:mb-6 text-xs sm:text-sm">
          <ol className="flex items-center gap-2 flex-wrap">
            <li>
              <Link href="/" className="text-navy-800/60 hover:text-navy-950 transition-colors font-medium">
                Home
              </Link>
            </li>
            <li className="text-navy-300">/</li>
            <li>
              <Link href="/search" className="text-navy-800/60 hover:text-navy-950 transition-colors font-medium">
                Properties
              </Link>
            </li>
            <li className="text-navy-300">/</li>
            <li>
              <span className="text-navy-800/60 font-medium">{property.propertyType}</span>
            </li>
            <li className="text-navy-300">/</li>
            <li>
              <span className="text-navy-950 font-semibold line-clamp-1 max-w-[200px] sm:max-w-[320px]">
                {property.title}
              </span>
            </li>
          </ol>
        </nav>

        {/* Header Title & Pricing Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-8 shadow-sm border border-navy-100/80 mb-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <Badge variant={property.saleOrRent === 'Sale' ? 'accent' : 'secondary'}>
                  For {property.saleOrRent}
                </Badge>
                <Badge variant="outline">{property.propertyType}</Badge>
                {property.negotiable && <Badge variant="gray">Negotiable</Badge>}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-navy-950 leading-tight">
                {property.title}
              </h1>
              <p className="flex items-center text-navy-800/70 text-xs sm:text-sm mt-2">
                <MapPin className="w-4 h-4 mr-1.5 flex-shrink-0 text-amber-500" aria-hidden="true" />
                {property.address}, {property.city}, {property.district}
              </p>
            </div>

            <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-3 md:pt-0 border-navy-100/80">
              <div className="text-2xl sm:text-3xl font-extrabold text-navy-950">
                {formatFullPrice(property.price)}
                {property.saleOrRent === 'Rent' && (
                  <span className="text-sm font-normal text-navy-800/60">/mo</span>
                )}
              </div>

              {/* Share Action Button */}
              <button
                type="button"
                onClick={handleShare}
                aria-label="Share property listing"
                className="inline-flex items-center gap-1.5 rounded-full border border-navy-200 bg-white px-4 py-2 text-xs font-bold text-navy-800 transition-all hover:border-navy-950 hover:bg-navy-950 hover:text-white mt-0 md:mt-3"
              >
                <Share2 className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Primary Details Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery / Video */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-navy-100/80">
              {property.video ? (
                <div className="relative aspect-[16/9] bg-black">
                  <video
                    src={getImageUrl(property.video)}
                    controls
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="w-full h-full object-contain"
                  />
                </div>
              ) : property.images && property.images.length > 0 ? (
                <>
                  <div className="relative aspect-[16/9] bg-navy-950">
                    <motion.img
                      key={activeImage}
                      src={getImageUrl(property.images[activeImage])}
                      alt={`${property.title} - Image ${activeImage + 1} of ${property.images.length}`}
                      className="w-full h-full object-cover"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                    {property.images.length > 1 && (
                      <div className="absolute inset-0 flex items-center justify-between px-3">
                        <button
                          onClick={prevImage}
                          className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                          aria-label="Previous image"
                        >
                          <ChevronLeft className="w-5 h-5 text-navy-950" />
                        </button>
                        <button
                          onClick={nextImage}
                          className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition-colors"
                          aria-label="Next image"
                        >
                          <ChevronRight className="w-5 h-5 text-navy-950" />
                        </button>
                      </div>
                    )}
                    <div className="absolute bottom-3 right-3 bg-navy-950/80 text-white text-[11px] font-bold px-3 py-1 rounded-full backdrop-blur-sm">
                      {activeImage + 1} / {property.images.length}
                    </div>
                  </div>
                  {property.images.length > 1 && (
                    <div className="flex gap-2 p-3.5 overflow-x-auto">
                      {property.images.map((img: string, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImage(idx)}
                          aria-label={`Select photo ${idx + 1}`}
                          className={`flex-shrink-0 w-20 h-14 rounded-xl overflow-hidden border-2 transition-all ${
                            activeImage === idx
                              ? 'border-amber-500 scale-95'
                              : 'border-transparent opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={getImageUrl(img)} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-[16/9] flex flex-col items-center justify-center bg-gradient-to-br from-navy-950 via-navy-900 to-navy-950 p-6 text-center">
                  <div className="w-12 h-12 rounded-full bg-navy-800 flex items-center justify-center mb-3 border border-navy-700">
                    <ImageOff className="w-6 h-6 text-amber-400" />
                  </div>
                  <span className="text-sm font-bold text-white/80 uppercase tracking-wider">
                    Image Unavailable
                  </span>
                  <span className="text-xs text-white/40 mt-1">
                    Please contact the BOAM broker for full imagery
                  </span>
                </div>
              )}
            </div>

            {/* Specifications */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-navy-100/80">
              <h2 className="text-xs font-extrabold uppercase tracking-widest text-amber-600 mb-4">
                Property Specifications
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 text-center">
                {property.beds > 0 && (
                  <div className="flex flex-col items-center p-3 bg-navy-50/70 rounded-2xl">
                    <Bed className="w-5 h-5 text-amber-500 mb-1" aria-hidden="true" />
                    <span className="text-xl font-bold text-navy-950">{property.beds}</span>
                    <span className="text-[11px] font-semibold text-navy-800/60 uppercase tracking-wider">
                      Bedrooms
                    </span>
                  </div>
                )}
                {property.baths > 0 && (
                  <div className="flex flex-col items-center p-3 bg-navy-50/70 rounded-2xl">
                    <Bath className="w-5 h-5 text-amber-500 mb-1" aria-hidden="true" />
                    <span className="text-xl font-bold text-navy-950">{property.baths}</span>
                    <span className="text-[11px] font-semibold text-navy-800/60 uppercase tracking-wider">
                      Bathrooms
                    </span>
                  </div>
                )}
                {property.parking > 0 && (
                  <div className="flex flex-col items-center p-3 bg-navy-50/70 rounded-2xl">
                    <Car className="w-5 h-5 text-amber-500 mb-1" aria-hidden="true" />
                    <span className="text-xl font-bold text-navy-950">{property.parking}</span>
                    <span className="text-[11px] font-semibold text-navy-800/60 uppercase tracking-wider">
                      Parking
                    </span>
                  </div>
                )}
                {property.pricePerPerch && (
                  <div className="flex flex-col items-center p-3 bg-navy-50/70 rounded-2xl">
                    <LandPlot className="w-5 h-5 text-amber-500 mb-1" aria-hidden="true" />
                    <span className="text-base font-bold text-navy-950 line-clamp-1">
                      {property.pricePerPerch}
                    </span>
                    <span className="text-[11px] font-semibold text-navy-800/60 uppercase tracking-wider">
                      Rate / Unit
                    </span>
                  </div>
                )}
                {property.landSize > 0 && (
                  <div className="flex flex-col items-center p-3 bg-navy-50/70 rounded-2xl">
                    <LandPlot className="w-5 h-5 text-amber-500 mb-1" aria-hidden="true" />
                    <span className="text-xl font-bold text-navy-950">
                      {property.landSize.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-navy-800/60 uppercase tracking-wider">
                      {property.landUnit === 'acres' ? 'Acres' : 'Perches'}
                    </span>
                  </div>
                )}
                {property.houseSize > 0 && (
                  <div className="flex flex-col items-center p-3 bg-navy-50/70 rounded-2xl">
                    <Square className="w-5 h-5 text-amber-500 mb-1" aria-hidden="true" />
                    <span className="text-xl font-bold text-navy-950">
                      {property.houseSize.toLocaleString()}
                    </span>
                    <span className="text-[11px] font-semibold text-navy-800/60 uppercase tracking-wider">
                      House sqft
                    </span>
                  </div>
                )}
                {property.yearBuilt > 0 && (
                  <div className="flex flex-col items-center p-3 bg-navy-50/70 rounded-2xl">
                    <Calendar className="w-5 h-5 text-amber-500 mb-1" aria-hidden="true" />
                    <span className="text-xl font-bold text-navy-950">{property.yearBuilt}</span>
                    <span className="text-[11px] font-semibold text-navy-800/60 uppercase tracking-wider">
                      Year Built
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-navy-100/80">
              <h2 className="text-xl font-extrabold text-navy-950 mb-3">About this Property</h2>
              <div className="relative">
                <p
                  className={`text-navy-800/80 text-sm sm:text-base leading-relaxed whitespace-pre-wrap ${
                    !isDescExpanded && isLongDescription ? 'line-clamp-5' : ''
                  }`}
                >
                  {property.description}
                </p>
                {isLongDescription && (
                  <button
                    type="button"
                    onClick={() => setIsDescExpanded(!isDescExpanded)}
                    className="mt-3 text-xs sm:text-sm font-bold text-amber-600 hover:text-amber-700 transition-colors"
                  >
                    {isDescExpanded ? 'Read less ↑' : 'Read more →'}
                  </button>
                )}
              </div>
            </div>

            {/* Amenities / Nearby */}
            {(property.amenities?.length > 0 || property.nearbyFacilities?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {property.amenities?.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-navy-100/80">
                    <h3 className="text-lg font-bold text-navy-950 mb-3">Amenities</h3>
                    <ul className="space-y-2.5">
                      {property.amenities.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-navy-800">
                          <CheckCircle2 className="w-4 h-4 text-sea-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {property.nearbyFacilities?.length > 0 && (
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-navy-100/80">
                    <h3 className="text-lg font-bold text-navy-950 mb-3">Nearby Facilities</h3>
                    <ul className="space-y-2.5">
                      {property.nearbyFacilities.map((item: string, i: number) => (
                        <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-navy-800">
                          <CheckCircle2 className="w-4 h-4 text-amber-500 flex-shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Google Map Embed */}
            <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-navy-100/80">
              <h3 className="text-lg font-bold text-navy-950 mb-3 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-amber-500" /> Location
              </h3>
              <div className="rounded-2xl overflow-hidden aspect-[16/9] bg-navy-100 relative">
                <iframe
                  title={`Map location for ${property.title}`}
                  width="100%"
                  height="100%"
                  loading="lazy"
                  className="absolute inset-0 w-full h-full"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  style={{ border: 0 }}
                  allowFullScreen
                />
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-navy-950 mt-3 hover:text-amber-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> View on Google Maps
              </a>
            </div>

            {/* Similar Properties */}
            {relatedProperties.length > 0 && (
              <div className="pt-4">
                <h3 className="text-xl font-extrabold text-navy-950 mb-4">Similar Properties</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {relatedProperties.slice(0, 4).map((rel: any) => (
                    <Link
                      key={rel.id}
                      href={`/properties/${rel.id}`}
                      className="bg-white rounded-2xl overflow-hidden shadow-sm border border-navy-100/80 hover:shadow-md transition-all group flex"
                    >
                      <div className="w-28 h-24 flex-shrink-0 bg-navy-900 overflow-hidden relative">
                        {rel.images?.[0] ? (
                          <img
                            src={getImageUrl(rel.images[0])}
                            alt={rel.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-white/50 bg-navy-950 font-semibold">
                            No Image
                          </div>
                        )}
                      </div>
                      <div className="p-3 flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-navy-950 line-clamp-1 group-hover:text-amber-600 transition-colors">
                            {rel.title}
                          </p>
                          <p className="text-[11px] text-navy-800/60 flex items-center mt-0.5">
                            <MapPin className="w-3 h-3 mr-1 text-amber-500" />
                            {rel.city}
                          </p>
                        </div>
                        <p className="text-xs sm:text-sm font-extrabold text-navy-950">
                          {formatPrice(rel.price, rel.saleOrRent === 'Rent' ? 'rent' : 'sale')}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar — Broker Contact */}
          <div className="space-y-6">
            <div className="sticky top-24">
              <ContactForm
                propertyId={property.id}
                propertyTitle={property.title}
                sellerName={property.user?.fullName || 'BOAM Real Estates'}
                sellerPhone={property.contactPhone}
                sellerEmail={property.contactEmail}
                whatsappNumber={property.whatsappNumber}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
