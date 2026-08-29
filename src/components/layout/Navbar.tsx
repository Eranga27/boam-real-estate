'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, PhoneIcon, XIcon } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { getPhoneHref, BROKER_PHONE_DISPLAY } from '@/lib/contact';

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(!isHome);
  const [open, setOpen] = useState(false);

  const links = [
    { to: '/', label: 'Home' },
    { to: '/search', label: 'Properties' },
  ];

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-350 ease-in-out ${
        solid
          ? 'bg-white shadow-[0_2px_15px_-3px_rgba(14,42,73,0.06)] border-b border-navy-100/80 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" aria-label="BOAM Real-Estates home" className="transition-transform hover:scale-[0.98]">
          <Logo variant={solid ? 'dark' : 'light'} />
        </Link>

        {/* Desktop Primary Navigation */}
        <nav className="hidden items-center gap-8 md:flex" aria-label="Main Navigation">
          {links.map((link) => {
            const isPropertiesActive = link.to === '/search' && (pathname.startsWith('/search') || pathname.startsWith('/properties'));
            const isHomeActive = link.to === '/' && pathname === '/';
            const isActive = isHomeActive || isPropertiesActive;

            return (
              <Link
                key={link.to}
                href={link.to}
                className={`group relative py-1 text-sm font-bold tracking-wide transition-colors ${
                  solid
                    ? isActive
                      ? 'text-navy-950 font-extrabold'
                      : 'text-navy-800/75 hover:text-navy-950'
                    : isActive
                    ? 'text-white font-extrabold'
                    : 'text-white/80 hover:text-white'
                }`}
              >
                {link.label}
                <span
                  className={`absolute inset-x-0 -bottom-1 h-0.5 rounded-full bg-amber-500 transition-transform duration-200 ease-out ${
                    isActive ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`}
                />
              </Link>
            );
          })}
        </nav>

        {/* Desktop Direct Contact CTA */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href={getPhoneHref()}
            className={`group inline-flex items-center gap-2.5 rounded-full px-5 py-2.5 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 ${
              solid
                ? 'bg-navy-950 text-white hover:bg-navy-900 shadow-sm'
                : 'bg-white/10 text-white backdrop-blur-sm border border-white/20 hover:bg-white/20'
            }`}
          >
            <PhoneIcon className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
            <span>{BROKER_PHONE_DISPLAY}</span>
          </a>
        </div>

        {/* Mobile Menu Toggle Button */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
          className={`grid h-11 w-11 place-items-center rounded-full transition-colors md:hidden ${
            solid ? 'text-navy-950 hover:bg-navy-50' : 'text-white hover:bg-white/10'
          }`}
        >
          {open ? <XIcon className="h-6 w-6" aria-hidden="true" /> : <MenuIcon className="h-6 w-6" aria-hidden="true" />}
        </button>
      </div>

      {/* Mobile Drawer Panel */}
      {open && (
        <div className="border-b border-navy-100 bg-white px-6 pb-8 pt-5 md:hidden shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3" aria-label="Mobile Navigation">
            {links.map((link) => {
              const isPropertiesActive = link.to === '/search' && (pathname.startsWith('/search') || pathname.startsWith('/properties'));
              const isHomeActive = link.to === '/' && pathname === '/';
              const isActive = isHomeActive || isPropertiesActive;

              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-base font-bold transition-colors ${
                    isActive
                      ? 'bg-navy-950 text-white'
                      : 'text-navy-800 hover:bg-navy-50'
                  }`}
                >
                  <span>{link.label}</span>
                  {isActive && <span className="h-2 w-2 rounded-full bg-amber-400" />}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 pt-5 border-t border-navy-100/80">
            <a
              href={getPhoneHref()}
              className="flex w-full items-center justify-center gap-2.5 rounded-2xl bg-amber-500 px-5 py-4 text-sm font-extrabold text-navy-950 transition-all hover:bg-amber-400 active:scale-[0.99]"
            >
              <PhoneIcon className="h-4 w-4" aria-hidden="true" />
              <span>Call BOAM Broker ({BROKER_PHONE_DISPLAY})</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
