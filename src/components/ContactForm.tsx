'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, CheckCircle, AlertCircle, Loader2, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  getPhoneHref,
  getPropertyEmailHref,
  getPropertyWhatsAppHref,
  BROKER_PHONE_DISPLAY,
  BROKER_EMAIL_DISPLAY,
} from '@/lib/contact';

interface ContactFormProps {
  propertyId: string;
  propertyTitle: string;
  sellerName: string;
  /** @deprecated — kept for API compat; ignored internally (use SITE_SEO via contact.ts) */
  sellerPhone?: string;
  /** @deprecated — kept for API compat; ignored internally (use SITE_SEO via contact.ts) */
  sellerEmail?: string;
  /** @deprecated — kept for API compat; ignored internally (use SITE_SEO via contact.ts) */
  whatsappNumber?: string;
}

type FormState = 'idle' | 'loading' | 'success' | 'error';

export default function ContactForm({
  propertyId,
  propertyTitle,
  sellerName,
}: ContactFormProps) {
  const { user, isAuthenticated } = useAuth();
  const [formState, setFormState] = useState<FormState>('idle');
  const [responseMsg, setResponseMsg] = useState('');

  const [fields, setFields] = useState({
    senderName: '',
    senderEmail: '',
    senderPhone: '',
    message: `Hi, I'm interested in this property and would like to get more details. Please contact me at your earliest convenience.`,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Pre-fill if authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      setFields((prev) => ({
        ...prev,
        senderName: user.fullName || '',
        senderEmail: user.email || '',
        senderPhone: user.mobileNumber || '',
      }));
    }
  }, [isAuthenticated, user]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!fields.senderName.trim()) newErrors.senderName = 'Name is required';
    if (!fields.senderEmail.trim()) {
      newErrors.senderEmail = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.senderEmail)) {
      newErrors.senderEmail = 'Enter a valid email address';
    }
    if (!fields.message.trim() || fields.message.trim().length < 10) {
      newErrors.message = 'Message must be at least 10 characters';
    }
    if (fields.message.trim().length > 1000) {
      newErrors.message = 'Message must not exceed 1000 characters';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFields((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFormState('loading');
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/inquiries/${propertyId}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(fields),
      });

      const data = await res.json();

      if (data.success) {
        setFormState('success');
        setResponseMsg(data.message || 'Your inquiry has been sent!');
      } else if (res.status === 429) {
        setFormState('error');
        setResponseMsg('Too many inquiries sent. Please wait an hour before trying again.');
      } else {
        setFormState('error');
        setResponseMsg(data.message || 'Failed to send inquiry. Please try again.');
      }
    } catch {
      setFormState('error');
      setResponseMsg('Network error. Please check your connection and try again.');
    }
  };

  const handleReset = () => {
    setFormState('idle');
    setResponseMsg('');
    setFields((prev) => ({ ...prev, message: `Hi, I'm interested in this property and would like to get more details. Please contact me at your earliest convenience.` }));
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-navy-100/80 overflow-hidden">
      {/* Seller Quick Contact Header */}
      <div className="bg-gradient-to-br from-navy-900 to-navy-950 p-6 text-white">
        <p className="text-sm font-medium text-amber-400/90 uppercase tracking-wider mb-1">Contact Seller</p>
        <h3 className="text-xl font-bold mb-4">{sellerName}</h3>

        <div className="space-y-3">
          <a
            href={getPhoneHref()}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-amber-400/90">Call Direct</p>
              <p className="font-semibold text-sm">{BROKER_PHONE_DISPLAY}</p>
            </div>
          </a>

          <a
            href={getPropertyEmailHref(propertyId, propertyTitle)}
            className="flex items-center gap-3 p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-amber-400/90">Email</p>
              <p className="font-semibold text-sm truncate max-w-[200px]">{BROKER_EMAIL_DISPLAY}</p>
            </div>
          </a>

          <a
              href={getPropertyWhatsAppHref(propertyId, propertyTitle)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 rounded-xl bg-green-500/80 hover:bg-green-500 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-green-100">WhatsApp</p>
                <p className="font-semibold text-sm">{BROKER_PHONE_DISPLAY}</p>
              </div>
            </a>
        </div>
      </div>

      {/* Inquiry Form */}
      <div className="p-6">
        <div className="flex items-center gap-2 mb-5">
          <MessageSquare className="w-5 h-5 text-amber-600" />
          <h4 className="font-bold text-navy-950">Send an Inquiry</h4>
        </div>

        <AnimatePresence mode="wait">
          {formState === 'success' ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-lg font-bold text-navy-950 mb-2">Inquiry Sent!</h4>
              <p className="text-navy-800/70 text-sm mb-6 leading-relaxed">{responseMsg}</p>
              <Button variant="outline" onClick={handleReset} className="text-sm">
                Send Another Inquiry
              </Button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onSubmit={handleSubmit}
              className="space-y-4"
              noValidate
            >
              {formState === 'error' && (
                <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{responseMsg}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5">
                  Your Name *
                </label>
                <Input
                  name="senderName"
                  value={fields.senderName}
                  onChange={handleChange}
                  placeholder="John Smith"
                  className={errors.senderName ? 'border-red-400 focus:ring-red-300' : ''}
                />
                {errors.senderName && <p className="text-red-500 text-xs mt-1">{errors.senderName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5">
                  Email Address *
                </label>
                <Input
                  name="senderEmail"
                  type="email"
                  value={fields.senderEmail}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  className={errors.senderEmail ? 'border-red-400 focus:ring-red-300' : ''}
                />
                {errors.senderEmail && <p className="text-red-500 text-xs mt-1">{errors.senderEmail}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5">
                  Phone Number <span className="text-navy-400 font-normal normal-case">(optional)</span>
                </label>
                <Input
                  name="senderPhone"
                  type="tel"
                  value={fields.senderPhone}
                  onChange={handleChange}
                  placeholder="+94 777 80 1470"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-navy-700 uppercase tracking-wider mb-1.5">
                  Message *
                  <span className={`float-right font-normal normal-case ${fields.message.length > 900 ? 'text-red-400' : 'text-navy-400'}`}>
                    {fields.message.length}/1000
                  </span>
                </label>
                <textarea
                  name="message"
                  value={fields.message}
                  onChange={handleChange}
                  rows={5}
                  maxLength={1000}
                  className={`w-full rounded-xl border p-3 text-sm outline-none focus:ring-2 resize-none transition-colors ${
                    errors.message
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-navy-200 focus:ring-navy-950/30 focus:border-navy-950'
                  }`}
                  placeholder="Describe your requirements..."
                />
                {errors.message && <p className="text-red-500 text-xs mt-1">{errors.message}</p>}
              </div>

              <Button
                type="submit"
                disabled={formState === 'loading'}
                className="w-full flex items-center justify-center gap-2"
              >
                {formState === 'loading' ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" /> Send Inquiry
                  </>
                )}
              </Button>

              <p className="text-xs text-navy-400 text-center">
                {isAuthenticated ? 'Sending as ' + user?.fullName : 'You can send without signing up'}
                {' '}· Your details are shared only with the seller.
              </p>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
