'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { MapPin, Bed, Bath, Square, Calendar, Phone, Mail, CheckCircle2, Video } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PropertyDetails() {
  const params = useParams();
  const id = params.id as string;
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/v1/properties/${id}`);
        const data = await res.json();
        if (data.success) {
          setProperty(data.data);
        }
      } catch (err) {
        console.error('Error fetching property', err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading property details...</div>;
  }

  if (!property) {
    return <div className="min-h-screen flex items-center justify-center">Property not found.</div>;
  }

  return (
    <main className="min-h-screen bg-light-gray py-12">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Badge variant={property.saleOrRent === 'Sale' ? 'accent' : 'secondary'}>
                  For {property.saleOrRent}
                </Badge>
                <Badge variant="outline">{property.propertyType}</Badge>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">{property.title}</h1>
              <div className="flex items-center text-gray-500">
                <MapPin className="w-4 h-4 mr-1" />
                <span>{property.address}, {property.city}, {property.district}</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-primary">
                ${property.price.toLocaleString()}
                {property.saleOrRent === 'Rent' && <span className="text-lg font-normal text-gray-500"> /mo</span>}
              </div>
              {property.negotiable && (
                <div className="text-sm text-gray-500 mt-1">Price is negotiable</div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Images & Details */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Image Gallery */}
            <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100">
              {property.images && property.images.length > 0 ? (
                <>
                  <div className="relative aspect-video rounded-2xl overflow-hidden mb-4">
                    <img 
                      src={property.images[activeImage]} 
                      alt="Property" 
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-2">
                    {property.images.map((img: string, idx: number) => (
                      <button 
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`relative w-24 h-24 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImage === idx ? 'border-primary shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-2xl flex items-center justify-center text-gray-400">
                  No images available
                </div>
              )}
            </div>

            {/* Overview Stats */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-wrap gap-8 justify-between items-center">
              {property.bedrooms && (
                <div className="flex flex-col items-center">
                  <Bed className="w-6 h-6 text-primary mb-2" />
                  <span className="font-bold text-xl">{property.bedrooms}</span>
                  <span className="text-xs text-gray-500 uppercase">Beds</span>
                </div>
              )}
              {property.bathrooms && (
                <div className="flex flex-col items-center">
                  <Bath className="w-6 h-6 text-primary mb-2" />
                  <span className="font-bold text-xl">{property.bathrooms}</span>
                  <span className="text-xs text-gray-500 uppercase">Baths</span>
                </div>
              )}
              {property.houseSize && (
                <div className="flex flex-col items-center">
                  <Square className="w-6 h-6 text-primary mb-2" />
                  <span className="font-bold text-xl">{property.houseSize}</span>
                  <span className="text-xs text-gray-500 uppercase">Sq Ft</span>
                </div>
              )}
              {property.yearBuilt && (
                <div className="flex flex-col items-center">
                  <Calendar className="w-6 h-6 text-primary mb-2" />
                  <span className="font-bold text-xl">{property.yearBuilt}</span>
                  <span className="text-xs text-gray-500 uppercase">Built</span>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold mb-4">About this property</h3>
              <p className="text-gray-600 whitespace-pre-wrap leading-relaxed">
                {property.description}
              </p>
            </div>

            {/* Amenities & Facilities */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {property.amenities && property.amenities.length > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">Amenities</h3>
                  <ul className="space-y-3">
                    {property.amenities.map((item: string, i: number) => (
                      <li key={i} className="flex items-center text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-green-500 mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {property.nearbyFacilities && property.nearbyFacilities.length > 0 && (
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <h3 className="text-xl font-bold mb-4">Nearby Facilities</h3>
                  <ul className="space-y-3">
                    {property.nearbyFacilities.map((item: string, i: number) => (
                      <li key={i} className="flex items-center text-gray-600">
                        <CheckCircle2 className="w-5 h-5 text-blue-500 mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            
            {/* Video (if available) */}
            {property.video && (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-4 flex items-center">
                  <Video className="w-5 h-5 mr-2 text-primary" /> Property Video
                </h3>
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-black">
                  <video src={property.video} controls className="w-full h-full" />
                </div>
              </div>
            )}
            
          </div>

          {/* Sidebar: Contact Info */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="text-xl font-bold mb-6">Contact Agent</h3>
              
              {property.user && (
                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-gray-200 overflow-hidden">
                    {property.user.profilePicture ? (
                      <img src={property.user.profilePicture} alt="Agent" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xl">
                        {property.user.fullName.charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="font-bold text-lg">{property.user.fullName}</div>
                    <div className="text-sm text-gray-500">Listing Agent</div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                <a href={`tel:${property.contactPhone}`} className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-primary shadow-sm mr-4">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Phone</div>
                    <div className="font-semibold text-gray-900">{property.contactPhone}</div>
                  </div>
                </a>
                
                <a href={`mailto:${property.contactEmail}`} className="flex items-center p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm mr-4">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">Email</div>
                    <div className="font-semibold text-gray-900 truncate max-w-[200px]">{property.contactEmail}</div>
                  </div>
                </a>

                {property.whatsappNumber && (
                  <a href={`https://wa.me/${property.whatsappNumber.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 rounded-xl bg-green-50 hover:bg-green-100 transition-colors">
                    <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-green-600 shadow-sm mr-4">
                      <Phone className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs text-green-700 font-medium uppercase tracking-wider">WhatsApp</div>
                      <div className="font-semibold text-green-900">{property.whatsappNumber}</div>
                    </div>
                  </a>
                )}
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </main>
  );
}
