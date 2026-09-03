'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { districts } from '@/data/properties';
import {
  Home,
  Trees,
  Building2,
  CheckCircle2,
  Send,
  MapPin,
  Ruler,
  User,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

export default function PropertyRequestClient() {
  const [formData, setFormData] = useState({
    lookingFor: 'House', // 'House' | 'Land' | 'Either'
    district: districts[0] || 'Colombo',
    customArea: '',
    minBudget: '',
    maxBudget: '',
    sizeInPerches: '',
    name: '',
    email: '',
    phone: '',
    note: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
      setErrorMsg('Please fill in your name, email, and phone number.');
      return;
    }

    setLoading(true);
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL ||
      (typeof window !== 'undefined' ? '' : 'http://localhost:5000');

    try {
      const res = await fetch(`${apiUrl}/api/v1/requests`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setErrorMsg(data.message || 'Failed to submit request. Please try again.');
      }
    } catch {
      setErrorMsg('A network error occurred. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSubmitted(false);
    setFormData({
      lookingFor: 'House',
      district: districts[0] || 'Colombo',
      customArea: '',
      minBudget: '',
      maxBudget: '',
      sizeInPerches: '',
      name: '',
      email: '',
      phone: '',
      note: '',
    });
    setErrorMsg('');
  };

  return (
    <main className="min-h-screen bg-navy-50/60 pt-24 sm:pt-28 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-500/10 text-amber-700 border border-amber-500/20 text-xs font-extrabold uppercase tracking-widest mb-3">
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            Tailored Property Sourcing
          </span>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-navy-950">
            Request a Property
          </h1>
          <p className="mt-3 text-base sm:text-lg text-navy-800/70 leading-relaxed">
            Can’t find a house or land matching your needs? Tell us what you’re looking for, and our team will source options or notify you the moment a matching property is listed.
          </p>
        </div>

        {/* Content Container */}
        <div className="bg-white rounded-3xl shadow-xl shadow-navy-900/5 border border-navy-100 overflow-hidden">
          {submitted ? (
            /* Success State */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-8 sm:p-14 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 flex items-center justify-center mx-auto mb-6 shadow-inner">
                <CheckCircle2 className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
                Property Request Submitted!
              </h2>
              <p className="mt-3 text-sm sm:text-base text-navy-800/70 max-w-lg mx-auto leading-relaxed">
                Thank you, <strong className="text-navy-900 font-bold">{formData.name}</strong>. We have received your request for a{' '}
                <span className="font-semibold text-amber-700">{formData.lookingFor}</span> in{' '}
                <span className="font-semibold text-amber-700">
                  {formData.district} {formData.customArea ? `(${formData.customArea})` : ''}
                </span>
                . Our property specialists are reviewing our database and off-market listings, and will get in touch with you shortly.
              </p>

              <div className="mt-8 pt-8 border-t border-navy-100 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="/search"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-navy-950 px-7 py-3.5 text-sm font-bold text-white transition-all hover:bg-navy-900 shadow-md"
                >
                  Explore Current Properties
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                </Link>
                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-2xl border border-navy-200 bg-white px-6 py-3.5 text-sm font-bold text-navy-800 transition-colors hover:bg-navy-50"
                >
                  <RefreshCw className="w-4 h-4 text-navy-400" />
                  Submit Another Request
                </button>
              </div>
            </motion.div>
          ) : (
            /* Form View */
            <form onSubmit={handleSubmit} className="p-6 sm:p-10 space-y-8">
              {errorMsg && (
                <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Requirement Type */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-3">
                  1. What type of property are you looking for? <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'House', label: 'House', icon: Home },
                    { value: 'Land', label: 'Land', icon: Trees },
                    { value: 'Either', label: 'Either', icon: Building2 },
                  ].map((item) => {
                    const Icon = item.icon;
                    const selected = formData.lookingFor === item.value;
                    return (
                      <button
                        key={item.value}
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, lookingFor: item.value }))}
                        className={`flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 p-4 rounded-2xl border-2 transition-all ${
                          selected
                            ? 'border-amber-500 bg-amber-500/10 text-navy-950 font-bold shadow-sm'
                            : 'border-navy-100 bg-white text-navy-700 hover:border-navy-200 hover:bg-navy-50/50'
                        }`}
                      >
                        <Icon className={`w-5 h-5 ${selected ? 'text-amber-600' : 'text-navy-400'}`} />
                        <span className="text-xs sm:text-sm font-bold">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Location Preference */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="district" className="block text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-2">
                    2. Preferred District <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
                    <select
                      id="district"
                      name="district"
                      value={formData.district}
                      onChange={handleChange}
                      className="w-full h-12 pl-10 pr-4 rounded-2xl border border-navy-200 bg-white text-sm text-navy-900 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    >
                      {districts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                      <option value="Other">Other / Flexible</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label htmlFor="customArea" className="block text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-2">
                    Specific Town / Area <span className="text-navy-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      type="text"
                      id="customArea"
                      name="customArea"
                      value={formData.customArea}
                      onChange={handleChange}
                      placeholder="e.g. Katugastota, Nugegoda, Beachfront"
                      className="w-full h-12 pl-10 pr-4 rounded-2xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Budget & Size */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div>
                  <label htmlFor="minBudget" className="block text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-2">
                    Min Budget (LKR) <span className="text-navy-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-navy-500">Rs.</span>
                    <input
                      type="number"
                      id="minBudget"
                      name="minBudget"
                      value={formData.minBudget}
                      onChange={handleChange}
                      placeholder="e.g. 10000000"
                      className="w-full h-12 pl-11 pr-4 rounded-2xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="maxBudget" className="block text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-2">
                    Max Budget (LKR) <span className="text-navy-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-extrabold text-navy-500">Rs.</span>
                    <input
                      type="number"
                      id="maxBudget"
                      name="maxBudget"
                      value={formData.maxBudget}
                      onChange={handleChange}
                      placeholder="e.g. 50000000"
                      className="w-full h-12 pl-11 pr-4 rounded-2xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="sizeInPerches" className="block text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-2">
                    Land Size (Perches) <span className="text-navy-400 font-normal">(Optional)</span>
                  </label>
                  <div className="relative">
                    <Ruler className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                    <input
                      type="number"
                      id="sizeInPerches"
                      name="sizeInPerches"
                      value={formData.sizeInPerches}
                      onChange={handleChange}
                      placeholder="e.g. 15"
                      className="w-full h-12 pl-10 pr-4 rounded-2xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="pt-2 border-t border-navy-100">
                <p className="text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-4">
                  3. Your Contact Details <span className="text-red-500">*</span>
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div>
                    <label htmlFor="name" className="block text-xs font-semibold text-navy-700 mb-1.5">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="John Doe"
                        className="w-full h-12 pl-10 pr-4 rounded-2xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold text-navy-700 mb-1.5">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@example.com"
                        className="w-full h-12 pl-10 pr-4 rounded-2xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-xs font-semibold text-navy-700 mb-1.5">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+94 77 123 4567"
                        className="w-full h-12 pl-10 pr-4 rounded-2xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Free text note */}
              <div>
                <label htmlFor="note" className="block text-xs font-extrabold uppercase tracking-wider text-navy-900 mb-2">
                  4. Additional Notes or Specific Requirements <span className="text-navy-400 font-normal">(Optional)</span>
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3.5 top-4 w-4 h-4 text-navy-400" />
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={formData.note}
                    onChange={handleChange}
                    placeholder="e.g. Prefer 3+ bedrooms, clear deeds, main road access..."
                    className="w-full pl-10 pr-4 py-3 rounded-2xl border border-navy-200 bg-white text-sm text-navy-900 placeholder:text-navy-300 focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2.5 rounded-2xl bg-amber-500 px-8 py-4 text-base font-extrabold text-navy-950 transition-all hover:bg-amber-400 active:scale-[0.99] shadow-lg shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-navy-950 border-t-transparent rounded-full animate-spin" />
                      <span>Submitting Request...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Submit Property Request</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
