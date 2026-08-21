'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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

export default function AddProperty() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
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
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Redirect non-admins
  if (!isLoading && (!isAuthenticated || user?.role !== 'ADMIN')) {
    router.push('/');
    return null;
  }


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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
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
      
      images.forEach(image => {
        data.append('images', image);
      });
      if (video) {
        data.append('video', video);
      }

      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/properties`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const result = await res.json();
      if (result.success) {
        setMessage({ text: isDraft ? 'Draft saved successfully!' : 'Property submitted for approval!', type: 'success' });
        setTimeout(() => router.push('/dashboard/properties'), 2000);
      } else {
        setMessage({ text: result.message || 'Failed to submit property', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred during submission', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="flex-1 py-12 bg-gradient-to-br from-light-gray to-gray-100 min-h-screen">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">Add New Property</h1>
          <p className="text-gray-600">Complete the steps below to list your property</p>
        </div>

        {/* Stepper */}
        <div className="relative mb-12 px-4">
          <div className="absolute top-5 left-0 w-full h-0.5 bg-gray-200 -z-10 px-8">
            <div 
              className="h-full bg-primary transition-all duration-500 ease-in-out"
              style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
            />
          </div>
          <div className="flex justify-between overflow-x-auto pb-4 relative z-10">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-col items-center min-w-[80px]">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300 shadow-sm ${
                  currentStep >= step.id ? 'bg-primary text-white scale-110 shadow-md' : 'bg-white border-2 border-gray-200 text-gray-400'
                }`}>
                  {currentStep > step.id ? <CheckCircle className="w-6 h-6" /> : step.icon}
                </div>
                <span className={`text-xs font-semibold tracking-wide transition-colors duration-300 ${currentStep >= step.id ? 'text-primary' : 'text-gray-400'}`}>
                  {step.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {message.text && (
          <div className={`p-4 rounded-xl mb-6 text-center ${message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
            {message.text}
          </div>
        )}

        {/* Form Content */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-gray-100 p-8 min-h-[400px]">
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
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Images (Multiple)</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors">
                      <input type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" id="images-upload" />
                      <label htmlFor="images-upload" className="cursor-pointer flex flex-col items-center">
                        <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                        <span className="text-primary font-medium">Click to upload images</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, up to 10MB</span>
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        {imagePreviews.map((preview, idx) => (
                          <div key={idx} className="relative group rounded-lg overflow-hidden border border-gray-200 aspect-video">
                            <img src={preview} alt="preview" className="w-full h-full object-cover" />
                            <button onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Property Video (Optional)</label>
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
                    {isSubmitting ? 'Submitting...' : 'Publish Listing'}
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
