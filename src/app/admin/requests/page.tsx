'use client';

import React, { useEffect, useState } from 'react';
import {
  Search,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Trees,
  Home,
  Building2,
  Filter,
  CheckCircle,
  Clock3,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { formatPrice } from '@/lib/format';

interface PropertyRequest {
  id: string;
  lookingFor: string;
  district: string;
  customArea?: string | null;
  minBudget?: number | null;
  maxBudget?: number | null;
  sizeInPerches?: number | null;
  name: string;
  email: string;
  phone: string;
  note?: string | null;
  status: 'NEW' | 'CONTACTED' | 'CLOSED';
  createdAt: string;
}

export default function AdminRequestsPage() {
  const [requests, setRequests] = useState<PropertyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== 'undefined' ? '' : 'http://localhost:5000');

      const res = await fetch(`${apiUrl}/api/v1/requests/admin`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch requests:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleStatusChange = async (id: string, newStatus: 'NEW' | 'CONTACTED' | 'CLOSED') => {
    setUpdatingId(id);
    try {
      const token = localStorage.getItem('token');
      const apiUrl =
        process.env.NEXT_PUBLIC_API_URL ||
        (typeof window !== 'undefined' ? '' : 'http://localhost:5000');

      const res = await fetch(`${apiUrl}/api/v1/requests/admin/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
      }
    } catch (err) {
      console.error('Failed to update request status:', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredRequests = requests.filter((r) => {
    const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const term = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !term ||
      r.name.toLowerCase().includes(term) ||
      r.email.toLowerCase().includes(term) ||
      r.phone.toLowerCase().includes(term) ||
      r.district.toLowerCase().includes(term) ||
      (r.customArea && r.customArea.toLowerCase().includes(term));
    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: 'NEW' | 'CONTACTED' | 'CLOSED') => {
    switch (status) {
      case 'NEW':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock3 className="w-3 h-3 text-amber-500" />
            NEW
          </span>
        );
      case 'CONTACTED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle className="w-3 h-3 text-blue-500" />
            CONTACTED
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200">
            <XCircle className="w-3 h-3 text-gray-500" />
            CLOSED
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Property Buyer Requests</h1>
        <p className="text-gray-500 mt-1">
          View buyer requests submitted by visitors and track follow-up statuses.
        </p>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, district..."
            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-gray-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500/40"
          >
            <option value="ALL">All Requests ({requests.length})</option>
            <option value="NEW">New ({requests.filter((r) => r.status === 'NEW').length})</option>
            <option value="CONTACTED">
              Contacted ({requests.filter((r) => r.status === 'CONTACTED').length})
            </option>
            <option value="CLOSED">
              Closed ({requests.filter((r) => r.status === 'CLOSED').length})
            </option>
          </select>
        </div>
      </div>

      {/* Requests List Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100">
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Submitted Date
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Visitor Details
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Requirement
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  District & Area
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Budget & Size
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Note
                </th>
                <th className="py-4 px-6 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-500 text-sm">
                    No property requests found.
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                    {/* Date */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col text-xs text-gray-700">
                        <span className="font-semibold flex items-center gap-1.5 text-gray-900">
                          <Calendar className="w-3.5 h-3.5 text-gray-400" />
                          {new Date(req.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400 mt-0.5 flex items-center gap-1.5">
                          <Clock className="w-3 h-3 text-gray-400" />
                          {new Date(req.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Visitor Info */}
                    <td className="py-4 px-6">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          {req.name}
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <a href={`mailto:${req.email}`} className="hover:underline text-blue-600">
                            {req.email}
                          </a>
                        </p>
                        <p className="text-xs text-gray-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <a href={`tel:${req.phone}`} className="hover:underline text-blue-600">
                            {req.phone}
                          </a>
                        </p>
                      </div>
                    </td>

                    {/* Looking For */}
                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          req.lookingFor === 'House'
                            ? 'bg-amber-100 text-amber-900'
                            : req.lookingFor === 'Land'
                            ? 'bg-emerald-100 text-emerald-900'
                            : 'bg-indigo-100 text-indigo-900'
                        }`}
                      >
                        {req.lookingFor === 'House' ? (
                          <Home className="w-3.5 h-3.5" />
                        ) : req.lookingFor === 'Land' ? (
                          <Trees className="w-3.5 h-3.5" />
                        ) : (
                          <Building2 className="w-3.5 h-3.5" />
                        )}
                        {req.lookingFor}
                      </span>
                    </td>

                    {/* District & Area */}
                    <td className="py-4 px-6">
                      <div className="text-xs space-y-0.5">
                        <p className="font-bold text-gray-900 flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {req.district}
                        </p>
                        {req.customArea && (
                          <p className="text-gray-500 font-medium pl-4">({req.customArea})</p>
                        )}
                      </div>
                    </td>

                    {/* Budget & Size */}
                    <td className="py-4 px-6">
                      <div className="text-xs space-y-1 text-gray-700">
                        <div>
                          <span className="font-semibold text-gray-900">Budget: </span>
                          {req.minBudget || req.maxBudget ? (
                            <span>
                              {req.minBudget ? formatPrice(req.minBudget, 'sale') : 'Any'} –{' '}
                              {req.maxBudget ? formatPrice(req.maxBudget, 'sale') : 'Any'}
                            </span>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </div>
                        <div>
                          <span className="font-semibold text-gray-900">Size: </span>
                          {req.sizeInPerches ? (
                            <span>{req.sizeInPerches} perches</span>
                          ) : (
                            <span className="text-gray-400">Not specified</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Note */}
                    <td className="py-4 px-6 max-w-xs">
                      {req.note ? (
                        <p className="text-xs text-gray-700 bg-gray-50 p-2 rounded-xl border border-gray-100 line-clamp-3">
                          {req.note}
                        </p>
                      ) : (
                        <span className="text-xs text-gray-400 italic">—</span>
                      )}
                    </td>

                    {/* Status & Change Action */}
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div>{getStatusBadge(req.status)}</div>
                        <select
                          disabled={updatingId === req.id}
                          value={req.status}
                          onChange={(e) =>
                            handleStatusChange(
                              req.id,
                              e.target.value as 'NEW' | 'CONTACTED' | 'CLOSED'
                            )
                          }
                          className="py-1 px-2.5 text-xs font-bold rounded-lg border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500 disabled:opacity-50"
                        >
                          <option value="NEW">Mark as NEW</option>
                          <option value="CONTACTED">Mark as CONTACTED</option>
                          <option value="CLOSED">Mark as CLOSED</option>
                        </select>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
