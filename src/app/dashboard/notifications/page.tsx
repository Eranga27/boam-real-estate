'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bell, Home, MessageSquare, Star, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotificationsPage() {
  const notifications = [
    {
      id: 1,
      type: 'inquiry',
      title: 'New Inquiry Received',
      message: 'John Doe sent an inquiry for your property "Luxury Villa in Colombo".',
      time: '2 hours ago',
      read: false,
      icon: MessageSquare,
      color: 'text-blue-500 bg-blue-50'
    },
    {
      id: 2,
      type: 'system',
      title: 'Property Approved',
      message: 'Your listing "Modern Apartment in Kandy" has been approved and is now live.',
      time: '1 day ago',
      read: true,
      icon: CheckCircle,
      color: 'text-green-500 bg-green-50'
    },
    {
      id: 3,
      type: 'alert',
      title: 'Price Drop Alert',
      message: 'A property in your favorites list just dropped its price by 5%.',
      time: '3 days ago',
      read: true,
      icon: Star,
      color: 'text-yellow-500 bg-yellow-50'
    }
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-500 mt-1">Stay updated with your property activities.</p>
        </div>
        <Button variant="outline" className="text-sm h-9">Mark all as read</Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-16 text-center">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">No notifications yet</h3>
            <p className="text-gray-500 text-sm">When you get updates, they'll show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {notifications.map((notif, idx) => {
              const Icon = notif.icon;
              return (
                <motion.div
                  key={notif.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className={`p-5 flex gap-4 transition-colors hover:bg-gray-50 cursor-pointer ${notif.read ? 'opacity-70' : 'bg-blue-50/30'}`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start gap-2 mb-1">
                      <h4 className={`text-sm font-semibold ${notif.read ? 'text-gray-700' : 'text-gray-900'}`}>
                        {notif.title}
                      </h4>
                      <span className="text-xs text-gray-400 whitespace-nowrap">{notif.time}</span>
                    </div>
                    <p className="text-sm text-gray-500 line-clamp-2">{notif.message}</p>
                  </div>
                  {!notif.read && (
                    <div className="flex-shrink-0 flex items-center justify-center w-3">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
