'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Edit, LogIn, Heart, Building, Send } from 'lucide-react';

export default function ActivityLogPage() {
  const activities = [
    {
      id: 1,
      action: 'Updated profile information',
      time: 'Today at 10:30 AM',
      icon: Edit,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      id: 2,
      action: 'Added property "Seaside Villa" to favorites',
      time: 'Yesterday at 4:15 PM',
      icon: Heart,
      color: 'bg-red-100 text-red-500'
    },
    {
      id: 3,
      action: 'Sent inquiry for "Modern Apartment in Kandy"',
      time: 'Oct 12, 2026 at 2:00 PM',
      icon: Send,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      id: 4,
      action: 'Created new property listing "Luxury Condo"',
      time: 'Oct 10, 2026 at 9:45 AM',
      icon: Building,
      color: 'bg-green-100 text-green-600'
    },
    {
      id: 5,
      action: 'Logged in from Windows (Chrome)',
      time: 'Oct 10, 2026 at 9:00 AM',
      icon: LogIn,
      color: 'bg-gray-100 text-gray-600'
    }
  ];

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Activity Log</h1>
        <p className="text-gray-500 mt-1">A history of your recent actions on the platform.</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="relative border-l-2 border-gray-100 ml-4 space-y-8">
          {activities.map((activity, idx) => {
            const Icon = activity.icon;
            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.08 }}
                className="relative pl-8"
              >
                {/* Timeline Dot */}
                <div className={`absolute -left-[21px] top-0 w-10 h-10 rounded-full flex items-center justify-center border-4 border-white ${activity.color} shadow-sm`}>
                  <Icon className="w-4 h-4" />
                </div>
                
                <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 hover:bg-gray-50 transition-colors">
                  <p className="text-sm font-semibold text-gray-900">{activity.action}</p>
                  <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> {activity.time}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        <div className="mt-8 text-center">
          <button className="text-sm font-medium text-primary hover:underline">
            Load more activity
          </button>
        </div>
      </div>
    </div>
  );
}
