'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, Home } from 'lucide-react';
import { Button } from '../ui/Button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'Buy', href: '/buy' },
    { name: 'Rent', href: '/rent' },
    { name: 'Search', href: '/search' },
    { name: 'Sell', href: '/add-property' },
    { name: 'About', href: '#about' },
    { name: 'Contact', href: '#contact' },
  ];

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:5000/api/v1/auth/logout');
      logout();
      router.push('/');
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <nav
      className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        isScrolled || !isAuthenticated ? (isScrolled ? "bg-white/90 backdrop-blur-md shadow-sm py-4" : "bg-transparent py-6") : "bg-white shadow-sm py-4"
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
              {isAuthenticated ? (
                <>
                  <Link href="/profile" className={cn(
                    "flex items-center gap-2 text-sm font-medium transition-colors hover:text-accent",
                    isScrolled ? "text-gray-700" : "text-white"
                  )}>
                    {user?.profilePicture ? (
                      <img src={`http://localhost:5000${user.profilePicture}`} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border border-white/20">
                        {user?.fullName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="hidden xl:block">{user?.fullName}</span>
                  </Link>
                  <Link href="/dashboard/properties" className={cn(
                    "text-sm font-medium transition-colors hover:text-accent",
                    isScrolled ? "text-gray-700" : "text-white"
                  )}>
                    My Properties
                  </Link>
                  <Button variant="outline" onClick={handleLogout} className={cn(
                    isScrolled ? "border-primary text-primary" : "border-white text-white hover:bg-white/10"
                  )}>
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className={cn(
                      isScrolled ? "text-primary" : "text-primary lg:text-white hover:text-primary lg:hover:bg-white/10"
                    )}>
                      Login
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="accent">Sign Up</Button>
                  </Link>
                </>
              )}
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
            {isAuthenticated ? (
              <>
                <Link href="/profile">
                  <Button variant="outline" className="w-full">Profile</Button>
                </Link>
                <Link href="/dashboard/properties">
                  <Button variant="outline" className="w-full">My Properties</Button>
                </Link>
                <Button variant="ghost" onClick={handleLogout} className="w-full text-red-500">Logout</Button>
              </>
            ) : (
              <>
                <Link href="/login" className="w-full">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
                <Link href="/register" className="w-full">
                  <Button variant="accent" className="w-full">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
