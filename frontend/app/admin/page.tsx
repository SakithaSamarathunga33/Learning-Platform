'use client';

import { useState, useEffect } from 'react';
import UserManagement from '@/components/user/UserManagement';
import MediaUpload from '@/components/MediaUpload';
import MediaManagementPage from './media/MediaManagementPage';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  enabled: boolean;
}

interface DashboardStats {
  totalUsers: number;
  totalMedia: number;
  activeUsers: number;
}

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalMedia: 0,
    activeUsers: 0
  });
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const response = await fetch('http://localhost:8080/api/auth/current-user', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Authentication failed');
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Invalid response format');
        }

        const data = await response.json();
        console.log('Auth response:', data); // Debug log

        if (!data.roles?.includes('ROLE_ADMIN')) {
          router.push('/');
          return;
        }

        setUser(data);
      } catch (error) {
        console.error('Auth error:', error);
        localStorage.removeItem('token');
        router.push('/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        const token = localStorage.getItem('token');
        const [usersResponse, mediaResponse] = await Promise.all([
          fetch('http://localhost:8080/api/admin/users', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('http://localhost:8080/api/media', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        if (usersResponse.ok && mediaResponse.ok) {
          const users = await usersResponse.json();
          const media = await mediaResponse.json();

          setStats({
            totalUsers: users.length,
            totalMedia: media.length,
            activeUsers: users.filter((u: User) => u.enabled).length
          });
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    if (activeSection === 'dashboard') {
      fetchStats();
    }
  }, [activeSection, user]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'users':
        return <UserManagement />;
      case 'media':
        return <MediaManagementPage />;
      case 'upload':
        return <MediaUpload />;
      default:
        return (
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DashboardCard title="Total Users" value={stats.totalUsers.toString()} icon="👥" />
              <DashboardCard title="Total Media" value={stats.totalMedia.toString()} icon="🖼️" />
              <DashboardCard title="Active Users" value={stats.activeUsers.toString()} icon="👤" />
            </div>
          </div>
        );
    }
  };

  if (!user) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <DashboardCard title="Total Users" value={stats.totalUsers.toString()} icon="👥" />
        <DashboardCard title="Total Media" value={stats.totalMedia.toString()} icon="🖼️" />
        <DashboardCard title="Active Users" value={stats.activeUsers.toString()} icon="👤" />
      </div>
    </div>
  );
}

function DashboardCard({ title, value, icon }: { title: string; value: string; icon: string }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-600">{title}</h3>
          <p className="text-2xl font-bold mt-2">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
