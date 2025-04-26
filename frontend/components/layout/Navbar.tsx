'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useTheme } from '@/app/providers/ThemeProvider';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { BookOpen, Search, Menu, X, Sun, Moon, Loader2, MessageSquare, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useDebounce } from '@/hooks/useDebounce';
import { useOnClickOutside } from '@/hooks/useOnClickOutside';
import axios from 'axios';
import { useMessages } from '@/context/MessagesContext';

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
  
  // Search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const searchResultsRef = useRef<HTMLDivElement>(null);
  
  // Close search results when clicking outside
  useOnClickOutside(searchResultsRef, () => setShowResults(false));

  const { unreadCount } = useMessages();

  // Function to update user data
  const updateUserData = () => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        // Only update state if user data actually changed
        if (!user || 
            user.id !== userData.id || 
            user.picture !== userData.picture || 
            user.profilePicture !== userData.profilePicture) {
          setUser(userData);
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    } else if (user !== null) {
      // Only set to null if not already null
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

  // Search for users when the debounced query changes
  useEffect(() => {
    // Skip search if query is too short
    if (!debouncedSearchQuery || debouncedSearchQuery.trim().length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    // Skip search if results dropdown is hidden
    if (!showResults) {
      return;
    }

    const searchUsers = async () => {
      try {
        setIsSearching(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setIsSearching(false);
          return;
        }

        // Use a consistent caching strategy
        const cacheKey = `user_search_cache`;
        const searchKey = debouncedSearchQuery.toLowerCase();
        
        // Check session storage cache first
        let allUsers = null;
        const cachedData = sessionStorage.getItem(cacheKey);
        
        if (cachedData) {
          allUsers = JSON.parse(cachedData);
          // Filter cached users
          const filteredResults = allUsers
            .filter((result: User) => 
              result.id !== user?.id && // Filter out current user
              result.username && // Ensure username exists
              result.username.toLowerCase().includes(searchKey) // Case-insensitive search
            )
            .slice(0, 10); // Limit to 10 results
            
          setSearchResults(filteredResults);
          setIsSearching(false);
          return;
        }

        // Fetch users only if not in cache
        const response = await fetch(`http://localhost:8080/api/users`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to search users');
        }

        allUsers = await response.json();
        
        // Store all users in session storage
        try {
          sessionStorage.setItem(cacheKey, JSON.stringify(allUsers));
        } catch (e) {
          console.error('Error caching search results:', e);
        }
        
        // Filter users that match the search query by username
        const filteredResults = allUsers
          .filter((result: User) => 
            result.id !== user?.id && // Filter out current user
            result.username && // Ensure username exists
            result.username.toLowerCase().includes(searchKey) // Case-insensitive search
          )
          .slice(0, 10); // Limit to 10 results
          
        setSearchResults(filteredResults);
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    searchUsers();
  }, [debouncedSearchQuery, user?.id, showResults]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim().length > 0) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  };

  const handleSearchBlur = () => {
    // Delay hiding to allow clicking on results
    setTimeout(() => {
      if (!searchResultsRef.current?.contains(document.activeElement)) {
        setShowResults(false);
      }
    }, 200);
  };

  const handleUserSelect = (username: string) => {
    // Check if we're already on this profile page to prevent refresh loop
    if (window.location.pathname === `/profile/${username}`) {
      // Just close the dropdown without navigating
      setSearchQuery('');
      setShowResults(false);
      setSearchOpen(false);
      return;
    }
    
    // Otherwise clear the search state - navigation will happen through the link's href
    setSearchQuery('');
    setShowResults(false);
    setSearchOpen(false);
  };

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
    
    // Refresh the page once before redirecting
    window.location.href = '/login';
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
            <Input 
              type="search" 
              placeholder="Search users by username..." 
              className="w-[200px] lg:w-[300px] pl-8" 
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowResults(true)}
              onBlur={handleSearchBlur}
              id="desktop-search"
              name="desktop-search"
            />
            {showResults && (
              <div 
                ref={searchResultsRef}
                className="absolute left-0 right-0 mt-1 max-h-72 overflow-y-auto rounded-md border bg-background shadow-lg z-50"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    <p className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                      Users ({searchResults.length})
                    </p>
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/profile/${result.username}`}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-accent text-left"
                        onClick={() => handleUserSelect(result.username)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={result.picture || result.profilePicture} alt={result.username} />
                          <AvatarFallback>
                            {result.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{result.name || result.username}</p>
                          <p className="text-xs text-muted-foreground">@{result.username}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/messages?user=${result.username}`);
                          }}
                          aria-label={`Message ${result.name || result.username}`}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.trim().length > 1 ? (
                  <div className="px-4 py-3 text-sm text-center text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-center text-muted-foreground">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            )}
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

          {/* Messages Button with Notification */}
          {user && (
            <Link href="/messages" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <MessageSquare className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Button>
            </Link>
          )}

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
                    <Link
                      href="/messages"
                      onClick={() => setIsOpen(false)}
                    className="block px-4 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      <div className="flex items-center">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Messages
                      </div>
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
                  <Input 
                    type="search" 
                    placeholder="Search users by username..." 
                    className="w-full pl-8" 
                    value={searchQuery}
                    onChange={handleSearchChange}
                    onFocus={() => setShowResults(true)}
                    onBlur={handleSearchBlur}
                    id="mobile-search"
                    name="mobile-search"
                  />
                  {showResults && (
                    <div 
                      ref={searchResultsRef}
                      className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border bg-background shadow-lg z-50"
                    >
                      {isSearching ? (
                        <div className="flex items-center justify-center p-4">
                          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                        </div>
                      ) : searchResults.length > 0 ? (
                        <div className="py-1">
                          <p className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                            Users ({searchResults.length})
                          </p>
                          {searchResults.map((result) => (
                            <Link
                              key={result.id}
                              href={`/profile/${result.username}`}
                              className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-accent text-left"
                              onClick={() => handleUserSelect(result.username)}
                            >
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={result.picture || result.profilePicture} alt={result.username} />
                                <AvatarFallback>
                                  {result.username.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <p className="font-medium">{result.name || result.username}</p>
                                <p className="text-xs text-muted-foreground">@{result.username}</p>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  router.push(`/messages?user=${result.username}`);
                                }}
                                aria-label={`Message ${result.name || result.username}`}
                              >
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                            </Link>
                          ))}
                        </div>
                      ) : searchQuery.trim().length > 1 ? (
                        <div className="px-4 py-3 text-sm text-center text-muted-foreground">
                          No users found
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-sm text-center text-muted-foreground">
                          Type at least 2 characters to search
                        </div>
                      )}
                    </div>
                  )}
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
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/messages">Messages</Link>
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
            <Input 
              type="search" 
              placeholder="Search users by username..." 
              className="w-full pl-8" 
              autoFocus
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => setShowResults(true)}
              onBlur={handleSearchBlur}
            />
            <Button variant="ghost" size="icon" className="absolute right-1 top-1" onClick={() => {
              setSearchOpen(false);
              setSearchQuery('');
              setShowResults(false);
            }}>
              <X className="h-4 w-4" />
            </Button>
            
            {/* Add mobile search results dropdown here too */}
            {showResults && (
              <div 
                ref={searchResultsRef}
                className="absolute left-0 right-0 mt-1 max-h-60 overflow-y-auto rounded-md border bg-background shadow-lg z-50"
              >
                {isSearching ? (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    <span className="ml-2 text-sm text-muted-foreground">Searching...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="py-1">
                    <p className="px-4 py-2 text-xs font-medium text-muted-foreground border-b">
                      Users ({searchResults.length})
                    </p>
                    {searchResults.map((result) => (
                      <Link
                        key={result.id}
                        href={`/profile/${result.username}`}
                        className="flex items-center gap-3 w-full px-4 py-2 text-sm hover:bg-accent text-left"
                        onClick={() => handleUserSelect(result.username)}
                      >
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={result.picture || result.profilePicture} alt={result.username} />
                          <AvatarFallback>
                            {result.username.substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium">{result.name || result.username}</p>
                          <p className="text-xs text-muted-foreground">@{result.username}</p>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            router.push(`/messages?user=${result.username}`);
                          }}
                          aria-label={`Message ${result.name || result.username}`}
                        >
                          <MessageSquare className="h-4 w-4" />
                        </Button>
                      </Link>
                    ))}
                  </div>
                ) : searchQuery.trim().length > 1 ? (
                  <div className="px-4 py-3 text-sm text-center text-muted-foreground">
                    No users found
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-center text-muted-foreground">
                    Type at least 2 characters to search
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
