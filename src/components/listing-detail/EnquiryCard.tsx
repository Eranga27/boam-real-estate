'use client';

import React from 'react';
import { ArrowUpRight, CalendarCheck, Mail, MessageCircle, Phone, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import type { ListingDetail } from '@/lib/listings';
import {
  BROKER_PHONE_DISPLAY,
  getPhoneHref,
  getPropertyEmailHref,
  getPropertyViewingWhatsAppHref,
  getPropertyWhatsAppHref,
} from '@/lib/contact';

/** Sticky sidebar card: the price again, and every way to reach a broker about this listing */
export function EnquiryCard({ listing }: { listing: ListingDetail }) {
  const price = formatPrice(listing.price, listing.saleOrRent === 'Rent' ? 'rent' : 'sale');

  return (
    <div className="relative overflow-hidden rounded-[28px] bg-navy-950 p-6 text-white shadow-lift">
      <div aria-hidden="true" className="search-glow absolute -right-24 -top-24 h-64 w-64 rounded-full opacity-80" />

      <div className="relative">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.24em] text-amber-400">Interested?</p>
        <p className="mt-3 text-[34px] font-extrabold leading-none tracking-tight">{price}</p>
        <p className="mt-2 text-[13px] font-medium text-white/55">
          {[listing.negotiable ? 'Price negotiable' : null, listing.pricePerPerch].filter(Boolean).join(' · ') || 'Asking price'}
        </p>

        <div className="mt-6 space-y-2.5">
          <a
            href={getPhoneHref()}
            className="group flex h-14 items-center justify-between rounded-2xl bg-amber-500 pl-5 pr-2 text-navy-950 transition hover:bg-amber-400"
          >
            <span className="flex items-center gap-3">
              <Phone className="h-[18px] w-[18px] fill-navy-950" aria-hidden="true" />
              <span className="leading-tight">
                <span className="block text-[11px] font-bold uppercase tracking-[0.14em] opacity-70">Call a broker</span>
                <span className="block text-[15px] font-extrabold">{BROKER_PHONE_DISPLAY}</span>
              </span>
            </span>
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-navy-950 text-amber-400 transition-transform duration-500 group-hover:rotate-45">
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </a>

          <a
            href={getPropertyViewingWhatsAppHref(listing.id, listing.title)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-12 items-center gap-3 rounded-2xl bg-white/[0.06] px-5 text-[14px] font-bold ring-1 ring-white/10 transition hover:bg-white/[0.12]"
          >
            <CalendarCheck className="h-[18px] w-[18px] text-amber-400" aria-hidden="true" />
            Arrange a viewing
          </a>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={getPropertyWhatsAppHref(listing.id, listing.title)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1f9d55] text-[14px] font-bold transition hover:bg-[#1a8a4a]"
            >
              <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
              WhatsApp
            </a>
            <a
              href={getPropertyEmailHref(listing.id, listing.title)}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-white/[0.06] text-[14px] font-bold ring-1 ring-white/10 transition hover:bg-white/[0.12]"
            >
              <Mail className="h-[18px] w-[18px] text-amber-400" aria-hidden="true" />
              Email
            </a>
          </div>
        </div>

        <p className="mt-6 flex items-center gap-2 border-t border-white/10 pt-5 text-[12px] font-medium text-white/55">
          <ShieldCheck className="h-4 w-4 text-sea-400" aria-hidden="true" />
          Verified listing, presented by BOAM Real Estates
        </p>
      </div>
    </div>
  );
}
