'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Menu, X, Sun, Moon } from "lucide-react";

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  picture?: string;
  profilePicture?: string;
  roles?: string[];
}

const routes = [
  {
    name: "Home",
    path: "/",
  },
  {
    name: "Courses",
    path: "/courses",
  },
  {
    name: "Feed",
    path: "/feed",
  },
  {
    name: "About",
    path: "/about",
  },
];

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
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
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary ring-2 ring-white dark:ring-gray-700 transition-all duration-200 font-medium">
            {(user?.username || user?.name)?.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) || '?'}
          </div>
        )}
        <span className="absolute -top-1 -right-1 h-3 w-3 bg-green-400 rounded-full">
          <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-75"></span>
        </span>
      </div>
    );
  };

  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container flex h-16 items-center justify-between py-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">EduLearn</span>
            </Link>
          <nav className="hidden md:flex gap-6">
            {routes.map((route) => (
              <Link
                key={route.path}
                href={route.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  pathname === route.path ? "text-primary" : "text-foreground/70"
                }`}
              >
                {route.name}
              </Link>
            ))}
          </nav>
            </div>

        <div className="flex items-center gap-4">
          {/* Desktop Search */}
          <div className="relative hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search courses..." className="w-[200px] lg:w-[300px] pl-8" />
          </div>

          {/* Mobile Search Toggle */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setSearchOpen(!searchOpen)}>
            <Search className="h-5 w-5" />
          </Button>

            {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
              onClick={toggleTheme}
            className="relative overflow-hidden"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
                {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
                ) : (
              <Moon className="h-5 w-5" />
                )}
          </Button>

          {/* Auth Buttons or User Menu */}
            {user ? (
            <div className="relative">
              <Button
                variant="ghost"
                size="icon"
                    onClick={() => setIsOpen(!isOpen)}
                className="rounded-full p-0 h-auto"
              >
                <UserAvatar user={user} />
              </Button>
                {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-background border z-10">
                  <div className="px-4 py-2 text-xs text-muted-foreground border-b">
                      Signed in as <span className="font-semibold">{user.name || user.username || user.email}</span>
                    </div>
                    <Link
                      href="/profile"
                      onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      Your Profile
                    </Link>
                    {user?.roles?.includes('ROLE_ADMIN') && (
                      <Link
                        href="/admin"
                        onClick={() => setIsOpen(false)}
                      className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setIsOpen(false);
                        handleLogout();
                      }}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Log in</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between py-4 border-b">
                  <Link href="/" className="flex items-center gap-2">
                    <BookOpen className="h-6 w-6 text-primary" />
                    <span className="text-xl font-bold">EduLearn</span>
                  </Link>
          </div>

                {/* Mobile Search */}
                <div className="relative my-4">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input type="search" placeholder="Search courses..." className="w-full pl-8" />
      </div>

      {/* Mobile Navigation */}
                <nav className="flex flex-col gap-4 py-4">
                  {routes.map((route) => (
            <Link
                      key={route.path}
                      href={route.path}
                      className={`text-base font-medium transition-colors hover:text-primary ${
                        pathname === route.path ? "text-primary" : "text-foreground/70"
                      }`}
                    >
                      {route.name}
            </Link>
                  ))}
                </nav>

                <div className="mt-auto flex flex-col gap-2 py-4 border-t">
                  {user ? (
                    <>
                      <div className="flex items-center gap-3 mb-4 p-2 bg-muted rounded-lg">
                        <UserAvatar user={user} />
                        <div>
                          <p className="font-medium">{user.name || user.username}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/profile">Your Profile</Link>
                      </Button>
                      {user?.roles?.includes('ROLE_ADMIN') && (
                        <Button variant="outline" asChild className="w-full">
                          <Link href="/admin">Admin Dashboard</Link>
                        </Button>
                      )}
                      <Button 
                        variant="destructive" 
                        className="w-full"
                        onClick={handleLogout}
                      >
                        Sign out
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/login">Log in</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/register">Sign up</Link>
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Mobile Search Expanded (Conditional) */}
      {searchOpen && (
        <div className="md:hidden px-4 py-2 border-t">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input type="search" placeholder="Search courses..." className="w-full pl-8" autoFocus />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1" onClick={() => setSearchOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
