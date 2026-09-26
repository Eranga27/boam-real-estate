'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus, Search, Building2, CheckCircle2, XCircle, Star, Trash2, Edit3,
  ExternalLink, Image as ImageIcon, Video, Upload, AlertCircle, Check, Loader2, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { invalidatePropertiesCache } from '@/lib/api';
import { getImageUrl } from '@/lib/format';
import { optimizedImage } from '@/lib/listingImages';
import { RichDescription } from '@/components/listing-detail/ListingSections';

const STATUS_OPTIONS = [
  { value: 'PUBLISHED', label: 'Published' },
  { value: 'PENDING_APPROVAL', label: 'Pending approval' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'REJECTED', label: 'Rejected' },
];

/** Table thumbnail: Base64 photos are already in memory; hosted ones are fetched small */
function thumbSrc(src: string): string {
  return src.startsWith('data:') ? src : optimizedImage(getImageUrl(src), 256);
}

const DISTRICTS = [
  'Colombo', 'Kandy', 'Galle', 'Gampaha', 'Kalutara', 'Matara', 'Hambantota',
  'Nuwara Eliya', 'Badulla', 'Ratnapura', 'Kegalle', 'Kurunegala', 'Puttalam',
  'Anuradhapura', 'Polonnaruwa', 'Jaffna', 'Kilinochchi', 'Mannar', 'Vavuniya',
  'Mullaitivu', 'Batticaloa', 'Ampara', 'Trincomalee', 'Moneragala', 'Central Province'
];

export default function AdminListingsPage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(() =>
    typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('status') || ''
  );
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Modal / Form state
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [successLink, setSuccessLink] = useState<string | null>(null);
  const [descriptionTab, setDescriptionTab] = useState<'write' | 'preview'>('write');
  const [loadingPhotos, setLoadingPhotos] = useState(false);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [propertyType, setPropertyType] = useState('Land');
  const [saleOrRent, setSaleOrRent] = useState('Sale');
  const [price, setPrice] = useState('');
  const [pricePerPerch, setPricePerPerch] = useState('');
  const [landSize, setLandSize] = useState('');
  const [landUnit, setLandUnit] = useState('perches');
  const [district, setDistrict] = useState('Colombo');
  const [city, setCity] = useState('');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  
  // Media Files & Thumbnail
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [thumbnailIndex, setThumbnailIndex] = useState<number>(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [existingVideo, setExistingVideo] = useState<string | null>(null);
  const [removeVideo, setRemoveVideo] = useState(false);

  const getApiUrl = () => {
    if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL.replace(/\/$/, '');
    if (typeof window !== 'undefined') {
      return '';
    }
    return 'http://localhost:5000';
  };

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      const res = await fetch(
        `${apiUrl}/api/v1/admin/properties?page=${page}&limit=12&search=${encodeURIComponent(search)}&status=${statusFilter}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const data = await res.json();
      if (data.success && data.data) {
        setProperties(data.data.properties || []);
        setTotalPages(data.data.pages || 1);
      }
    } catch (err) {
      console.error('Failed to fetch admin properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, [page, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProperties();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(files);
      setThumbnailIndex(0);

      // Generate previews
      const previews = files.map((file) => URL.createObjectURL(file));
      setImagePreviews(previews);
    }
  };

  const openAddModal = () => {
    setEditingId(null);
    setTitle('');
    setDescription('');
    setPropertyType('Land');
    setSaleOrRent('Sale');
    setPrice('');
    setPricePerPerch('');
    setLandSize('');
    setLandUnit('perches');
    setDistrict('Colombo');
    setCity('');
    setAddress('');
    setLatitude('');
    setLongitude('');
    setContactNumber('');
    setImageFiles([]);
    setImagePreviews([]);
    setThumbnailIndex(0);
    setVideoFile(null);
    setExistingVideo(null);
    setRemoveVideo(false);
    setFormError('');
    setDescriptionTab('write');
    setShowModal(true);
  };

  const openEditModal = (p: any) => {
    setEditingId(p.id);
    setTitle(p.title || '');
    setDescription(p.description || '');
    setPropertyType(p.propertyType || 'Land');
    setSaleOrRent(p.saleOrRent || 'Sale');
    setPrice(p.price ? p.price.toString() : '');
    setPricePerPerch(p.pricePerPerch || '');
    setLandSize(p.landSize ? p.landSize.toString() : '');
    setLandUnit(p.landUnit || 'perches');
    setDistrict(p.district || 'Colombo');
    setCity(p.city || '');
    setAddress(p.address || '');
    setLatitude(p.latitude ? p.latitude.toString() : '');
    setLongitude(p.longitude ? p.longitude.toString() : '');
    setContactNumber(p.contactPhone || '');
    setImageFiles([]);
    setImagePreviews((p.images || []).map((src: string) => getImageUrl(src)));
    setThumbnailIndex(0);
    setVideoFile(null);
    setExistingVideo(p.video || null);
    setRemoveVideo(false);
    setFormError('');
    setDescriptionTab('write');
    setShowModal(true);

    // The table carries one photo per listing; load them all for the cover picker
    if ((p.imageCount ?? p.images?.length ?? 0) > (p.images?.length ?? 0)) {
      setLoadingPhotos(true);
      fetch(`${getApiUrl()}/api/v1/properties/${encodeURIComponent(p.id)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json?.success && Array.isArray(json.data?.images)) {
            setImagePreviews(json.data.images.map((src: string) => getImageUrl(src)));
          }
        })
        .catch(() => {})
        .finally(() => setLoadingPhotos(false));
    }
  };

  const triggerRevalidation = async (id?: string) => {
    try {
      invalidatePropertiesCache();
      await fetch('/api/revalidate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          paths: ['/', '/search', '/buy', '/rent', '/properties']
        })
      });
    } catch (err) {
      console.warn('On-demand revalidation trigger failed:', err);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();

      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('propertyType', propertyType);
      formData.append('saleOrRent', saleOrRent);
      formData.append('price', price);
      if (pricePerPerch) formData.append('pricePerPerch', pricePerPerch);
      if (landSize) formData.append('landSize', landSize);
      formData.append('landUnit', landUnit);
      formData.append('district', district);
      formData.append('city', city);
      formData.append('address', address || city);
      if (latitude) formData.append('latitude', latitude);
      if (longitude) formData.append('longitude', longitude);
      if (contactNumber) formData.append('contactPhone', contactNumber);
      
      formData.append('thumbnailIndex', thumbnailIndex.toString());

      // Append image files
      imageFiles.forEach((file) => {
        formData.append('images', file);
      });

      // Append video if attached or flag removal
      if (videoFile) {
        formData.append('video', videoFile);
      } else if (removeVideo) {
        formData.append('removeVideo', 'true');
      }

      let res: Response;
      if (editingId) {
        res = await fetch(`${apiUrl}/api/v1/properties/${editingId}`, {
          method: 'PUT',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      } else {
        res = await fetch(`${apiUrl}/api/v1/properties`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        });
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || 'Failed to save listing');
      }

      const createdId = data.data?.id || editingId;

      // Bust client cache and trigger Next.js ISR revalidation
      invalidatePropertiesCache();
      await triggerRevalidation(createdId);

      setSuccessMsg(editingId ? 'Listing updated successfully!' : 'Listing published directly to live site!');
      setSuccessLink(createdId ? `/properties/${createdId}` : null);
      setTimeout(() => setSuccessMsg(''), 8000);

      setShowModal(false);
      fetchProperties();
    } catch (err: any) {
      setFormError(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing from the live site?')) return;
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/v1/admin/properties/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        invalidatePropertiesCache();
        await triggerRevalidation(id);
        fetchProperties();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (id: string, status: string, isFeatured: boolean) => {
    // Show the change at once; the list reloads from the server afterwards
    setProperties((list) => list.map((p) => (p.id === id ? { ...p, status, isFeatured } : p)));
    try {
      const token = localStorage.getItem('token');
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/v1/admin/properties/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ status, isFeatured })
      });
      if (!res.ok) throw new Error('Update failed');
      invalidatePropertiesCache();
      await triggerRevalidation(id);
      setSuccessMsg(status === 'PUBLISHED' ? 'Listing updated. Changes are live on the site.' : 'Listing updated. It is hidden from search until published.');
      setSuccessLink(null);
      setTimeout(() => setSuccessMsg(''), 5000);
    } catch (err) {
      setSuccessMsg('');
      alert('Could not update the listing. Please try again.');
    } finally {
      fetchProperties();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">Listing Control Panel</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Add, edit, or remove properties instantly on the live website without code commits or redeploys.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={openAddModal}
            className="bg-amber-500 hover:bg-amber-400 text-navy-950 font-extrabold shadow-md rounded-xl px-5 py-2.5 flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Listing</span>
          </Button>
        </div>
      </div>

      {/* Toast Notification */}
      {successMsg && (
        <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/30 flex items-center gap-3 text-green-700 text-sm font-bold animate-in fade-in duration-200">
          <CheckCircle2 className="w-5 h-5 text-green-600" />
          <span>{successMsg}</span>
          {successLink && (
            <Link href={successLink} target="_blank" className="ml-auto inline-flex items-center gap-1 underline underline-offset-4 hover:text-green-800">
              View on site <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          )}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3.5 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
          >
            <option value="">All Statuses</option>
            <option value="PUBLISHED">Published</option>
            <option value="PENDING_APPROVAL">Pending Approval</option>
            <option value="DRAFT">Draft</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <button
            onClick={() => fetchProperties()}
            title="Refresh list"
            className="p-2 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
          <input
            type="text"
            placeholder="Search by title, city..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-2.5" />
        </form>
      </div>

      {/* Listings Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/60 border-b border-gray-200 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-6">Property / Title</th>
                <th className="py-4 px-6">Location</th>
                <th className="py-4 px-6">Price</th>
                <th className="py-4 px-6">Status</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <Loader2 className="w-8 h-8 text-amber-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : properties.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500">
                    No listings found. Click <b>"Create New Listing"</b> above to add one!
                  </td>
                </tr>
              ) : (
                properties.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-12 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200 relative">
                          {p.images?.[0] ? (
                            <img src={thumbSrc(p.images[0])} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="w-6 h-6 m-3 text-gray-300" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/properties/${p.id}`}
                            target="_blank"
                            className="font-bold text-gray-900 hover:text-amber-600 transition-colors flex items-center gap-1 line-clamp-1"
                          >
                            <span>{p.title}</span>
                            <ExternalLink className="w-3 h-3 text-gray-400 shrink-0" />
                          </Link>
                          <p className="text-xs text-gray-500 mt-0.5 font-medium">
                            {p.propertyType} • For {p.saleOrRent}
                            {typeof p.imageCount === 'number' && ` • ${p.imageCount} photo${p.imageCount === 1 ? '' : 's'}`}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 font-medium text-gray-700">
                      {p.city}, {p.district}
                    </td>
                    <td className="py-4 px-6 font-bold text-gray-900">
                      LKR {p.price ? p.price.toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-4 px-6">
                      {/* Only published listings appear in search and on the homepage */}
                      <select
                        value={p.status}
                        onChange={(e) => handleStatusToggle(p.id, e.target.value, !!p.isFeatured)}
                        aria-label={`Status of ${p.title}`}
                        className={`rounded-full border-0 py-1 pl-2.5 pr-7 text-[10px] font-extrabold uppercase tracking-wider focus:outline-none focus:ring-2 focus:ring-amber-500/40 ${
                          p.status === 'PUBLISHED' ? 'bg-green-100 text-green-800' :
                          p.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-800' :
                          p.status === 'REJECTED' ? 'bg-red-50 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleStatusToggle(p.id, p.status, !p.isFeatured)}
                          aria-pressed={!!p.isFeatured}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            p.isFeatured ? 'border-amber-300 bg-amber-50 text-amber-600 hover:bg-amber-100' : 'border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-gray-700'
                          }`}
                          title={p.isFeatured ? 'Featured on the homepage (click to remove)' : 'Feature on the homepage'}
                        >
                          <Star className={`w-4 h-4 ${p.isFeatured ? 'fill-amber-500' : ''}`} />
                        </button>
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-100 transition-colors"
                          title="Edit Listing"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-xs font-semibold text-gray-500">Page {page} of {totalPages}</p>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>Previous</Button>
              <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>Next</Button>
            </div>
          </div>
        )}
      </div>

      {/* CREATE / EDIT LISTING MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-gray-100 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-6">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  {editingId ? 'Edit Listing Details' : 'Add New Property Listing'}
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Fills out DB fields and publishes instantly to the live website.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSubmitForm} className="space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Listing Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Prime 400-Perch Investment Opportunity"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Property Type *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
                  >
                    <option value="Land">Land</option>
                    <option value="House">House</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Commercial">Commercial</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Purpose *
                  </label>
                  <select
                    value={saleOrRent}
                    onChange={(e) => setSaleOrRent(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
                  >
                    <option value="Sale">For Sale</option>
                    <option value="Rent">For Rent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Total Price (LKR) *
                  </label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 160000000"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Price Per Perch / Rate (Optional)
                  </label>
                  <input
                    type="text"
                    value={pricePerPerch}
                    onChange={(e) => setPricePerPerch(e.target.value)}
                    placeholder="e.g. Rs. 400,000 per perch"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Land Size
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={landSize}
                    onChange={(e) => setLandSize(e.target.value)}
                    placeholder="e.g. 400"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Land Unit
                  </label>
                  <select
                    value={landUnit}
                    onChange={(e) => setLandUnit(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
                  >
                    <option value="perches">Perches</option>
                    <option value="acres">Acres</option>
                  </select>
                </div>
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    District *
                  </label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30 bg-white"
                  >
                    {DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    City / Town *
                  </label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="e.g. Katukithula, Nuwara Eliya"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Latitude (Lat)
                  </label>
                  <input
                    type="text"
                    value={latitude}
                    onChange={(e) => setLatitude(e.target.value)}
                    placeholder="e.g. 7.0421"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Longitude (Lng)
                  </label>
                  <input
                    type="text"
                    value={longitude}
                    onChange={(e) => setLongitude(e.target.value)}
                    placeholder="e.g. 80.6234"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Contact Phone Number
                  </label>
                  <input
                    type="text"
                    value={contactNumber}
                    onChange={(e) => setContactNumber(e.target.value)}
                    placeholder="e.g. 0777123456"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                </div>
              </div>

              {/* Description, with a preview of how the listing page lays it out */}
              <div className="border-t border-gray-100 pt-4">
                <div className="mb-1 flex items-center justify-between gap-3">
                  <label htmlFor="listing-description" className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                    Full Property Description *
                  </label>
                  <div className="flex rounded-lg bg-gray-100 p-0.5 text-xs font-bold" role="tablist" aria-label="Description view">
                    {(['write', 'preview'] as const).map((tab) => (
                      <button
                        key={tab}
                        type="button"
                        role="tab"
                        aria-selected={descriptionTab === tab}
                        onClick={() => setDescriptionTab(tab)}
                        className={`rounded-md px-3 py-1 capitalize transition-colors ${descriptionTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                </div>
                {descriptionTab === 'write' ? (
                  <textarea
                    id="listing-description"
                    required
                    rows={10}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder={'A spacious four-bedroom house with **private balconies**...\n\n### Property Features\n🔹 **Land Extent:** 14 Perches\n🔹 **Bedrooms:** 4'}
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-amber-500/30"
                  />
                ) : (
                  <div className="max-h-[420px] overflow-y-auto rounded-xl border border-gray-200 bg-navy-50/50 p-5">
                    {description.trim() ? (
                      <RichDescription text={description} collapsible={false} />
                    ) : (
                      <p className="text-sm text-gray-400">Nothing to preview yet.</p>
                    )}
                  </div>
                )}
                <p className="mt-1.5 text-[11px] leading-relaxed text-gray-500">
                  <b>**bold**</b> for emphasis · <b>### Heading</b> for a section title · one item per line starting with 🔹 or - for a bullet list ·
                  a blank line starts a new paragraph. A first line in CAPITALS is treated as the title and not repeated on the page.
                </p>
              </div>

              {/* Media Upload & Thumbnail Selection */}
              <div className="border-t border-gray-100 pt-4 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Property Images (Multi-upload)
                  </label>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100"
                  />
                </div>

                {editingId && (
                  <p className="text-[11px] text-gray-500 -mt-2">
                    Choosing new photos replaces all of this listing&apos;s current photos. To keep them, leave this empty.
                  </p>
                )}

                {/* Image Previews with Thumbnail Selector */}
                {loadingPhotos && (
                  <p className="flex items-center gap-2 text-xs font-medium text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading this listing&apos;s photos…
                  </p>
                )}
                {imagePreviews.length > 0 && (
                  <div>
                    <p className="text-xs font-bold text-gray-700 mb-2">
                      Click a photo to make it the <span className="text-amber-600">★ Main Thumbnail</span>, the cover shown on listing cards and at the top of the listing page:
                    </p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {imagePreviews.map((src, idx) => (
                        <div
                          key={idx}
                          onClick={() => setThumbnailIndex(idx)}
                          className={`relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all ${
                            thumbnailIndex === idx
                              ? 'border-amber-500 ring-2 ring-amber-500/40 scale-[0.98]'
                              : 'border-gray-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <img src={src} alt="" className="w-full h-full object-cover" />
                          {thumbnailIndex === idx && (
                            <div className="absolute top-1.5 left-1.5 bg-amber-500 text-navy-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-md">
                              ★ Main Thumbnail
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1">
                    Video Upload (Optional)
                  </label>
                  {existingVideo && !removeVideo && (
                    <div className="flex items-center justify-between p-2.5 mb-2 bg-navy-50 rounded-xl border border-navy-100 text-xs">
                      <span className="text-navy-900 font-medium truncate max-w-[240px]">
                        Attached Video: {existingVideo.split('/').pop()}
                      </span>
                      <button
                        type="button"
                        onClick={() => setRemoveVideo(true)}
                        className="text-red-600 hover:text-red-700 font-bold ml-2 underline text-[11px]"
                      >
                        Remove Video
                      </button>
                    </div>
                  )}
                  {removeVideo && (
                    <div className="flex items-center justify-between p-2.5 mb-2 bg-red-50 text-red-700 rounded-xl border border-red-100 text-xs">
                      <span>Video will be removed on save</span>
                      <button
                        type="button"
                        onClick={() => setRemoveVideo(false)}
                        className="text-navy-700 hover:text-navy-900 font-bold ml-2 underline text-[11px]"
                      >
                        Undo
                      </button>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      setVideoFile(e.target.files?.[0] || null);
                      if (e.target.files?.[0]) setRemoveVideo(false);
                    }}
                    className="w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-navy-50 file:text-navy-900 hover:file:bg-navy-100"
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="border-t border-gray-100 pt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className="rounded-xl px-5"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-amber-500 hover:bg-amber-400 text-navy-950 font-extrabold rounded-xl px-6 flex items-center gap-2 shadow-md disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Publishing to Live Site...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>{editingId ? 'Save & Revalidate' : 'Publish Listing Directly'}</span>
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
