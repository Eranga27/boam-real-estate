'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { MessageSquare, MapPin, Calendar, ExternalLink, Inbox } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

interface Inquiry {
  id: string;
  message: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  createdAt: string;
  property: {
    id: string;
    title: string;
    images: string[];
    price: number;
    city: string;
    district: string;
    saleOrRent: string;
    status: string;
  };
}

export default function MyInquiriesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchInquiries = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/v1/inquiries/my', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setInquiries(data.data);
      } catch (err) {
        console.error('Failed to fetch inquiries', err);
      } finally {
        setFetching(false);
      }
    };
    fetchInquiries();
  }, [isAuthenticated]);

  const statusColor = (status: string) => {
    if (status === 'PUBLISHED') return 'secondary';
    if (status === 'PENDING_APPROVAL') return 'accent';
    if (status === 'REJECTED') return 'outline';
    return 'gray';
  };

  if (isLoading || fetching) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-light-gray py-24 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">My Inquiries</h1>
            <p className="text-gray-500">Track all the properties you have contacted sellers about.</p>
          </div>
          <Link href="/buy">
            <Button variant="outline">Browse Properties</Button>
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-gray-100">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <Inbox className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No inquiries yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              When you send an inquiry to a seller on a property page, it will appear here so you can track your conversations.
            </p>
            <Link href="/buy">
              <Button>Start Browsing</Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {inquiries.map((inquiry, idx) => (
              <motion.div
                key={inquiry.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.06 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col sm:flex-row"
              >
                {/* Property Image */}
                <div className="w-full sm:w-44 h-44 sm:h-auto bg-gray-100 flex-shrink-0 overflow-hidden">
                  {inquiry.property.images?.[0] ? (
                    <img
                      src={inquiry.property.images[0]}
                      alt={inquiry.property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                      <MessageSquare className="w-10 h-10" />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col gap-3">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant={inquiry.property.saleOrRent === 'Sale' ? 'accent' : 'secondary'}>
                          For {inquiry.property.saleOrRent}
                        </Badge>
                        <Badge variant={statusColor(inquiry.property.status)}>
                          {inquiry.property.status === 'PUBLISHED' ? 'Active Listing' : inquiry.property.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1">
                        {inquiry.property.title}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center mt-0.5">
                        <MapPin className="w-3.5 h-3.5 mr-1" />
                        {inquiry.property.city}, {inquiry.property.district}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-primary">
                        ${inquiry.property.price.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-400 flex items-center justify-end mt-1">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric', month: 'short', day: 'numeric',
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Message Preview */}
                  <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                    <p className="text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Your Message</p>
                    <p className="text-sm text-gray-700 line-clamp-2">{inquiry.message}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 mt-auto pt-2">
                    <Link href={`/properties/${inquiry.property.id}`}>
                      <Button variant="outline" className="flex items-center gap-1.5 text-sm">
                        <ExternalLink className="w-3.5 h-3.5" /> View Listing
                      </Button>
                    </Link>
                    <span className="text-xs text-gray-400 ml-auto">
                      Sent as {inquiry.senderName} · {inquiry.senderEmail}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
