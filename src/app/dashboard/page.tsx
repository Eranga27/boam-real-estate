'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import {
  Building2, Eye, MessageSquare, Heart, TrendingUp,
  Clock, CheckCircle, XCircle, AlertCircle, Plus, ArrowRight, MapPin
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface Stats {
  listings: { total: number; published: number; draft: number; pending: number; rejected: number };
  inquiriesReceived: number;
  inquiriesSent: number;
  favorites: number;
  recentListings: any[];
  recentInquiries: any[];
}

const statusVariant: Record<string, any> = {
  PUBLISHED: 'secondary',
  PENDING_APPROVAL: 'accent',
  DRAFT: 'gray',
  REJECTED: 'outline',
};
const statusLabel: Record<string, string> = {
  PUBLISHED: 'Published',
  PENDING_APPROVAL: 'Pending',
  DRAFT: 'Draft',
  REJECTED: 'Rejected',
};

export default function DashboardOverview() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/dashboard/stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (e) { console.error(e); }
      finally { setFetching(false); }
    };
    load();
  }, [isAuthenticated]);

  if (isLoading || fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statCards = [
    { label: 'Total Listings', value: stats?.listings.total ?? 0, icon: Building2, color: 'bg-blue-50 text-blue-600', href: '/dashboard/properties' },
    { label: 'Published', value: stats?.listings.published ?? 0, icon: CheckCircle, color: 'bg-green-50 text-green-600', href: '/dashboard/properties' },
    { label: 'Favorites Saved', value: stats?.favorites ?? 0, icon: Heart, color: 'bg-red-50 text-red-600', href: '/dashboard/favorites' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.fullName?.split(' ')[0]} 👋
          </h1>
          <p className="text-gray-500 mt-1">Here is your dashboard overview.</p>
        </div>
        <Link
          href="/add-property"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Property
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.07 }}
            >
              <Link href={card.href} className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm text-gray-500 mt-1">{card.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      {/* Listing Breakdown Bar */}
      {stats && stats.listings.total > 0 && (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" /> Listing Status Breakdown
          </h3>
          <div className="flex rounded-full h-3 overflow-hidden mb-4 gap-0.5">
            {stats.listings.published > 0 && (
              <div className="bg-green-500 transition-all" style={{ width: `${(stats.listings.published / stats.listings.total) * 100}%` }} />
            )}
            {stats.listings.pending > 0 && (
              <div className="bg-yellow-400 transition-all" style={{ width: `${(stats.listings.pending / stats.listings.total) * 100}%` }} />
            )}
            {stats.listings.draft > 0 && (
              <div className="bg-gray-300 transition-all" style={{ width: `${(stats.listings.draft / stats.listings.total) * 100}%` }} />
            )}
            {stats.listings.rejected > 0 && (
              <div className="bg-red-400 transition-all" style={{ width: `${(stats.listings.rejected / stats.listings.total) * 100}%` }} />
            )}
          </div>
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-green-500" /><span className="text-gray-600">{stats.listings.published} Published</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-yellow-400" /><span className="text-gray-600">{stats.listings.pending} Pending</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-gray-300" /><span className="text-gray-600">{stats.listings.draft} Draft</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full bg-red-400" /><span className="text-gray-600">{stats.listings.rejected} Rejected</span></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Listings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Recent Listings</h3>
            <Link href="/dashboard/properties" className="text-sm text-primary hover:underline">View all</Link>
          </div>
          {(!stats?.recentListings || stats.recentListings.length === 0) ? (
            <div className="p-8 text-center text-gray-400">
              <Building2 className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No listings yet</p>
              <Link href="/add-property" className="text-primary text-sm font-medium hover:underline mt-1 inline-block">Add your first property</Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.recentListings.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {p.images?.[0] ? <img src={p.images[0]} alt="" className="w-full h-full object-cover" /> : <Building2 className="w-5 h-5 m-3.5 text-gray-300" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{p.title}</p>
                    <p className="text-xs text-gray-500 flex items-center mt-0.5">
                      <MapPin className="w-3 h-3 mr-0.5" />{p.city}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant={statusVariant[p.status]}>{statusLabel[p.status]}</Badge>
                    <p className="text-xs text-primary font-semibold mt-1">Rs. {p.price.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Direct Broker Actions */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">BOAM Direct Support</h3>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              Need assistance with your property listings or client enquiries? Connect directly with the BOAM broker team.
            </p>
          </div>
          <div className="space-y-2">
            <Link
              href="/search"
              className="flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-navy-950 text-white rounded-xl text-xs font-bold hover:bg-navy-900 transition-colors"
            >
              Browse All Listings
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
