'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the new combined login/register page
    router.push('/login?tab=register');
  }, [router]);
  
  return null; // No rendering needed as we're redirecting
} 