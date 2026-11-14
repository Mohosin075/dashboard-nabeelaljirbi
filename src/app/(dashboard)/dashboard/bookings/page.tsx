'use client';

import { Suspense, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function BookingsRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  useEffect(() => {
    const query = searchParams.toString();
    router.replace('/dashboard/booking-management' + (query ? '?' + query : ''));
  }, [router, searchParams]);
  return null;
}

export default function BookingsPage() {
  return <Suspense><BookingsRedirect /></Suspense>;
}
