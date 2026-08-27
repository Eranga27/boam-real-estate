'use client';

import React from 'react';
import { Phone, Mail, MessageSquare, ShieldCheck, ArrowUpRight } from 'lucide-react';
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
  sellerName?: string;
  /** @deprecated — kept for API compat; ignored internally (use SITE_SEO via contact.ts) */
  sellerPhone?: string;
  /** @deprecated — kept for API compat; ignored internally (use SITE_SEO via contact.ts) */
  sellerEmail?: string;
  /** @deprecated — kept for API compat; ignored internally (use SITE_SEO via contact.ts) */
  whatsappNumber?: string;
}

export default function ContactForm({
  propertyId,
  propertyTitle,
  sellerName = 'BOAM Real Estates',
}: ContactFormProps) {
  const phoneHref = getPhoneHref();
  const whatsAppHref = getPropertyWhatsAppHref(propertyId, propertyTitle);
  const emailHref = getPropertyEmailHref(propertyId, propertyTitle);

  return (
    <div className="bg-white rounded-3xl shadow-md border border-navy-100/80 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-br from-navy-900 via-navy-950 to-navy-900 p-6 text-white">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400">
            Direct Broker Access
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            <ShieldCheck className="w-3 h-3" /> Verified Listing
          </span>
        </div>
        <h3 className="text-xl font-extrabold text-white tracking-tight">{sellerName}</h3>
        <p className="text-xs text-navy-200/80 mt-1">
          Connect directly with our agent for immediate assistance.
        </p>
      </div>

      {/* Action List */}
      <div className="p-6 space-y-3">
        {/* Primary Action: Call Broker */}
        <a
          href={phoneHref}
          aria-label="Call BOAM broker directly"
          className="group relative flex items-center justify-between p-4 rounded-2xl bg-navy-900 text-white font-bold transition-all duration-200 hover:bg-navy-950 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 min-h-[52px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-navy-950 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Phone className="w-5 h-5 fill-current" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Primary Action</p>
              <p className="text-base font-black text-white leading-snug">Call {BROKER_PHONE_DISPLAY}</p>
            </div>
          </div>
          <ArrowUpRight className="w-5 h-5 text-amber-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </a>

        {/* Secondary Action 1: WhatsApp */}
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact BOAM broker on WhatsApp"
          className="group flex items-center justify-between p-4 rounded-2xl bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-950 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 min-h-[50px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-emerald-900">WhatsApp Broker</p>
              <p className="text-[11px] font-medium text-emerald-700/90">Start instant conversation</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-emerald-700 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </a>

        {/* Secondary Action 2: Email Broker */}
        <a
          href={emailHref}
          aria-label="Send email to BOAM broker"
          className="group flex items-center justify-between p-4 rounded-2xl bg-navy-50/80 hover:bg-navy-100/80 border border-navy-100 text-navy-950 transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-navy-950 focus:ring-offset-2 min-h-[50px]"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-navy-900 text-amber-400 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-extrabold text-navy-950">Email Broker</p>
              <p className="text-[11px] font-medium text-navy-700/80 truncate max-w-[180px]">
                {BROKER_EMAIL_DISPLAY}
              </p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-navy-600 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
        </a>
      </div>
    </div>
  );
}
