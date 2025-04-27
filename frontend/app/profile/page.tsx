/* eslint-disable react-hooks/exhaustive-deps */
 
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ImageUpload, { ImageUploadHandle } from '@/components/ImageUpload';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Settings,
  Briefcase,
  GraduationCap,
  MapPin,
  Mail,
  Award,
  CheckCircle,
  Pencil,
  Trash2,
  FileEdit,
  Plus,
  Image,
  ImagePlus,
  X,
  Users
} from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import AchievementUpload from '@/components/AchievementUpload';
import FollowersModal from '@/components/user/FollowersModal';

interface User {
  id: string;
  username: string;
  email: string;
  picture?: string;
  name?: string;
  provider?: string;
  roles: string[];
  bio?: string;
  location?: string;
  website?: string;
  occupation?: string;
  skills?: string;
  following?: string[];
  followers?: string[];
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  createdAt: string;
  likes: number;
  hasLiked?: boolean;
  user: {
    id: string;
    username: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();
  const imageUploadRef = useRef<ImageUploadHandle>(null);
  
  // My Posts State
  const [userPosts, setUserPosts] = useState<Achievement[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(false);
  const [postsError, setPostsError] = useState('');
  const [selectedPost, setSelectedPost] = useState<Achievement | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [postTitle, setPostTitle] = useState('');
  const [postDescription, setPostDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Followers State
  const [showFollowersModal, setShowFollowersModal] = useState(false);
  const [followersModalTab, setFollowersModalTab] = useState<'followers' | 'following'>('followers');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      router.push('/login');
      return;
    }

    if (userStr) {
      try {
        const userData = JSON.parse(userStr);
        const completeUserData = {
          ...userData,
          name: userData.name || '',
          picture: userData.picture || '',
          username: userData.username || '',
          email: userData.email || '',
          provider: userData.provider || 'local',
          roles: userData.roles || [],
          bio: userData.bio || '',
          location: userData.location || '',
          website: userData.website || '',
          occupation: userData.occupation || '',
          skills: userData.skills || '',
          following: userData.following || [],
          followers: userData.followers || []
        };
        setUser(completeUserData);
        setEditedUser(completeUserData);
        setIsLoading(false);
      } catch (err) {
        console.error('Error parsing user data:', err);
        fetchUserData(token);
      }
    } else {
      fetchUserData(token);
    }
  }, [router]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('http://localhost:8080/api/auth/current-user', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      const userData = {
        id: data.id || '',
        username: data.username || '',
        email: data.email || '',
        name: data.name || '',
        picture: data.picture || '',
        provider: data.provider || 'local',
        roles: data.roles || [],
        bio: data.bio || '',
        location: data.location || '',
        website: data.website || '',
        occupation: data.occupation || '',
        skills: data.skills || '',
        following: data.following || [],
        followers: data.followers || []
      };
      
      setUser(userData);
      setEditedUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (err) {
      setError('Failed to load user data');
      console.error('Error fetching user data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    if (!user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }
      
      const response = await fetch(`http://localhost:8080/api/users/${user.id}/picture`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ pictureUrl: imageUrl })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update profile picture: ${errorText}`);
      }

      const updatedUser = await response.json();
      
      // Update local state
      setUser(updatedUser);
      setEditedUser(updatedUser);
      
      // Update user in localStorage
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast.success('Profile picture updated successfully!');
    } catch (err) {
      console.error('Error uploading profile picture:', err);
      setError(err instanceof Error ? err.message : 'Error uploading profile picture');
      toast.error('Failed to update profile picture');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!editedUser) return;
    const { name, value } = e.target;
    setEditedUser(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedUser || !user) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication token not found. Please log in again.');
        return;
      }

      const updatedFields: Partial<User> = {};
      
      if (user.provider === 'google') {
        if (editedUser.name !== user.name) updatedFields.name = editedUser.name;
        if (editedUser.bio !== user.bio) updatedFields.bio = editedUser.bio;
        if (editedUser.location !== user.location) updatedFields.location = editedUser.location;
        if (editedUser.occupation !== user.occupation) updatedFields.occupation = editedUser.occupation;
      } else {
        if (editedUser.username !== user.username) updatedFields.username = editedUser.username;
        if (editedUser.name !== user.name) updatedFields.name = editedUser.name;
        if (editedUser.bio !== user.bio) updatedFields.bio = editedUser.bio;
        if (editedUser.location !== user.location) updatedFields.location = editedUser.location;
        if (editedUser.website !== user.website) updatedFields.website = editedUser.website;
        if (editedUser.occupation !== user.occupation) updatedFields.occupation = editedUser.occupation;
        if (editedUser.skills !== user.skills) updatedFields.skills = editedUser.skills;
      }

      if (Object.keys(updatedFields).length === 0) {
        return;
      }

      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedFields)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to update user details');
      }

      const updatedUser = await response.json();
      const completeUserData = {
        ...updatedUser,
        name: updatedUser.name || '',
        picture: updatedUser.picture || '',
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        provider: updatedUser.provider || 'local',
        bio: updatedUser.bio || '',
        location: updatedUser.location || '',
        website: updatedUser.website || '',
        occupation: updatedUser.occupation || '',
        skills: updatedUser.skills || ''
      };
      
      setUser(completeUserData);
      setEditedUser(completeUserData);
      localStorage.setItem('user', JSON.stringify(completeUserData));
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user details');
    }
  };

  // Add this function to fetch user's posts
  const fetchUserPosts = async () => {
    if (!user) return;

    try {
      setIsLoadingPosts(true);
      setPostsError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login?redirect=/profile');
        setPostsError('Please login to view your posts');
        return;
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/achievements/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      
      if (response.status === 401) {
        // Unauthorized - token expired or invalid
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        router.push('/login?redirect=/profile');
        throw new Error('Session expired. Please login again.');
      } else if (response.status === 403) {
        // Forbidden - user doesn't have permission 
        throw new Error('You do not have permission to view these posts.');
      } else if (!response.ok) {
        throw new Error(`Failed to fetch your posts (Status: ${response.status})`);
      }
      
      const data = await response.json();
      setUserPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching user posts:', err);
      setPostsError(err instanceof Error ? err.message : 'Failed to load your posts');
    } finally {
      setIsLoadingPosts(false);
    }
  };

  // Add handlers for post operations
  const openEditDialog = (post: Achievement) => {
    setSelectedPost(post);
    setPostTitle(post.title);
    setPostDescription(post.description);
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (post: Achievement) => {
    setSelectedPost(post);
    setIsDeleteDialogOpen(true);
  };

  const handleUpdatePost = async () => {
    if (!selectedPost) return;
    
    try {
      setIsSubmitting(true);
      
      if (!postTitle.trim()) {
        throw new Error('Title is required');
      }

      if (!postDescription.trim()) {
        throw new Error('Description is required');
      }

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/achievements/${selectedPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: postTitle,
          description: postDescription
        })
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update post (Status: ${response.status})`);
      }
      
      toast.success('Post updated successfully');
      setIsEditDialogOpen(false);
      fetchUserPosts(); // Refresh the posts
    } catch (err) {
      console.error('Error updating post:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    if (!selectedPost) return;
    
    try {
      setIsSubmitting(true);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/achievements/${selectedPost.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to delete post (Status: ${response.status})`);
      }
      
      toast.success('Post deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchUserPosts(); // Refresh the posts
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load posts when the tab is selected
  useEffect(() => {
    if (activeTab === 'posts' && user) {
      fetchUserPosts();
    }
  }, [activeTab, user]);

  const openFollowersModal = (tab: 'followers' | 'following') => {
    setFollowersModalTab(tab);
    setShowFollowersModal(true);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-center">
            <Skeleton className="h-20 w-20 rounded-full mx-auto mb-4" />
            <Skeleton className="h-8 w-48 mx-auto mb-2" />
            <Skeleton className="h-4 w-32 mx-auto" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
  return (
      <div className="container mx-auto p-4">
        <div className="flex flex-col items-center justify-center h-96">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">User not found</h1>
            <p className="mb-6">There was an error loading your profile.</p>
            <Button onClick={() => router.push('/')}>
              Return to Home
            </Button>
            </div>
              </div>
                </div>
    );
  }

  const followersCount = user.followers?.length || 0;
  const followingCount = user.following?.length || 0;

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">My Profile</h1>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="posts">My Posts</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="md:col-span-1">
                    <CardHeader>
                <CardTitle>Profile</CardTitle>
                <CardDescription>Your personal information</CardDescription>
                    </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt={user.username} 
                      className="w-32 h-32 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="w-12 h-12 text-gray-400" />
                        </div>
                      )}
                  <Button 
                    size="icon" 
                    variant="outline" 
                    className="absolute bottom-0 right-0 rounded-full" 
                    onClick={() => imageUploadRef.current?.triggerFileInput()}
                  >
                    <ImagePlus className="h-4 w-4" />
                  </Button>
                          </div>
                
                <h2 className="text-xl font-bold mt-2">{user.name || user.username}</h2>
                <p className="text-gray-500 mb-4">@{user.username}</p>
                
                {user.bio && (
                  <p className="text-gray-700 mb-4">{user.bio}</p>
                )}
                
                <div className="flex justify-center space-x-6 mb-6">
                  <button 
                    onClick={() => openFollowersModal('followers')}
                    className="text-center"
                  >
                    <div className="font-semibold">{followersCount}</div>
                    <div className="text-xs text-gray-500">Followers</div>
                  </button>
                  
                  <button 
                    onClick={() => openFollowersModal('following')}
                    className="text-center"
                  >
                    <div className="font-semibold">{followingCount}</div>
                    <div className="text-xs text-gray-500">Following</div>
                  </button>
                          </div>

                <div className="w-full space-y-3">
                  {user.email && (
                    <div className="flex items-center">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">{user.email}</span>
                        </div>
                      )}
                  {user.occupation && (
                    <div className="flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">{user.occupation}</span>
                        </div>
                      )}
                  {user.location && (
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                      <span className="text-sm text-gray-700">{user.location}</span>
                        </div>
                      )}
                </div>
                    </CardContent>
              <CardFooter className="flex justify-center">
                <Button variant="outline" onClick={() => setActiveTab('settings')}>
                  Edit Profile
                </Button>
              </CardFooter>
                  </Card>
            
            {/* About Me card removed */}
              </div>
            </TabsContent>

        <TabsContent value="posts">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>My Posts</CardTitle>
                      <CardDescription>View and manage your posts</CardDescription>
                    </div>
                    <Button onClick={() => router.push('/create-post')}>
                      <Plus className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoadingPosts ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="flex gap-4 items-start">
                          <Skeleton className="h-24 w-24 rounded-md" />
                          <div className="space-y-2 flex-1">
                            <Skeleton className="h-4 w-[250px]" />
                            <Skeleton className="h-4 w-[200px]" />
                            <Skeleton className="h-4 w-[300px]" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : postsError ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">{postsError}</p>
                      <Button 
                        variant="outline" 
                        className="mt-4" 
                        onClick={fetchUserPosts}
                      >
                        Try Again
                      </Button>
                    </div>
                  ) : userPosts.length === 0 ? (
                    <div className="text-center py-12">
                      <ImagePlus className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium">No posts yet</h3>
                      <p className="text-muted-foreground mt-2 mb-6">
                        You haven't created any posts yet. Share your achievements with the community!
                      </p>
                      <Button onClick={() => router.push('/create-post')}>
                        Create Your First Post
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {userPosts.map(post => (
                        <div key={post.id} className="flex flex-col md:flex-row gap-4 border rounded-lg p-4">
                          <div className="md:w-1/4 w-full">
                            <div className="aspect-video rounded-md overflow-hidden bg-muted">
                              {post.imageUrl ? (
                                <img 
                                  src={post.imageUrl} 
                                  alt={post.title} 
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <ImagePlus className="h-8 w-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="flex-1 space-y-2">
                            <div className="flex justify-between items-start">
                              <h3 className="font-semibold text-lg">{post.title}</h3>
                              <div className="flex space-x-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => openEditDialog(post)}
                                >
                                  <FileEdit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="text-destructive"
                                  onClick={() => openDeleteDialog(post)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                            <p className="text-muted-foreground text-sm line-clamp-2">
                              {post.description}
                            </p>
                            <div className="flex justify-between items-center text-sm">
                              <span className="text-muted-foreground">
                                {new Date(post.createdAt).toLocaleDateString()}
                              </span>
                              <Badge variant="outline" className="bg-primary/10">
                                {post.likes || 0} {post.likes === 1 ? 'like' : 'likes'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
                {userPosts.length > 0 && (
                  <CardFooter className="flex justify-between">
                    <p className="text-sm text-muted-foreground">
                      Showing {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'}
                    </p>
                    <Button variant="outline" onClick={fetchUserPosts}>
                      Refresh
                    </Button>
                  </CardFooter>
                )}
              </Card>
            </TabsContent>

        <TabsContent value="settings">
                  <Card>
                    <CardHeader>
              <CardTitle>Profile Settings</CardTitle>
                      <CardDescription>Update your personal information</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <label className="block text-sm font-medium mb-1">Username</label>
                            <Input
                              name="username"
                              value={editedUser?.username || ''}
                              onChange={handleInputChange}
                              disabled={user?.provider === 'google'}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Name</label>
                            <Input
                              name="name"
                              value={editedUser?.name || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Location</label>
                            <Input
                              name="location"
                              value={editedUser?.location || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium mb-1">Occupation</label>
                            <Input
                              name="occupation"
                              value={editedUser?.occupation || ''}
                              onChange={handleInputChange}
                            />
                          </div>
                          <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Website</label>
                            <Input
                              name="website"
                              value={editedUser?.website || ''}
                              onChange={handleInputChange}
                              disabled={user?.provider === 'google'}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Bio</label>
                          <Textarea
                            name="bio"
                            value={editedUser?.bio || ''}
                            onChange={handleInputChange}
                            placeholder="Tell us about yourself"
                            className="min-h-[120px]"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium mb-1">Skills</label>
                            <Input
                              name="skills"
                              value={editedUser?.skills || ''}
                              onChange={handleInputChange}
                              placeholder="HTML, CSS, JavaScript, etc."
                              disabled={user?.provider === 'google'}
                            />
                          <p className="text-sm text-muted-foreground mt-1">Separate skills with commas</p>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setEditedUser(user);
                              setError('');
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="submit">Save Changes</Button>
                        </div>
                      </form>
                    </CardContent>
                  </Card>
            </TabsContent>
          </Tabs>
      
      <ImageUpload 
        ref={imageUploadRef}
        onImageUpload={handleImageUpload}
        currentImage={user.picture}
      />
      
      {user && (
        <FollowersModal 
          userId={user.id}
          username={user.username}
          open={showFollowersModal}
          onOpenChange={setShowFollowersModal}
          defaultTab={followersModalTab}
        />
      )}
    </div>
  );
}
