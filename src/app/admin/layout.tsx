'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, Building2, FileText, Settings, ShieldAlert,
  ChevronRight, LogOut, Menu, X, ArrowLeft
} from 'lucide-react';

const navItems = [
  { href: '/admin', label: 'Analytics Overview', icon: LayoutDashboard, exact: true },
  { href: '/admin/listings', label: 'Manage Listings', icon: Building2 },
  { href: '/admin/users', label: 'Manage Users', icon: Users },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: FileText },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // If viewing the standalone login page, render children without admin layout
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) router.push('/admin/login');
      else if (user?.role !== 'ADMIN') router.push('/');
    }
  }, [isAuthenticated, isLoading, user, router, pathname]);

  if (isLoading || !isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    router.push('/admin/login');
  };

  const isActive = (item: typeof navItems[0]) => {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Admin Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center gap-3 text-red-500 mb-2">
          <ShieldAlert className="w-6 h-6" />
          <h2 className="text-xl font-bold text-white tracking-tight">Admin Portal</h2>
        </div>
        <p className="text-xs text-gray-400">Restricted Access Area</p>
      </div>

      <div className="p-4 border-b border-gray-800">
        <Link
          href="/dashboard"
          className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-gray-800 text-gray-300 hover:text-white rounded-xl text-sm font-semibold hover:bg-gray-700 transition-colors"
          onClick={() => setMobileSidebarOpen(false)}
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileSidebarOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all group',
                active
                  ? 'bg-red-500 text-white shadow-md shadow-red-500/20'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100'
              )}
            >
              <Icon className={cn('w-4 h-4 flex-shrink-0', active ? 'text-white' : 'text-gray-400 group-hover:text-gray-100')} />
              <span className="flex-1">{item.label}</span>
              {!active && <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity" />}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-800">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
            {user?.fullName?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div>
            <p className="font-semibold text-sm truncate max-w-[150px]">{user?.fullName}</p>
            <p className="text-xs text-gray-400">Administrator</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-gray-800 w-full transition-colors border border-gray-700"
        >
          <LogOut className="w-4 h-4" />
          Secure Logout
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 flex pt-16">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-72 fixed top-16 bottom-0 left-0 z-30">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 bg-gray-900 flex flex-col shadow-2xl">
            <button
              className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-gray-800 text-gray-400"
              onClick={() => setMobileSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-72 flex flex-col min-h-full">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-4 px-4 py-3 bg-gray-900 border-b border-gray-800 sticky top-16 z-20">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-300"
          >
            <Menu className="w-5 h-5" />
          </button>
          <p className="font-semibold text-white text-sm">
            {navItems.find(n => isActive(n))?.label || 'Admin Portal'}
          </p>
        </div>

        <div className="flex-1 p-6 lg:p-10">
          {children}
        </div>
      </main>
    </div>
  );
}
