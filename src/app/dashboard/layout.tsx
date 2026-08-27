'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, User, Building2, Heart, BookMarked,
  MessageSquare, Bell, Activity, Settings, ChevronRight,
  LogOut, Menu, X, Plus
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/profile', label: 'Profile', icon: User },
  { href: '/dashboard/properties', label: 'My Listings', icon: Building2 },
  { href: '/dashboard/saved', label: 'Saved Properties', icon: BookMarked },
  { href: '/dashboard/favorites', label: 'Favorites', icon: Heart },
  { href: '/dashboard/notifications', label: 'Notifications', icon: Bell },
  { href: '/dashboard/activity', label: 'Activity Log', icon: Activity },
  { href: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* User Profile Summary */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-white text-lg font-bold flex-shrink-0 overflow-hidden">
            {user?.profilePicture ? (
              <img src={user.profilePicture} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              user?.fullName?.charAt(0).toUpperCase() || 'U'
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 text-sm truncate">{user?.fullName}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary mt-1">
              {user?.role || 'User'}
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action */}
      <div className="p-4 border-b border-gray-100">
        <Link
          href="/add-property"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <Plus className="w-4 h-4" /> Add New Listing
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600')} />
              <span className="flex-1">{item.label}</span>
              {!active && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex pt-16">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 fixed top-16 bottom-0 left-0 bg-white border-r border-gray-200 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 bg-white flex flex-col shadow-xl">
            <button
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-100"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 flex flex-col min-h-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-white border-b border-gray-200 sticky top-16 z-20">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-600"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="font-semibold text-gray-800 text-sm">
            {navItems.find(n => isActive(n))?.label || 'Dashboard'}
          </p>
        </div>

        <div className="flex-1 p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
