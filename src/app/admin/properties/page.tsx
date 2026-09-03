'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPropertiesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/admin/listings');
  }, [router]);

  return (
    <div className="flex items-center justify-center p-12">
      <div className="w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
