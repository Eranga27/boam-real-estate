'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Buy', href: '#' },
    { name: 'Rent', href: '#' },
    { name: 'Sell', href: '#' },
    { name: 'About', href: '#' },
    { name: 'Contact', href: '#' },
  ];

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-primary text-white p-2 rounded-lg">
              <Home className="w-6 h-6" />
            </div>
            <span className={cn(
              "text-xl font-bold tracking-tight transition-colors",
              isScrolled ? "text-primary" : "text-primary lg:text-white"
            )}>
              Boam <span className="font-light">Real-Estates</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={cn(
                    "text-sm font-medium hover:text-accent transition-colors",
                    isScrolled ? "text-gray-600" : "text-gray-600 lg:text-white/90"
                  )}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" className={cn(
                isScrolled ? "text-primary" : "text-primary lg:text-white hover:text-primary lg:hover:bg-white/10"
              )}>
                Login
              </Button>
              <Button variant="accent">Sign Up</Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className={cn("w-6 h-6", isScrolled ? "text-primary" : "text-white")} />
            ) : (
              <Menu className={cn("w-6 h-6", isScrolled ? "text-primary" : "text-white")} />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white shadow-xl border-t border-gray-100 p-4 flex flex-col gap-4 animate-in slide-in-from-top-2">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-gray-800 font-medium p-2 hover:bg-light-gray rounded-lg"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-100">
            <Button variant="outline" className="w-full">Login</Button>
            <Button variant="accent" className="w-full">Sign Up</Button>
          </div>
        </div>
      )}
    </nav>
  );
}
