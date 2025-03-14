'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  picture?: string;
  roles?: string[];
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();

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
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <nav className="bg-white shadow-lg fixed w-full top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 justify-between items-center">
          {/* Logo - Left */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] flex items-center justify-center shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] bg-clip-text text-transparent">
                SkillShare
              </span>
            </Link>
          </div>

          {/* Navigation Links - Center */}
          <div className="hidden md:flex flex-1 justify-center">
            <div className="flex space-x-8">
              <Link
                href="/courses"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  pathname === '/courses'
                    ? 'text-white bg-[#4169E1]'
                    : 'text-gray-500 hover:text-[#4169E1] hover:bg-[#4169E1]/5'
                } transition-all duration-200`}
              >
                Courses
              </Link>
              <Link
                href="/mentors"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  pathname === '/mentors'
                    ? 'text-white bg-[#4169E1]'
                    : 'text-gray-500 hover:text-[#4169E1] hover:bg-[#4169E1]/5'
                } transition-all duration-200`}
              >
                Mentors
              </Link>
              <Link
                href="/community"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  pathname === '/community'
                    ? 'text-white bg-[#4169E1]'
                    : 'text-gray-500 hover:text-[#4169E1] hover:bg-[#4169E1]/5'
                } transition-all duration-200`}
              >
                Community
              </Link>
            </div>
          </div>

          {/* User Menu - Right */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                {user.roles?.includes('ROLE_ADMIN') && (
                  <Link
                    href="/admin"
                    className="text-sm font-medium text-gray-700 hover:text-[#4169E1] transition-colors duration-200"
                  >
                    Admin Dashboard
                  </Link>
                )}
                <div className="flex items-center space-x-2">
                  <Link href="/profile" className="flex items-center space-x-2 group">
                    <div className="h-8 w-8 rounded-full bg-[#4169E1] flex items-center justify-center text-white font-medium overflow-hidden group-hover:ring-2 group-hover:ring-[#4169E1]/30 transition-all duration-200">
                      {user.picture ? (
                        <img src={user.picture} alt={user.username} className="w-full h-full object-cover" />
                      ) : (
                        user.username?.charAt(0).toUpperCase()
                      )}
                    </div>
                    <span className="text-sm font-medium text-gray-700 group-hover:text-[#4169E1] transition-colors duration-200">{user.username}</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="ml-2 px-4 py-2 text-sm font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors duration-200"
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4169E1] hover:bg-[#4169E1]/90 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/courses"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              pathname === '/courses'
                ? 'text-white bg-[#4169E1]'
                : 'text-gray-500 hover:text-[#4169E1] hover:bg-[#4169E1]/5'
            } transition-all duration-200`}
          >
            Courses
          </Link>
          <Link
            href="/mentors"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              pathname === '/mentors'
                ? 'text-white bg-[#4169E1]'
                : 'text-gray-500 hover:text-[#4169E1] hover:bg-[#4169E1]/5'
            } transition-all duration-200`}
          >
            Mentors
          </Link>
          <Link
            href="/community"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              pathname === '/community'
                ? 'text-white bg-[#4169E1]'
                : 'text-gray-500 hover:text-[#4169E1] hover:bg-[#4169E1]/5'
            } transition-all duration-200`}
          >
            Community
          </Link>
        </div>
      </div>
    </nav>
  );
}
