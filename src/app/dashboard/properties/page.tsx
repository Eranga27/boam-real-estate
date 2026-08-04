'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Edit, Trash2, Plus, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface Property {
  id: string;
  title: string;
  price: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'PUBLISHED' | 'REJECTED';
  images: string[];
  createdAt: string;
}

export default function MyProperties() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProperties();
    }
  }, [isAuthenticated]);

  const fetchProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/v1/properties/me/listings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProperties(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch properties', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/v1/properties/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setProperties(prev => prev.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Failed to delete property', error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <Badge variant="secondary">Published</Badge>;
      case 'PENDING_APPROVAL':
        return <Badge variant="accent">Pending Approval</Badge>;
      case 'REJECTED':
        return <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">Rejected</Badge>;
      default:
        return <Badge variant="gray">Draft</Badge>;
    }
  };

  if (isLoading || loadingProperties) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <main className="flex-1 py-24 px-4 bg-light-gray min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-primary mb-2">My Properties</h1>
            <p className="text-gray-600">Manage your real estate listings</p>
          </div>
          {isAdmin && (
            <Link href="/add-property">
              <Button>
                <Plus className="w-5 h-5 mr-2" /> Add Property
              </Button>
            </Link>
          )}
        </div>

        {properties.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-2">No Properties Found</h2>
            <p className="text-gray-500 mb-6">{isAdmin ? "You haven't added any properties yet." : "No listings available at the moment."}</p>
            {isAdmin && (
              <Link href="/add-property">
                <Button>Add Your First Property</Button>
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property, index) => (
              <motion.div 
                key={property.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group"
              >
                <div className="relative aspect-video bg-gray-100">
                  {property.images && property.images.length > 0 ? (
                    <img src={property.images[0]} alt={property.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">No Image</div>
                  )}
                  <div className="absolute top-3 right-3">
                    {getStatusBadge(property.status)}
                  </div>
                </div>
                <div className="p-5">
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 line-clamp-1">{property.title}</h3>
                  <p className="text-primary font-bold mb-4">${property.price.toLocaleString()}</p>
                  
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                      Added {new Date(property.createdAt).toLocaleDateString()}
                    </span>
                    <div className="flex gap-2">
                      {property.status === 'PUBLISHED' && (
                        <Link href={`/properties/${property.id}`} target="_blank">
                          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full text-gray-500 hover:text-primary">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </Link>
                      )}
                      <Link href={`/dashboard/properties/edit/${property.id}`}>
                        <Button variant="ghost" size="sm" className="w-8 h-8 p-0 rounded-full text-gray-500 hover:text-primary">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-8 h-8 p-0 rounded-full text-gray-500 hover:text-red-500 hover:bg-red-50"
                        onClick={() => handleDelete(property.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
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
