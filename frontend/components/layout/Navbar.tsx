'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';

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
  const [isOpen, setIsOpen] = useState(false);

  // Function to update user data
  const updateUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        setUser(userData);
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else {
      setUser(null);
    }
  };

  // Initial user data load
  useEffect(() => {
    updateUserData();
  }, []);

  // Listen for user data changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        updateUserData();
      }
    };

    // Listen for storage events from other tabs/windows
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom events from the same window
    const handleCustomStorageChange = () => {
      updateUserData();
    };
    window.addEventListener('userDataChanged', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('userDataChanged', handleCustomStorageChange);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Dispatch custom event to update navbar
    window.dispatchEvent(new Event('userDataChanged'));
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
                href="/"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname === '/'
                    ? 'text-[#2AB7CA] border-b-2 border-[#2AB7CA]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Home
              </Link>
              <Link
                href="/courses"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname === '/courses'
                    ? 'text-[#2AB7CA] border-b-2 border-[#2AB7CA]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Courses
              </Link>
              <Link
                href="/about"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname === '/about'
                    ? 'text-[#2AB7CA] border-b-2 border-[#2AB7CA]'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About Us
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
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center max-w-xs text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                  >
                    <span className="sr-only">Open user menu</span>
                    {user?.picture ? (
                      <Image
                        className="h-8 w-8 rounded-full object-cover"
                        src={user.picture}
                        alt={`${user.username}'s profile`}
                        width={32}
                        height={32}
                        unoptimized
                        onError={(e) => {
                          // On error, switch to fallback avatar
                          const target = e.target as HTMLImageElement;
                          target.onerror = null; // Prevent infinite loop
                          target.style.display = 'none';
                          const fallback = target.parentElement?.querySelector('.fallback-avatar') as HTMLDivElement;
                          if (fallback) {
                            fallback.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className={`h-8 w-8 rounded-full bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] flex items-center justify-center text-white fallback-avatar ${user?.picture ? 'hidden' : ''}`}
                    >
                      {user?.username?.charAt(0).toUpperCase() || '?'}
                    </div>
                  </button>
                </div>
                {isOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Your Profile
                    </Link>
                    {user?.roles?.includes('ROLE_ADMIN') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                )}
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
            href="/"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              pathname === '/'
                ? 'text-white bg-[#4169E1]'
                : 'text-gray-500 hover:text-[#4169E1] hover:bg-[#4169E1]/5'
            } transition-all duration-200`}
          >
            Home
          </Link>
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
            href="/about"
            className={`block px-3 py-2 rounded-lg text-base font-medium ${
              pathname === '/about'
                ? 'text-white bg-[#4169E1]'
                : 'text-gray-500 hover:text-[#4169E1] hover:bg-[#4169E1]/5'
            } transition-all duration-200`}
          >
            About Us
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
