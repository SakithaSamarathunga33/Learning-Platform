'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/app/providers/ThemeProvider';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  picture?: string;
  profilePicture?: string;
  roles?: string[];
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  // Function to update user data
  const updateUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        console.log('Updating user data in navbar:', userData);
        // Force a refresh when profile picture changes
        if (user?.picture !== userData.picture || user?.profilePicture !== userData.profilePicture) {
          console.log('Profile picture changed, updating navbar');
        }
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
      console.log('Received userDataChanged event');
      updateUserData();
    };
    
    // Use CustomEvent for better browser compatibility
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
    try {
      // Create and dispatch a CustomEvent for better browser compatibility
      const event = new CustomEvent('userDataChanged');
      window.dispatchEvent(event);
    } catch (e) {
      // Fallback for older browsers
      console.error('Error creating custom event:', e);
      const event = document.createEvent('Event');
      event.initEvent('userDataChanged', true, true);
      window.dispatchEvent(event);
    }
    router.push('/login');
  };

  // User profile image component
  const UserAvatar = ({ user }: { user: User }) => {
    const [imageError, setImageError] = useState(false);
    const pictureUrl = user?.picture || user?.profilePicture;
    
    return (
      <div className="relative">
        {pictureUrl && !imageError ? (
          <Image
            className="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-gray-700 transition-all duration-200"
            src={pictureUrl}
            alt={`${user.username || user.name}'s profile`}
            width={32}
            height={32}
            unoptimized
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] flex items-center justify-center text-white ring-2 ring-white dark:ring-gray-700 transition-all duration-200">
            {(user?.username || user?.name)?.charAt(0).toUpperCase() || '?'}
          </div>
        )}
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full">
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>
        </span>
      </div>
    );
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg fixed w-full top-0 z-50 transition-colors duration-200">
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
                    ? 'text-[#2AB7CA] border-b-2 border-[#2AB7CA] dark:text-[#4fc3d5]'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Home
              </Link>
              <Link
                href="/courses"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname === '/courses'
                    ? 'text-[#2AB7CA] border-b-2 border-[#2AB7CA] dark:text-[#4fc3d5]'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300'
                } transition-colors duration-200`}
              >
                Courses
              </Link>
              <Link
                href="/about"
                className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${
                  pathname === '/about'
                    ? 'text-[#2AB7CA] border-b-2 border-[#2AB7CA] dark:text-[#4fc3d5]'
                    : 'text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white hover:border-gray-300'
                } transition-colors duration-200`}
              >
                About Us
              </Link>
              <Link
                href="/mentors"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  pathname === '/mentors'
                    ? 'text-white bg-[#4169E1] dark:bg-[#5278ed]'
                    : 'text-gray-500 hover:text-[#4169E1] dark:text-gray-300 dark:hover:text-[#5278ed] hover:bg-[#4169E1]/5 dark:hover:bg-[#5278ed]/10'
                } transition-all duration-200`}
              >
                Mentors
              </Link>
              <Link
                href="/community"
                className={`inline-flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                  pathname === '/community'
                    ? 'text-white bg-[#4169E1] dark:bg-[#5278ed]'
                    : 'text-gray-500 hover:text-[#4169E1] dark:text-gray-300 dark:hover:text-[#5278ed] hover:bg-[#4169E1]/5 dark:hover:bg-[#5278ed]/10'
                } transition-all duration-200`}
              >
                Community
              </Link>
            </div>
          </div>

          {/* User Menu and Theme Toggle - Right */}
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="relative p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white focus:outline-none transition-all duration-300 overflow-hidden group"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <div className="absolute inset-0 transform transition-transform duration-500 ease-in-out">
                <div className={`absolute inset-0 ${theme === 'dark' ? 'translate-x-0' : 'translate-x-full'} bg-gradient-to-r from-[#4169E1]/20 to-[#2AB7CA]/20 transition-transform duration-500`}></div>
              </div>
              <div className="relative z-10 flex w-5 h-5 transition-all duration-500 ease-in-out">
                {theme === 'dark' ? (
                  <svg className="w-5 h-5 transform transition-all duration-500 rotate-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 transform transition-all duration-500 rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </div>
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></span>
            </button>

            {user ? (
              <div className="relative ml-3">
                <div>
                  <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex items-center max-w-xs text-sm bg-gray-800 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    {user && <UserAvatar user={user} />}
                  </button>
                </div>
                {isOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="px-4 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                      Signed in as <span className="font-semibold">{user.name || user.username || user.email}</span>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Your Profile
                    </Link>
                    {user?.roles?.includes('ROLE_ADMIN') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-[#4169E1] hover:bg-[#4169E1]/90 dark:bg-[#5278ed] dark:hover:bg-[#5278ed]/90 transition-colors duration-200"
              >
                Sign In
              </Link>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white transition-colors duration-200"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-800 shadow-inner transition-colors duration-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              href="/"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                pathname === '/'
                  ? 'text-white bg-[#4169E1] dark:bg-[#5278ed]'
                  : 'text-gray-500 dark:text-gray-300 hover:text-[#4169E1] dark:hover:text-[#5278ed] hover:bg-[#4169E1]/5 dark:hover:bg-[#5278ed]/10'
              } transition-all duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                pathname === '/courses'
                  ? 'text-white bg-[#4169E1] dark:bg-[#5278ed]'
                  : 'text-gray-500 dark:text-gray-300 hover:text-[#4169E1] dark:hover:text-[#5278ed] hover:bg-[#4169E1]/5 dark:hover:bg-[#5278ed]/10'
              } transition-all duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Courses
            </Link>
            <Link
              href="/about"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                pathname === '/about'
                  ? 'text-white bg-[#4169E1] dark:bg-[#5278ed]'
                  : 'text-gray-500 dark:text-gray-300 hover:text-[#4169E1] dark:hover:text-[#5278ed] hover:bg-[#4169E1]/5 dark:hover:bg-[#5278ed]/10'
              } transition-all duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About Us
            </Link>
            <Link
              href="/mentors"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                pathname === '/mentors'
                  ? 'text-white bg-[#4169E1] dark:bg-[#5278ed]'
                  : 'text-gray-500 dark:text-gray-300 hover:text-[#4169E1] dark:hover:text-[#5278ed] hover:bg-[#4169E1]/5 dark:hover:bg-[#5278ed]/10'
              } transition-all duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Mentors
            </Link>
            <Link
              href="/community"
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                pathname === '/community'
                  ? 'text-white bg-[#4169E1] dark:bg-[#5278ed]'
                  : 'text-gray-500 dark:text-gray-300 hover:text-[#4169E1] dark:hover:text-[#5278ed] hover:bg-[#4169E1]/5 dark:hover:bg-[#5278ed]/10'
              } transition-all duration-200`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Community
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
