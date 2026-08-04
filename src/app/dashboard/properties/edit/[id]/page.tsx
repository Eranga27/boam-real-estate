'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Home, MapPin, List, Phone, Image as ImageIcon, CheckCircle, ChevronRight, ChevronLeft, X } from 'lucide-react';

const steps = [
  { id: 1, name: 'Basic Info', icon: <Home className="w-5 h-5" /> },
  { id: 2, name: 'Features', icon: <List className="w-5 h-5" /> },
  { id: 3, name: 'Location', icon: <MapPin className="w-5 h-5" /> },
  { id: 4, name: 'Contact', icon: <Phone className="w-5 h-5" /> },
  { id: 5, name: 'Media', icon: <ImageIcon className="w-5 h-5" /> },
];

export default function EditProperty() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const propertyId = params.id as string;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [formData, setFormData] = useState({
    title: '', description: '', propertyType: 'House', saleOrRent: 'Sale', price: '', negotiable: false,
    bedrooms: '', bathrooms: '', parking: '', landSize: '', houseSize: '', yearBuilt: '',
    address: '', district: '', city: '',
    amenities: '', nearbyFacilities: '',
    contactPhone: '', contactEmail: '', whatsappNumber: ''
  });

  const [images, setImages] = useState<File[]>([]);
  const [video, setVideo] = useState<File | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated && propertyId) {
      fetchPropertyDetails();
    }
  }, [isAuthenticated, propertyId]);

  const fetchPropertyDetails = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/properties/${propertyId}`);
      const result = await res.json();
      
      if (result.success) {
        const p = result.data;
        setFormData({
          title: p.title || '',
          description: p.description || '',
          propertyType: p.propertyType || 'House',
          saleOrRent: p.saleOrRent || 'Sale',
          price: p.price ? p.price.toString() : '',
          negotiable: p.negotiable || false,
          bedrooms: p.bedrooms ? p.bedrooms.toString() : '',
          bathrooms: p.bathrooms ? p.bathrooms.toString() : '',
          parking: p.parking ? p.parking.toString() : '',
          landSize: p.landSize ? p.landSize.toString() : '',
          houseSize: p.houseSize ? p.houseSize.toString() : '',
          yearBuilt: p.yearBuilt ? p.yearBuilt.toString() : '',
          address: p.address || '',
          district: p.district || '',
          city: p.city || '',
          amenities: p.amenities ? p.amenities.join(', ') : '',
          nearbyFacilities: p.nearbyFacilities ? p.nearbyFacilities.join(', ') : '',
          contactPhone: p.contactPhone || '',
          contactEmail: p.contactEmail || '',
          whatsappNumber: p.whatsappNumber || ''
        });
        
        if (p.images && p.images.length > 0) {
          setExistingImages(p.images);
        }
      } else {
        setMessage({ text: 'Failed to load property details', type: 'error' });
      }
    } catch (error) {
      console.error(error);
      setMessage({ text: 'An error occurred while fetching property details', type: 'error' });
    } finally {
      setIsFetching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImages(prev => [...prev, ...filesArray]);
      
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setImagePreviews(prev => [...prev, ...previews]);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (isDraft: boolean) => {
    setIsSubmitting(true);
    setMessage({ text: '', type: '' });
    try {
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value.toString());
      });
      data.append('isDraft', isDraft.toString());
      
      // If we want to support deleting existing images on the backend, we would pass existingImages
      // For now, if images are uploaded, they are appended.
      images.forEach(image => {
        data.append('images', image);
      });
      if (video) {
        data.append('video', video);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/properties/${propertyId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ text: 'Property updated successfully!', type: 'success' });
        setTimeout(() => router.push('/dashboard/properties'), 2000);
      } else {
        setMessage({ text: result.message || 'Failed to update property', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred during update', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isFetching) {
    return <div className="min-h-screen flex items-center justify-center">Loading property details...</div>;
  }

  return (
    <main className="flex-1 py-24 bg-light-gray min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Edit Property</h1>
          <p className="text-gray-600">Update the details of your property listing</p>
        </div>

        {/* Stepper */}
        <div className="flex justify-between mb-8 overflow-x-auto pb-4">
          {steps.map((step) => (
            <div key={step.id} className="flex flex-col items-center min-w-[80px]">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors ${
                currentStep >= step.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.icon}
              </div>
              <span className={`text-xs font-medium ${currentStep >= step.id ? 'text-primary' : 'text-gray-500'}`}>
                {step.name}
              </span>
            </div>
          ))}
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[400px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 1 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b pb-2">Basic Information</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Property Title *</label>
                    <Input name="title" value={formData.title} onChange={handleInputChange} placeholder="e.g. Luxury Villa in Beverly Hills" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                    <textarea 
                      name="description" 
                      value={formData.description} 
                      onChange={handleInputChange} 
                      rows={4}
                      className="w-full rounded-lg border border-gray-200 p-3 focus:ring-2 focus:ring-primary outline-none"
                      placeholder="Describe your property..."
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                      <select name="propertyType" value={formData.propertyType} onChange={handleInputChange} className="w-full h-12 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-primary">
                        <option value="House">House</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Condo">Condo</option>
                        <option value="Land">Land</option>
                        <option value="Commercial">Commercial</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Sale or Rent</label>
                      <select name="saleOrRent" value={formData.saleOrRent} onChange={handleInputChange} className="w-full h-12 rounded-lg border border-gray-200 px-3 outline-none focus:ring-2 focus:ring-primary">
                        <option value="Sale">For Sale</option>
                        <option value="Rent">For Rent</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price ($) *</label>
                      <Input name="price" type="number" value={formData.price} onChange={handleInputChange} placeholder="e.g. 500000" required />
                    </div>
                    <div className="flex items-center h-full pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" name="negotiable" checked={formData.negotiable} onChange={handleInputChange} className="w-5 h-5 text-primary rounded" />
                        <span className="text-gray-700">Price is Negotiable</span>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b pb-2">Features & Details</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bedrooms</label>
                      <Input name="bedrooms" type="number" value={formData.bedrooms} onChange={handleInputChange} placeholder="e.g. 3" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Bathrooms</label>
                      <Input name="bathrooms" type="number" value={formData.bathrooms} onChange={handleInputChange} placeholder="e.g. 2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Parking Spots</label>
                      <Input name="parking" type="number" value={formData.parking} onChange={handleInputChange} placeholder="e.g. 2" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Land Size (sqft)</label>
                      <Input name="landSize" type="number" value={formData.landSize} onChange={handleInputChange} placeholder="e.g. 5000" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">House Size (sqft)</label>
                      <Input name="houseSize" type="number" value={formData.houseSize} onChange={handleInputChange} placeholder="e.g. 2500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                      <Input name="yearBuilt" type="number" value={formData.yearBuilt} onChange={handleInputChange} placeholder="e.g. 2020" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma separated)</label>
                    <Input name="amenities" value={formData.amenities} onChange={handleInputChange} placeholder="e.g. Pool, Gym, Garden" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nearby Facilities (comma separated)</label>
                    <Input name="nearbyFacilities" value={formData.nearbyFacilities} onChange={handleInputChange} placeholder="e.g. School, Hospital, Mall" />
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b pb-2">Location</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Address *</label>
                    <Input name="address" value={formData.address} onChange={handleInputChange} placeholder="123 Main St, Appt 4B" required />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                      <Input name="city" value={formData.city} onChange={handleInputChange} placeholder="Los Angeles" required />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District / State *</label>
                      <Input name="district" value={formData.district} onChange={handleInputChange} placeholder="CA" required />
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b pb-2">Contact Information</h2>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone *</label>
                    <Input name="contactPhone" type="tel" value={formData.contactPhone} onChange={handleInputChange} placeholder="+1 234 567 890" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contact Email *</label>
                    <Input name="contactEmail" type="email" value={formData.contactEmail} onChange={handleInputChange} placeholder="agent@example.com" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp Number</label>
                    <Input name="whatsappNumber" type="tel" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="+1 234 567 890" />
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold border-b pb-2">Media Upload</h2>
                  
                  {existingImages.length > 0 && (
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">Existing Images</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {existingImages.map((imgUrl, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video">
                            <img src={imgUrl} alt="existing" className="w-full h-full object-cover" />
                            <button onClick={() => removeExistingImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Add New Images</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="images-upload" />
                      <label htmlFor="images-upload" className="cursor-pointer flex flex-col items-center">
                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-primary font-medium">Click to upload additional images</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, up to 10MB</span>
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video">
                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                            <button onClick={() => removeNewImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Update Property Video</label>
                    <Input type="file" accept="video/*" onChange={(e) => { if (e.target.files) setVideo(e.target.files[0]) }} />
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center mt-10 pt-6 border-t border-gray-100">
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
              disabled={currentStep === 1 || isSubmitting}
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            
            <div className="flex gap-4">
              {currentStep === 5 ? (
                <>
                  <Button variant="secondary" onClick={() => handleSubmit(true)} disabled={isSubmitting}>
                    Save as Draft
                  </Button>
                  <Button variant="accent" onClick={() => handleSubmit(false)} disabled={isSubmitting}>
                    {isSubmitting ? 'Updating...' : 'Update & Publish Listing'}
                  </Button>
                </>
              ) : (
                <Button onClick={() => setCurrentStep(prev => Math.min(steps.length, prev + 1))}>
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
