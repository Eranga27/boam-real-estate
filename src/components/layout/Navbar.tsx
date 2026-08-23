'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MenuIcon, PhoneIcon, XIcon, UserCircle } from 'lucide-react';
import { Logo } from '../brand/Logo';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const [scrolled, setScrolled] = useState(!isHome);
  const [open, setOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  
  const isAdmin = user?.role === 'ADMIN';

  const links = [
    { to: '/', label: 'Home' },
    { to: '/buy', label: 'Buy' },
    { to: '/rent', label: 'Rent' },
    { to: '/search', label: 'All Properties' },
    ...(isAdmin ? [{ to: '/add-property', label: 'Add Property' }] : []),
  ];

  useEffect(() => {
    if (!isHome) {
      setScrolled(true);
      return;
    }
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isHome]);

  useEffect(() => setOpen(false), [pathname]);

  const solid = scrolled || open;

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        solid ? 'bg-white/95 shadow-[0_1px_0_rgba(18,53,91,0.08)] backdrop-blur' : 'bg-gradient-to-b from-navy-950/75 via-navy-950/30 to-transparent backdrop-blur-sm'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:h-[72px] sm:px-6 lg:px-8">
        <Link
          href="/"
          aria-label="Boam Real-Estates home"
          className="flex items-center shrink-0 transition-opacity hover:opacity-90 py-1"
        >
          {/* Use larger logo preset on dark hero for better presence */}
          <Logo variant={solid ? 'dark' : 'light'} size={solid ? 'responsive' : 'lg'} />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Main">
          {links.map((link) => {
            const isActive = pathname === link.to;
            return (
              <Link
                key={link.to}
                href={link.to}
                className={`relative rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  solid
                    ? isActive
                      ? 'text-navy-800'
                      : 'text-navy-800/60 hover:text-navy-800'
                    : isActive
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
                {isActive && (
                  <span className="absolute inset-x-4 -bottom-0.5 h-0.5 rounded-full bg-amber-500" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href="tel:+94777801470"
            className={`flex items-center gap-2 text-sm font-semibold transition-colors ${
              solid ? 'text-navy-800 hover:text-navy-600' : 'text-white hover:text-amber-300'
            }`}
          >
            <PhoneIcon className="h-4 w-4" aria-hidden="true" />
            +94 777 80 1470
          </a>
          
          {!isAuthenticated ? (
            <Link
              href="/login"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                solid ? 'text-navy-800 hover:bg-navy-50' : 'text-white hover:bg-white/10'
              }`}
            >
              Sign in
            </Link>
          ) : (
            <Link
              href="/profile"
              className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                solid ? 'text-navy-800 hover:bg-navy-50' : 'text-white hover:bg-white/10'
              }`}
            >
              <UserCircle className="w-5 h-5" />
              Profile
            </Link>
          )}

          <Link
            href="/search"
            className="rounded-full bg-amber-500 px-5 py-2.5 text-sm font-bold text-navy-900 shadow-[0_10px_24px_-12px_rgba(244,163,0,0.9)] transition-all hover:-translate-y-0.5 hover:bg-amber-400"
          >
            Browse Listings
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={open ? 'Close menu' : 'Open menu'}
          className={`grid h-10 w-10 place-items-center rounded-full transition-colors lg:hidden ${
            solid ? 'text-navy-800 hover:bg-navy-50' : 'text-white hover:bg-white/10'
          }`}
        >
          {open ? <XIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-navy-100 bg-white px-4 pb-6 pt-4 lg:hidden shadow-lg">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {links.map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  href={link.to}
                  className={`rounded-xl px-3 py-3 text-base font-semibold transition-colors ${
                    isActive ? 'bg-navy-50 text-navy-800' : 'text-navy-800/70 hover:bg-navy-50'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-6 flex flex-col gap-3 pt-4 border-t border-navy-50">
            {!isAuthenticated ? (
              <Link
                href="/login"
                className="rounded-full border border-navy-200 px-5 py-3 text-center text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50"
              >
                Sign in
              </Link>
            ) : (
              <Link
                href="/profile"
                className="rounded-full border border-navy-200 px-5 py-3 text-center text-sm font-semibold text-navy-800 transition-colors hover:bg-navy-50 flex items-center justify-center gap-2"
              >
                <UserCircle className="w-5 h-5" />
                Profile
              </Link>
            )}
            <Link
              href="/search"
              className="rounded-full bg-amber-500 px-5 py-3 text-center text-sm font-bold text-navy-900 transition-colors hover:bg-amber-400"
            >
              Browse Listings
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}