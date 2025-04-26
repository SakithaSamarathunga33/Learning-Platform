'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, UserPlus, UserMinus, Loader2 } from 'lucide-react';
import FollowButton from '@/components/user/FollowButton';

interface User {
  id: string;
  username: string;
  email: string;
  name?: string;
  picture?: string;
  profilePicture?: string;
  bio?: string;
  roles?: string[];
  followers?: string[];
  following?: string[];
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Load user data from localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (err) {
        console.error('Error parsing current user:', err);
      }
    }
    
    // Only fetch users once when component mounts
    if (!isInitialized) {
      fetchAllUsers();
      setIsInitialized(true);
    }
  }, [isInitialized]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = users.filter(user => 
        user.username.toLowerCase().includes(lowercaseQuery) || 
        (user.name && user.name.toLowerCase().includes(lowercaseQuery))
      );
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

  const fetchAllUsers = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setIsLoading(false);
        return;
      }
      
      const response = await fetch('http://localhost:8080/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error fetching users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to load users. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFollowChange = (isFollowing: boolean, userId: string) => {
    // Update users list optimistically without fetching again
    setUsers(prevUsers => 
      prevUsers.map(user => {
        if (user.id === userId) {
          // If this is the user we're following/unfollowing
          const currentUserStr = localStorage.getItem('user');
          if (!currentUserStr) return user;
          
          const currentUser = JSON.parse(currentUserStr);
          const currentUserId = currentUser.id;
          
          // Update followers array
          let updatedFollowers = [...(user.followers || [])];
          
          if (isFollowing) {
            // Add current user to followers if not already there
            if (!updatedFollowers.includes(currentUserId)) {
              updatedFollowers.push(currentUserId);
            }
          } else {
            // Remove current user from followers
            updatedFollowers = updatedFollowers.filter(id => id !== currentUserId);
          }
          
          return {
            ...user,
            followers: updatedFollowers
          };
        }
        return user;
      })
    );
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">All Users</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">All Users</h1>
        <div className="bg-red-50 p-4 rounded-md text-red-500 mb-6">
          {error}
        </div>
        <Button onClick={fetchAllUsers}>Retry</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">All Users</h1>
      
      <div className="flex items-center mb-8 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        <Input
          className="pl-10"
          placeholder="Search users by name or username..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          id="users-search"
          name="users-search"
        />
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          {searchQuery ? 'No users match your search criteria.' : 'No users found.'}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card key={user.id} className="overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <Link 
                    href={`/profile/${user.username}`}
                    className="flex items-center gap-3 hover:opacity-80 transition-opacity"
                  >
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={user.picture || user.profilePicture || ''} alt={user.username} />
                      <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{user.name || user.username}</h3>
                      <p className="text-sm text-gray-500">@{user.username}</p>
                    </div>
                  </Link>
                  
                  {currentUser && currentUser.id !== user.id && (
                    <FollowButton 
                      targetUserId={user.id}
                      onFollowChange={(isFollowing) => handleFollowChange(isFollowing, user.id)}
                    />
                  )}
                </div>
                
                {user.bio && (
                  <p className="mt-4 text-sm text-gray-600 line-clamp-2">{user.bio}</p>
                )}
                
                <div className="flex gap-4 mt-4 text-xs text-gray-500">
                  <span>{user.followers?.length || 0} followers</span>
                  <span>{user.following?.length || 0} following</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 