'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('roles');
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-white shadow-lg w-64 min-h-screen px-4 py-6">
      <div className="flex items-center mb-8">
        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-accent flex items-center justify-center shadow-soft">
          <span className="text-white font-bold text-xl">P</span>
        </div>
        <h1 className="ml-3 text-xl font-semibold text-secondary-900">Admin Panel</h1>
      </div>

      <nav className="space-y-2">
        <Link 
          href="/admin"
          className={`block p-4 rounded-lg transition-colors ${
            isActive('/admin') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span>📊</span>
            <span>Dashboard</span>
          </span>
        </Link>

        <Link 
          href="/admin/users"
          className={`block p-4 rounded-lg transition-colors ${
            isActive('/admin/users') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span>👥</span>
            <span>User Management</span>
          </span>
        </Link>

        <Link 
          href="/admin/media"
          className={`block p-4 rounded-lg transition-colors ${
            isActive('/admin/media') ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <span className="flex items-center space-x-2">
            <span>🖼️</span>
            <span>Media Management</span>
          </span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full p-4 text-left text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span className="flex items-center space-x-2">
            <span>🚪</span>
            <span>Logout</span>
          </span>
        </button>
      </nav>
    </div>
  );
}
