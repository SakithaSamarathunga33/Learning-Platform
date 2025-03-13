'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import UserDashboardPage from './UserDashboardPage';

export default function DashboardPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Redirect admin users to admin dashboard
        if (userData.roles?.includes('ROLE_ADMIN')) {
          router.push('/admin/dashboard');
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  return <UserDashboardPage />;
}
