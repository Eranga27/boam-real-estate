'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2Icon, LoaderCircleIcon, MessageCircleIcon, PhoneIcon } from 'lucide-react';
import { Logo } from '../brand/Logo';
import type { Property } from '@/types/property';

export function InquirySidebar({ property }: {property: Property;}) {
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    window.setTimeout(() => setStatus('sent'), 1100);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-3xl bg-navy-800 p-6 text-white">
        <div className="flex items-center justify-between gap-4">
          <Logo variant="light" />
          <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-400">
            Listing agent
          </span>
        </div>
        <p className="mt-5 text-sm leading-relaxed text-white/65">
          <span className="font-semibold text-white">Nuwan Perera</span> handles this property and
          typically replies within 3 hours on working days.
        </p>
        <div className="mt-5 flex flex-col gap-2 sm:flex-row">
          <a
            href="tel:+94777801470"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-white/10 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20">
            
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            Call
          </a>
          <a
            href="https://wa.me/94777801470"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-sea-500 px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-sea-600">
            
            <MessageCircleIcon className="h-4 w-4" aria-hidden="true" />
            WhatsApp
          </a>
        </div>
      </div>

      <div className="rounded-3xl bg-white p-6 shadow-card ring-1 ring-navy-100">
        {status === 'sent' ?
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="py-6 text-center">
          
            <CheckCircle2Icon className="mx-auto h-11 w-11 text-sea-500" aria-hidden="true" />
            <h2 className="mt-4 text-lg font-bold text-navy-800">Inquiry sent</h2>
            <p className="mt-2 text-sm leading-relaxed text-navy-800/60">
              Nuwan will be in touch about {property.title.split(' ').slice(0, 4).join(' ')}… shortly.
            </p>
            <button
            type="button"
            onClick={() => setStatus('idle')}
            className="mt-5 text-sm font-bold text-navy-800 underline decoration-amber-500 decoration-2 underline-offset-4">
            
              Send another inquiry
            </button>
          </motion.div> :

        <form onSubmit={submit} className="space-y-3">
            <div>
              <h2 className="text-lg font-bold text-navy-800">Inquire about this property</h2>
              <p className="mt-1 text-sm text-navy-800/55">Ref: {property.id.toUpperCase()}</p>
            </div>
            {[
          { id: 'inq-name', label: 'Full name', type: 'text', placeholder: 'Amara Fernando' },
          { id: 'inq-email', label: 'Email', type: 'email', placeholder: 'anilbwt26@yahoo.com' },
          { id: 'inq-phone', label: 'Phone', type: 'tel', placeholder: '+94 777 80 1470' }].
          map((field) =>
          <div key={field.id}>
                <label
              htmlFor={field.id}
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-800/45">
              
                  {field.label}
                </label>
                <input
              id={field.id}
              type={field.type}
              required
              placeholder={field.placeholder}
              className="mt-1.5 w-full rounded-xl border border-navy-200 px-4 py-3 text-sm font-medium text-navy-900 placeholder:text-navy-800/35 transition-colors focus:border-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-800/10" />
            
              </div>
          )}
            <div>
              <label
              htmlFor="inq-message"
              className="text-[11px] font-bold uppercase tracking-[0.14em] text-navy-800/45">
              
                Message
              </label>
              <textarea
              id="inq-message"
              rows={3}
              defaultValue={`I'd like to arrange a viewing of ${property.title}.`}
              className="mt-1.5 w-full resize-none rounded-xl border border-navy-200 px-4 py-3 text-sm font-medium text-navy-900 transition-colors focus:border-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-800/10" />
            
            </div>
            <button
            type="submit"
            disabled={status === 'sending'}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-3.5 text-sm font-bold text-navy-900 transition-all hover:bg-amber-400 disabled:opacity-70">
            
              {status === 'sending' &&
            <LoaderCircleIcon className="h-4 w-4 animate-spin" aria-hidden="true" />
            }
              {status === 'sending' ? 'Sending…' : 'Inquire Now'}
            </button>
            <p className="text-center text-[11px] leading-relaxed text-navy-800/45">
              By inquiring you agree to be contacted by a Boam broker about this listing.
            </p>
          </form>
        }
      </div>
    </div>);

}