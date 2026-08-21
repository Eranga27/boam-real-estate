'use client';

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Building2, MessageSquare, AlertTriangle, ArrowRight, ShieldCheck, FileText } from 'lucide-react';
import Link from 'next/link';

interface AdminStats {
  totalUsers: number;
  totalListings: number;
  totalInquiries: number;
  pendingListings: number;
  recentUsers: any[];
  recentListings: any[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) setStats(data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: Users, color: 'text-blue-600 bg-blue-50 border-blue-100', href: '/admin/users' },
    { label: 'Total Listings', value: stats?.totalListings || 0, icon: Building2, color: 'text-indigo-600 bg-indigo-50 border-indigo-100', href: '/admin/properties' },
    { label: 'Total Inquiries', value: stats?.totalInquiries || 0, icon: MessageSquare, color: 'text-purple-600 bg-purple-50 border-purple-100', href: '#' },
    { label: 'Pending Approvals', value: stats?.pendingListings || 0, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-100', href: '/admin/properties?status=PENDING_APPROVAL' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Analytics</h1>
        <p className="text-gray-500 mt-1">Overview of system metrics and recent activities.</p>
      </div>

      {/* KPI Cards */}
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
              <Link href={card.href} className="block bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:border-red-200 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${card.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                <p className="text-sm font-medium text-gray-500 mt-1">{card.label}</p>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Users */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-400" /> New Signups
            </h3>
            <Link href="/admin/users" className="text-sm font-medium text-red-600 hover:underline">View All</Link>
          </div>
          <div className="p-6 flex-1">
            {!stats?.recentUsers?.length ? (
              <p className="text-gray-500 text-sm text-center">No users found.</p>
            ) : (
              <div className="space-y-4">
                {stats.recentUsers.map(u => (
                  <div key={u.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                        {u.fullName.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{u.fullName}</p>
                        <p className="text-xs text-gray-500">{u.email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${u.role === 'ADMIN' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Listings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-gray-400" /> Latest Properties
            </h3>
            <Link href="/admin/properties" className="text-sm font-medium text-red-600 hover:underline">View All</Link>
          </div>
          <div className="p-6 flex-1">
            {!stats?.recentListings?.length ? (
              <p className="text-gray-500 text-sm text-center">No listings found.</p>
            ) : (
              <div className="space-y-4">
                {stats.recentListings.map(p => (
                  <div key={p.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 line-clamp-1">{p.title}</p>
                      <p className="text-xs text-gray-500">by {p.user?.fullName}</p>
                    </div>
                    <div className="text-right flex-shrink-0 ml-4">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
                        p.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                        p.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                        p.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {p.status}
                      </span>
                      <p className="text-xs font-semibold text-gray-900 mt-1">Rs. {p.price.toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
