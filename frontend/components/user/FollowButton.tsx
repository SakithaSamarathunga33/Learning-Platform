'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { UserPlus, UserMinus } from 'lucide-react';
import React from 'react';

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 
           'ghost' | 'link' | null | undefined;
  size?: 'default' | 'sm' | 'lg' | 'icon' | null | undefined;
  onFollowChange?: (isFollowing: boolean) => void;
}

export default function FollowButton({ 
  targetUserId, 
  className = '',
  variant = 'outline',
  size = 'sm',
  onFollowChange
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const router = useRouter();

  // Add a ref to track if this is the initial mount
  const isInitialMount = React.useRef(true);

  useEffect(() => {
    // Get current user ID from localStorage
    const userStr = localStorage.getItem('user');
    if (!userStr) return;

    try {
      const userData = JSON.parse(userStr);
      if (userData && userData.id) {
        setCurrentUserId(userData.id);
        // Check if already following
        checkIfFollowing(userData.id, targetUserId);
      }
    } catch (err) {
      console.error('Error parsing user data:', err);
    }
  }, [targetUserId]);

  const checkIfFollowing = async (userId: string, targetId: string) => {
    // Skip API call if we're just remounting the same component with the same props
    if (!isInitialMount.current && userId === currentUserId && targetId === targetUserId) {
      return;
    }
    
    isInitialMount.current = false;
    
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await fetch(`http://localhost:8080/api/users/${userId}/is-following/${targetId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error('Failed to check following status');
      
      const data = await response.json();
      setIsFollowing(data.isFollowing);
      
      // Call the callback if provided
      if (onFollowChange) {
        onFollowChange(data.isFollowing);
      }
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  };

  const handleFollowClick = async () => {
    if (!currentUserId) {
      // Redirect to login if user is not authenticated
      router.push('/login');
      return;
    }

    if (currentUserId === targetUserId) {
      toast.error("You can't follow yourself");
      return;
    }

    setIsLoading(true);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        router.push('/login');
        return;
      }

      const endpoint = isFollowing 
        ? `http://localhost:8080/api/users/${currentUserId}/unfollow/${targetUserId}`
        : `http://localhost:8080/api/users/${currentUserId}/follow/${targetUserId}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }

      // Toggle following state
      setIsFollowing(!isFollowing);
      
      // Show success message
      toast.success(isFollowing ? 'Unfollowed successfully' : 'Followed successfully');
      
      // Call the callback if provided
      if (onFollowChange) {
        onFollowChange(!isFollowing);
      }
      
      // Update user in localStorage with new following/followers data
      const data = await response.json();
      if (data.user) {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const userData = JSON.parse(userStr);
          localStorage.setItem('user', JSON.stringify({
            ...userData,
            following: data.user.following,
            followers: data.user.followers
          }));
        }
      }
    } catch (err) {
      console.error('Error toggling follow status:', err);
      toast.error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleFollowClick}
      disabled={isLoading || currentUserId === targetUserId}
    >
      {isFollowing ? (
        <>
          <UserMinus className="h-4 w-4 mr-2" />
          Unfollow
        </>
      ) : (
        <>
          <UserPlus className="h-4 w-4 mr-2" />
          Follow
        </>
      )}
    </Button>
  );
} 