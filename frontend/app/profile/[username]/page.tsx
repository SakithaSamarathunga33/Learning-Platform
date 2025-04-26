'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import React from 'react';
import { 
  User as UserIcon, 
  Mail, 
  Calendar, 
  MapPin,
  Link as LinkIcon,
  Briefcase,
  Users
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import FollowButton from '@/components/user/FollowButton';
import FollowersModal from '@/components/user/FollowersModal';

interface User {
  id: string;
  username: string;
  email: string;
  picture?: string;
  name?: string;
  provider?: string;
  roles?: string[];
  bio?: string;
  location?: string;
  website?: string;
  occupation?: string;
  skills?: string;
  followers?: string[];
  following?: string[];
}

export default function UserProfilePage({ params }: { params: { username: string } }) {
  const [profile, setProfile] = useState<User | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');
  const router = useRouter();
  
  // Get username directly from params
  const username = params.username;
  
  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setCurrentUser(JSON.parse(userStr));
      } catch (err) {
        console.error('Error parsing current user:', err);
      }
    }
    
    let isMounted = true;
    
    const fetchProfile = async () => {
      if (!isMounted) return;
      await fetchUserProfile(username);
    };
    
    fetchProfile();
    
    return () => {
      isMounted = false;
    };
  }, [username]);
  
  const fetchUserProfile = async (username: string) => {
    if (!username) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8080/api/users/username/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('User not found');
        } else {
          setError('Error loading profile');
        }
        setIsLoading(false);
        return;
      }
      
      const userData = await response.json();
      setProfile(userData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleFollowChange = (isFollowing: boolean) => {
    if (!profile || !currentUser) return;
    
    // Update the profile optimistically
    const updatedProfile = { ...profile };
    
    // Add or remove the current user from followers list
    if (isFollowing) {
      // Add current user to followers if not already there
      if (!updatedProfile.followers?.includes(currentUser.id)) {
        updatedProfile.followers = [...(updatedProfile.followers || []), currentUser.id];
      }
    } else {
      // Remove current user from followers
      updatedProfile.followers = updatedProfile.followers?.filter(id => id !== currentUser.id) || [];
    }
    
    // Update state immediately for better UX
    setProfile(updatedProfile);
    
    // Don't need to fetch the profile again immediately
    // The next time the user navigates to this profile, it will fetch fresh data
  };
  
  const openFollowersModal = (tab: 'followers' | 'following') => {
    setFollowersModalTab(tab);
    setShowFollowersModal(true);
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto py-6 px-4">
        <div className="flex items-center gap-4 mb-6">
          <Skeleton className="h-24 w-24 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
        
        <Skeleton className="h-32 w-full mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full md:col-span-2" />
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-4xl mx-auto py-12 text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {error}
        </h2>
        <p className="text-gray-600 mb-6">
          We couldn't find the user you're looking for.
        </p>
        <Button onClick={() => router.push('/')}>
          Return to Home
        </Button>
      </div>
    );
  }
  
  if (!profile) {
    return null;
  }
  
  const followersCount = profile.followers?.length || 0;
  const followingCount = profile.following?.length || 0;
  
  return (
    <div className="container max-w-4xl mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8">
        <Avatar className="h-24 w-24">
          <AvatarImage src={profile.picture || ''} alt={profile.username} />
          <AvatarFallback>{profile.username.substring(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {profile.name || profile.username}
          </h1>
          <p className="text-gray-500 mb-2">@{profile.username}</p>
          
          {profile.bio && (
            <p className="text-gray-700 my-2">{profile.bio}</p>
          )}
          
          <div className="flex flex-wrap gap-4 mt-3">
            <button 
              onClick={() => openFollowersModal('followers')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
            >
              <span className="font-semibold">{followersCount}</span> followers
            </button>
            
            <button 
              onClick={() => openFollowersModal('following')}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-1 text-sm"
            >
              <span className="font-semibold">{followingCount}</span> following
            </button>
          </div>
        </div>
        
        <div className="w-full md:w-auto mt-2 md:mt-0">
          {currentUser && currentUser.id !== profile.id && (
            <FollowButton 
              targetUserId={profile.id}
              variant="default"
              size="default"
              onFollowChange={handleFollowChange}
            />
          )}
        </div>
      </div>
      
      <Separator className="my-6" />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <h3 className="text-lg font-semibold">About</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {profile.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profile.location}</span>
                </div>
              )}
              
              {profile.website && (
                <div className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-500" />
                  <a 
                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {profile.website.replace(/^https?:\/\//, '')}
                  </a>
                </div>
              )}
              
              {profile.occupation && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-gray-500" />
                  <span className="text-sm">{profile.occupation}</span>
                </div>
              )}
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm">Joined March 2023</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="md:col-span-2">
          <Tabs defaultValue="courses">
            <TabsList className="mb-4">
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            
            <TabsContent value="courses" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    No courses yet
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    No achievements yet
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="activity" className="mt-0">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-8 text-gray-500">
                    No recent activity
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {profile && (
        <FollowersModal 
          userId={profile.id}
          username={profile.username}
          open={showFollowersModal}
          onOpenChange={setShowFollowersModal}
          defaultTab={followersModalTab}
          onFollowChange={(isFollowing, userId) => {
            // If the followed/unfollowed user is the current profile, update followers count
            if (userId === profile.id) {
              handleFollowChange(isFollowing);
            }
          }}
        />
      )}
    </div>
  );
} 