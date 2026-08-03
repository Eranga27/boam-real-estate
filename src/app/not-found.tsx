import React from 'react';
import Link from 'next/link';
import { Home, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 max-w-md mb-8">
        We couldn't find the page you were looking for. It might have been removed, renamed, or didn't exist in the first place.
      </p>
      <div className="flex gap-4">
        <Link href="/">
          <Button className="flex items-center gap-2">
            <Home className="w-4 h-4" /> Go to Homepage
          </Button>
        </Link>
        <Link href="/buy">
          <Button variant="outline">Browse Properties</Button>
        </Link>
      </div>
    </div>
  );
}
