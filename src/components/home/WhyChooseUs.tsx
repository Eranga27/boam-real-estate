'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { GemIcon, HandshakeIcon, ScrollTextIcon } from 'lucide-react';

const reasons = [
{
  icon: GemIcon,
  title: 'Exclusive, off-market listings',
  body:
  'Roughly two in three homes on our books are never advertised publicly. Owners bring them to us first, so you see them before the market does.',
  stat: '68% off-market'
},
{
  icon: ScrollTextIcon,
  title: 'Every title verified before listing',
  body:
  'Our legal team checks deeds, survey plans, local authority approvals and outstanding rates. If a property does not clear, it never reaches this site.',
  stat: '100% checked'
},
{
  icon: HandshakeIcon,
  title: 'One broker, start to finish',
  body:
  'No call-centre handoffs. A single named agent handles your viewings, negotiation and transfer, and stays reachable on WhatsApp throughout.',
  stat: '1 dedicated agent'
}];


export function WhyChooseUs() {
  return (
    <section className="relative bg-navy-800 py-20 lg:py-28">
      {/* Popular → WhyChooseUs dissolve */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-navy-50/80 to-transparent" />
      {/* WhyChooseUs → HowItWorks dissolve */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-white/15 to-transparent" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500">
            Why Boam
          </p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-[2.5rem]">
            Why buyers choose us
          </h2>
        </div>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {reasons.map((reason, i) =>
          <motion.div
            key={reason.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-80px' }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="group flex gap-5 rounded-3xl border border-white/10 bg-white/[0.04] p-7 transition-all hover:-translate-y-1 hover:border-amber-500/40 hover:bg-white/[0.07] lg:flex-col">
            
              <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-amber-500 text-navy-900 transition-transform group-hover:scale-105">
                <reason.icon className="h-6 w-6" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-amber-400">
                  {reason.stat}
                </p>
                <h3 className="mt-2 text-lg font-bold text-white">{reason.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-white/60">{reason.body}</p>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>);

}