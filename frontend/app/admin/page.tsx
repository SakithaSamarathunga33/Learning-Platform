'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalMedia: number;
}

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalMedia: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }

    // Fetch dashboard stats
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:8080/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          setStats(data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4169E1]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] rounded-2xl shadow-xl p-8 mb-8 text-white">
        <h1 className="text-4xl font-bold">Welcome, {user?.username}!</h1>
        <p className="mt-2 text-lg opacity-90">Manage your learning platform and monitor its growth</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Total Users Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center">
            <div className="p-4 bg-[#4169E1]/10 rounded-2xl">
              <svg className="w-8 h-8 text-[#4169E1]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-600">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-[#4169E1]/10 rounded-full">
              <div className="h-2 bg-[#4169E1] rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
        </div>

        {/* Active Users Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center">
            <div className="p-4 bg-[#FF6F00]/10 rounded-2xl">
              <svg className="w-8 h-8 text-[#FF6F00]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
              </svg>
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-600">Active Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.activeUsers}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-[#FF6F00]/10 rounded-full">
              <div className="h-2 bg-[#FF6F00] rounded-full" style={{ width: `${(stats.activeUsers / stats.totalUsers) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Total Media Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 transform transition-all duration-200 hover:scale-105">
          <div className="flex items-center">
            <div className="p-4 bg-[#2AB7CA]/10 rounded-2xl">
              <svg className="w-8 h-8 text-[#2AB7CA]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 6a2 2 0 012-2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V6zM14.553 7.106A1 1 0 0014 8v4a1 1 0 00.553.894l2 1A1 1 0 0018 13V7a1 1 0 00-1.447-.894l-2 1z" />
              </svg>
            </div>
            <div className="ml-6">
              <p className="text-sm font-medium text-gray-600">Total Media</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalMedia}</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="h-2 bg-[#2AB7CA]/10 rounded-full">
              <div className="h-2 bg-[#2AB7CA] rounded-full" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <button className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-3 border border-gray-100">
          <div className="p-3 bg-[#4169E1]/10 rounded-xl">
            <svg className="w-6 h-6 text-[#4169E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="font-medium text-gray-700">Add New Course</span>
        </button>

        <button className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-3 border border-gray-100">
          <div className="p-3 bg-[#FF6F00]/10 rounded-xl">
            <svg className="w-6 h-6 text-[#FF6F00]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <span className="font-medium text-gray-700">View Reports</span>
        </button>

        <button className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-3 border border-gray-100">
          <div className="p-3 bg-[#2AB7CA]/10 rounded-xl">
            <svg className="w-6 h-6 text-[#2AB7CA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <span className="font-medium text-gray-700">Schedule Class</span>
        </button>

        <button className="p-4 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center space-x-3 border border-gray-100">
          <div className="p-3 bg-[#4169E1]/10 rounded-xl">
            <svg className="w-6 h-6 text-[#4169E1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <span className="font-medium text-gray-700">Settings</span>
        </button>
      </div>
    </div>
  );
}
