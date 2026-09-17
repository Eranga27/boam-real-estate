import React from 'react';
import Link from 'next/link';

import {
  ClockIcon,
  FacebookIcon,
  InstagramIcon,
  LinkedinIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from 'lucide-react';
import { Logo } from '../brand/Logo';
import {
  getPhoneHref,
  getSecondaryPhoneHref,
  getEmailHref,
  BROKER_NAME,
  BROKER_NAME_SECONDARY,
  BROKER_PHONE_DISPLAY,
  BROKER_PHONE_SECONDARY_DISPLAY,
  BROKER_EMAIL_DISPLAY,
} from '@/lib/contact';

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'Properties', to: '/search' },
  { label: 'Contact', to: getPhoneHref(), isExternal: true },
];

const services = [
  'Buyer Representation',
  'Rental Placement',
  'Property Valuation',
  'Title & Legal Checks',
  'Relocation Advisory',
];

export function Footer() {
  return (
    <footer className="bg-navy-900 text-white">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo variant="light" />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              A Sri Lankan brokerage with an exclusive, personally verified portfolio across
              Colombo, Kandy, Galle, Negombo and Jaffna. Every listing is inspected by our own
              agents before it goes live.
            </p>
            <div className="mt-6 flex gap-2">
              {[
                { Icon: FacebookIcon, label: 'Facebook', href: 'https://web.facebook.com/profile.php?id=61594265795138' },
                { Icon: InstagramIcon, label: 'Instagram', href: '#' },
                { Icon: LinkedinIcon, label: 'LinkedIn', href: '#' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href !== '#' ? '_blank' : undefined}
                  rel={href !== '#' ? 'noopener noreferrer' : undefined}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-white/80 transition-all hover:-translate-y-0.5 hover:bg-amber-500 hover:text-navy-900"
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                </a>
              ))}
            </div>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">
              Quick Links
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  {link.isExternal ? (
                    <a
                      href={link.to}
                      className="text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      href={link.to}
                      className="text-white/65 transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">
              Services
            </h2>
            <ul className="mt-5 space-y-3 text-sm text-white/65">
              {services.map((service) => (
                <li key={service}>{service}</li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-500">
              Contact
            </h2>
            <ul className="mt-5 space-y-4 text-sm text-white/65">
              <li className="flex gap-3">
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                <span>
                  No. 8, Kuda Edanda Road,
                  <br />
                  Wattala, Sri Lanka.
                </span>
              </li>
              <li className="flex gap-3">
                <PhoneIcon className="mt-1 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                <div className="space-y-2.5">
                  <a
                    href={getPhoneHref()}
                    className="group block transition-colors"
                  >
                    <span className="block text-xs font-medium text-white/50 group-hover:text-amber-400 transition-colors">
                      {BROKER_NAME}
                    </span>
                    <span className="font-semibold text-white/90 group-hover:text-white transition-colors whitespace-nowrap">
                      {BROKER_PHONE_DISPLAY}
                    </span>
                  </a>
                  <a
                    href={getSecondaryPhoneHref()}
                    className="group block transition-colors"
                  >
                    <span className="block text-xs font-medium text-white/50 group-hover:text-amber-400 transition-colors">
                      {BROKER_NAME_SECONDARY}
                    </span>
                    <span className="font-semibold text-white/90 group-hover:text-white transition-colors whitespace-nowrap">
                      {BROKER_PHONE_SECONDARY_DISPLAY}
                    </span>
                  </a>
                </div>
              </li>
              <li className="flex gap-3">
                <MailIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                <a href={getEmailHref()} className="transition-colors hover:text-white">
                  {BROKER_EMAIL_DISPLAY}
                </a>
              </li>
              <li className="flex gap-3">
                <ClockIcon className="mt-0.5 h-4 w-4 shrink-0 text-white/40" aria-hidden="true" />
                <span>Mon – Sat, 9.00 am – 6.30 pm</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© {new Date().getFullYear()} Boam Real-Estates (Pvt) Ltd. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="transition-colors hover:text-white">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-white">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
