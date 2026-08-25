'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import { Heart, MapPin, Bed, Bath, Square, Trash2, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function FavoritesPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [properties, setProperties] = useState<any[]>([]);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login');
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    const load = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}`}/api/v1/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data.success) setProperties(data.data);
      } catch (e) { console.error(e); }
      finally { setFetching(false); }
    };
    load();
  }, [isAuthenticated]);

  const removeFavorite = async (propertyId: string) => {
    try {
      const token = localStorage.getItem('token');
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/v1/favorites/${propertyId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      setProperties(prev => prev.filter(p => p.id !== propertyId));
    } catch (e) { console.error(e); }
  };

  if (isLoading || fetching) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Favorite Properties</h1>
        <p className="text-gray-500 mt-1">Properties you have marked as favorites.</p>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <Heart className="w-14 h-14 mx-auto mb-4 text-gray-200" />
          <h3 className="text-xl font-bold text-gray-900 mb-2">No favorites yet</h3>
          <p className="text-gray-500 mb-6">Browse properties and click the heart icon to save your favorites here.</p>
          <Link href="/search"><Button>Browse Properties</Button></Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {properties.map((p, idx) => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 group"
            >
              <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                {p.images?.[0] ? (
                  <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : <div className="w-full h-full bg-gray-100" />}
                <div className="absolute top-3 left-3">
                  <Badge variant={p.saleOrRent === 'Sale' ? 'accent' : 'secondary'}>For {p.saleOrRent}</Badge>
                </div>
                <button
                  onClick={() => removeFavorite(p.id)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-500 hover:text-white transition-all shadow"
                  title="Remove from favorites"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-5">
                <p className="text-xs text-primary font-medium mb-1">{p.propertyType}</p>
                <h3 className="font-bold text-gray-900 line-clamp-1 mb-1">{p.title}</h3>
                <p className="text-xs text-gray-500 flex items-center mb-3">
                  <MapPin className="w-3.5 h-3.5 mr-1" />{p.city}, {p.district}
                </p>
                <p className="text-lg font-bold text-primary mb-4">Rs. {p.price.toLocaleString()}</p>
                <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                  <div className="flex gap-3">
                    {p.bedrooms && <span className="flex items-center gap-1"><Bed className="w-3.5 h-3.5" />{p.bedrooms}</span>}
                    {p.bathrooms && <span className="flex items-center gap-1"><Bath className="w-3.5 h-3.5" />{p.bathrooms}</span>}
                    {p.houseSize && <span className="flex items-center gap-1"><Square className="w-3.5 h-3.5" />{p.houseSize}</span>}
                  </div>
                  <Link href={`/properties/${p.id}`} className="flex items-center gap-1 text-primary hover:underline font-medium">
                    View <ExternalLink className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
