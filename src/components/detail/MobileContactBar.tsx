'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Phone, MessageSquare } from 'lucide-react';
import { getPhoneHref, getPropertyWhatsAppHref } from '@/lib/contact';

interface MobileContactBarProps {
  propertyId: string;
  propertyTitle: string;
}

export function MobileContactBar({ propertyId, propertyTitle }: MobileContactBarProps) {
  const phoneHref = getPhoneHref();
  const whatsAppHref = getPropertyWhatsAppHref(propertyId, propertyTitle);

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white/95 backdrop-blur-md border-t border-navy-100 shadow-2xl px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))]"
    >
      <div className="max-w-md mx-auto grid grid-cols-2 gap-3">
        {/* Call Broker Button */}
        <a
          href={phoneHref}
          aria-label="Call BOAM broker"
          className="min-h-[44px] h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-navy-900 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all hover:bg-navy-950 active:scale-98 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
        >
          <Phone className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>Call Broker</span>
        </a>

        {/* WhatsApp Button */}
        <a
          href={whatsAppHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contact BOAM broker on WhatsApp"
          className="min-h-[44px] h-12 w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-white font-bold text-xs sm:text-sm tracking-wide shadow-md transition-all hover:bg-emerald-700 active:scale-98 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2"
        >
          <MessageSquare className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
          <span>WhatsApp</span>
        </a>
      </div>
    </motion.div>
  );
}

export default MobileContactBar;
