'use client';

import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="bg-white shadow-xl w-64 min-h-screen px-4 py-6 border-r border-gray-100">
      <div className="flex items-center mb-8">
        <div className="h-12 w-12 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <div className="ml-3">
          <h1 className="text-xl font-bold bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] bg-clip-text text-transparent">
            SkillShare Admin
          </h1>
          <p className="text-sm text-gray-500">Management Console</p>
        </div>
      </div>

      <nav className="space-y-3">
        <Link 
          href="/admin"
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
            isActive('/admin') 
              ? 'bg-[#4169E1] text-white' 
              : 'text-gray-600 hover:bg-[#4169E1]/5'
          }`}
        >
          <svg className={`w-6 h-6 ${isActive('/admin') ? 'text-white' : 'text-[#4169E1] group-hover:text-[#4169E1]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          <span className="ml-3">Dashboard</span>
        </Link>

        <Link 
          href="/admin/users"
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
            isActive('/admin/users') 
              ? 'bg-[#FF6F00] text-white' 
              : 'text-gray-600 hover:bg-[#FF6F00]/5'
          }`}
        >
          <svg className={`w-6 h-6 ${isActive('/admin/users') ? 'text-white' : 'text-[#FF6F00] group-hover:text-[#FF6F00]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <span className="ml-3">Users</span>
        </Link>

        <Link 
          href="/admin/courses"
          className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 group ${
            isActive('/admin/courses') 
              ? 'bg-[#2AB7CA] text-white' 
              : 'text-gray-600 hover:bg-[#2AB7CA]/5'
          }`}
        >
          <svg className={`w-6 h-6 ${isActive('/admin/courses') ? 'text-white' : 'text-[#2AB7CA] group-hover:text-[#2AB7CA]'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
          <span className="ml-3">Courses</span>
        </Link>

        <div className="pt-6 mt-6 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-3 rounded-xl text-gray-600 hover:bg-red-50 hover:text-red-600 transition-all duration-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span className="ml-3">Logout</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
