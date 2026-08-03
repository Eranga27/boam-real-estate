'use client';

import React, { useEffect } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-24 h-24 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
        <AlertOctagon className="w-10 h-10" />
      </div>
      <h1 className="text-4xl font-bold text-gray-900 mb-2">Something went wrong!</h1>
      <p className="text-gray-500 max-w-md mb-8">
        We apologize for the inconvenience. An unexpected error has occurred on our end.
      </p>
      <Button onClick={() => reset()} className="flex items-center gap-2">
        <RotateCcw className="w-4 h-4" /> Try again
      </Button>
    </div>
  );
}
