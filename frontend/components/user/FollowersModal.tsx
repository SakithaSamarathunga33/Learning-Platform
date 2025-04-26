'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import FollowButton from './FollowButton';

interface User {
  id: string;
  username: string;
  name?: string;
  picture?: string;
}

interface FollowersModalProps {
  userId: string;
  username: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultTab?: 'followers' | 'following';
  onFollowChange?: (isFollowing: boolean, userId: string) => void;
}

export default function FollowersModal({
  userId,
  username,
  open,
  onOpenChange,
  defaultTab = 'followers',
  onFollowChange
}: FollowersModalProps) {
  const [followers, setFollowers] = useState<User[]>([]);
  const [following, setFollowing] = useState<User[]>([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollowing, setIsLoadingFollowing] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    if (open) {
      fetchFollowers();
      fetchFollowing();
    }
  }, [open, userId]);

  const fetchFollowers = async () => {
    setIsLoadingFollowers(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`http://localhost:8080/api/users/${userId}/followers`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch followers');
      }
      
      const data = await response.json();
      setFollowers(data);
    } catch (err) {
      console.error('Error fetching followers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load followers');
    } finally {
      setIsLoadingFollowers(false);
    }
  };

  const fetchFollowing = async () => {
    setIsLoadingFollowing(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await fetch(`http://localhost:8080/api/users/${userId}/following`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch following');
      }
      
      const data = await response.json();
      setFollowing(data);
    } catch (err) {
      console.error('Error fetching following:', err);
      setError(err instanceof Error ? err.message : 'Failed to load following');
    } finally {
      setIsLoadingFollowing(false);
    }
  };

  const handleFollowChange = (userId: string, isFollowing: boolean) => {
    // Get current user data
    const currentUserStr = localStorage.getItem('user');
    if (!currentUserStr) return;
    
    try {
      const currentUser = JSON.parse(currentUserStr);
      
      // Update the following list
      if (isFollowing) {
        // Add to the following list if not already present
        if (!following.some(user => user.id === userId)) {
          const userToAdd = followers.find(user => user.id === userId);
          if (userToAdd) {
            setFollowing(prev => [...prev, userToAdd]);
          }
        }
      } else {
        // Remove from following list if present
        setFollowing(prev => prev.filter(user => user.id !== userId));
      }
      
      // If we're looking at the current user's profile, also update followers list
      if (userId === currentUser.id) {
        if (isFollowing) {
          // Find the current user in the local storage to add to followers
          const currentUserObj = {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            picture: currentUser.picture
          };
          if (!followers.some(user => user.id === currentUser.id)) {
            setFollowers(prev => [...prev, currentUserObj]);
          }
        } else {
          // Remove current user from followers
          setFollowers(prev => prev.filter(user => user.id !== currentUser.id));
        }
      }
      
      // Call the parent component's callback if provided
      if (onFollowChange) {
        onFollowChange(isFollowing, userId);
      }
    } catch (err) {
      console.error('Error updating follow state:', err);
    }
  };

  // Add a navigation handler that avoids infinite refreshes
  const navigateToProfile = (username: string) => {
    // First ensure modal is closed to prevent state conflicts
    onOpenChange(false);
    
    // Check if we're already on this profile to prevent unnecessary refreshes
    if (window.location.pathname === `/profile/${username}`) {
      return; // Already on this profile, no need to navigate
    }
    
    // Use router.push but prevent automatic refresh
    router.push(`/profile/${username}`, { scroll: false });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{username}'s Connections</DialogTitle>
          <DialogDescription>
            View followers and following.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue={defaultTab} className="w-full mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers">
              Followers ({followers.length})
            </TabsTrigger>
            <TabsTrigger value="following">
              Following ({following.length})
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="followers" className="mt-4">
            <ScrollArea className="h-72">
              {isLoadingFollowers ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : followers.length > 0 ? (
                <div className="space-y-4">
                  {followers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <button 
                        onClick={() => navigateToProfile(user.username)}
                        className="flex items-center gap-3 text-left hover:bg-accent rounded-md p-1"
                      >
                        <Avatar>
                          <AvatarImage src={user.picture || ''} alt={user.username} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || user.username}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </button>
                      <FollowButton 
                        targetUserId={user.id} 
                        onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  No followers yet
                </div>
              )}
            </ScrollArea>
          </TabsContent>
          
          <TabsContent value="following" className="mt-4">
            <ScrollArea className="h-72">
              {isLoadingFollowing ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : following.length > 0 ? (
                <div className="space-y-4">
                  {following.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <button 
                        onClick={() => navigateToProfile(user.username)}
                        className="flex items-center gap-3 text-left hover:bg-accent rounded-md p-1"
                      >
                        <Avatar>
                          <AvatarImage src={user.picture || ''} alt={user.username} />
                          <AvatarFallback>{user.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{user.name || user.username}</div>
                          <div className="text-sm text-gray-500">@{user.username}</div>
                        </div>
                      </button>
                      <FollowButton 
                        targetUserId={user.id} 
                        onFollowChange={(isFollowing) => handleFollowChange(user.id, isFollowing)}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  Not following anyone yet
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 