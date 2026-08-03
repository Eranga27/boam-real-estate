import React from 'react';

export default function Loading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10 w-full animate-pulse">
      <div className="h-8 bg-gray-200 rounded-lg w-1/3 mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col gap-4">
            <div className="w-full h-48 bg-gray-200 rounded-xl"></div>
            <div className="h-5 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
