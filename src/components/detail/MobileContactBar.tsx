'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageCircle } from 'lucide-react';
import { getPhoneHref, getPropertyWhatsAppHref } from '@/lib/contact';

interface MobileContactBarProps {
  propertyId: string;
  propertyTitle: string;
  /** Short price shown beside the buttons, e.g. "LKR 45 Mn" */
  price?: string;
  negotiable?: boolean;
}

export function MobileContactBar({ propertyId, propertyTitle, price, negotiable }: MobileContactBarProps) {
  const phoneHref = getPhoneHref();
  const whatsAppHref = getPropertyWhatsAppHref(propertyId, propertyTitle);

  return (
    <motion.div
      initial={{ y: 90 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="mobile-contact-bar fixed bottom-0 left-0 right-0 z-40 border-t border-navy-100 bg-white px-4 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] pt-3 shadow-[0_-12px_30px_-18px_rgba(8,26,46,0.35)] md:hidden"
    >
      <div className="mx-auto flex max-w-md items-center gap-2.5">
        {price && (
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-navy-800/50">{negotiable ? 'Negotiable' : 'Asking'}</p>
            <p className="truncate text-[19px] font-extrabold leading-tight tracking-tight text-navy-950">{price}</p>
          </div>
        )}
        <a
          href={phoneHref}
          aria-label="Call BOAM broker"
          className={`flex h-12 items-center justify-center gap-2 rounded-2xl bg-navy-950 font-bold text-white transition active:scale-[0.97] ${
            price ? 'w-12 shrink-0' : 'flex-1 text-sm'
          }`}
        >
          <Phone className="h-[18px] w-[18px] text-amber-400" aria-hidden="true" />
          {!price && <span>Call Broker</span>}
        </a>
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact BOAM broker on WhatsApp"
          className={`flex h-12 items-center justify-center gap-2 rounded-2xl bg-[#1f9d55] px-5 text-sm font-bold text-white transition active:scale-[0.97] ${price ? 'shrink-0' : 'flex-1'}`}
        >
          <MessageCircle className="h-[18px] w-[18px]" aria-hidden="true" />
          WhatsApp
        </a>
      </div>
    </motion.div>
  );
}

export default MobileContactBar;
