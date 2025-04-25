/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable jsx-a11y/alt-text */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react/no-unescaped-entities */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect, useRef } from 'react'; // Added useRef
import { useRouter } from 'next/navigation';
import ImageUpload, { ImageUploadHandle } from '@/components/ImageUpload'; // Fixed import and added ImageUploadHandle
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Fixed import
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'; // Fixed import
import { Button } from '@/components/ui/button'; // Fixed import
import { Input } from '@/components/ui/input'; // Fixed import
import { Textarea } from '@/components/ui/textarea'; // Fixed import
import { Badge } from '@/components/ui/badge'; // Fixed import
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
  X
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
          skills: userData.skills || ''
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
        skills: data.skills || ''
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
      
      const event = new CustomEvent('userDataChanged');
      window.dispatchEvent(event);
      
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile picture');
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
        throw new Error('Authentication required');
      }
      
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/achievements/user/${user.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        cache: 'no-store'
      });
      
      if (!response.ok) {
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="container py-12 flex-1">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Profile Header */}
      <section className="bg-primary/10 py-12">
        <div className="container">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            <div className="relative group">
              <ImageUpload
                ref={imageUploadRef}
                currentImage={user?.picture}
                onImageUpload={handleImageUpload}
                className="w-32 h-32 border-4 border-background rounded-full"
              />
              <button
                onClick={() => imageUploadRef.current?.triggerFileInput()}
                className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full shadow-md hover:bg-primary/90 transition-all"
                title="Upload new photo"
              >
                <Pencil className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                <h1 className="text-3xl font-bold">{user?.name || user?.username}</h1>
                <Badge className="w-fit mx-auto md:mx-0">
                  {user?.roles.includes('ROLE_ADMIN') ? 'Admin' : 'User'}
                </Badge>
              </div>
              <p className="text-muted-foreground mt-2 max-w-2xl">
                {user?.bio || 'No bio provided'}
              </p>
              {user?.skills && (
                <div className="flex flex-wrap gap-2 mt-4 justify-center md:justify-start">
                  {user.skills.split(',').map(skill => (
                    <Badge key={skill.trim()} variant="outline" className="bg-primary/10">
                      {skill.trim()}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 min-w-[150px]">
              <div className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user?.email}</p>
                </div>
              </div>
              {user?.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{user.location}</p>
                  </div>
                </div>
              )}
              {user?.provider && (
                <div className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Provider</p>
                    <p className="font-medium capitalize">{user.provider}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12 flex-1">
        <div className="container">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b">
              <div className="flex overflow-x-auto">
                <TabsList className="bg-transparent h-auto p-0 flex gap-6">
                  <TabsTrigger
                    value="profile"
                    className="flex items-center gap-2 px-1 py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent h-auto"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </TabsTrigger>
                  <TabsTrigger
                    value="posts"
                    className="flex items-center gap-2 px-1 py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent h-auto"
                  >
                    <Image className="h-4 w-4" />
                    My Posts
                  </TabsTrigger>
                  <TabsTrigger
                    value="settings"
                    className="flex items-center gap-2 px-1 py-4 data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none bg-transparent h-auto"
                  >
                    <Settings className="h-4 w-4" />
                    Settings
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-200 text-red-800 px-4 py-3 rounded mt-6 flex items-center">
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div className="bg-green-100 border border-green-200 text-green-800 px-4 py-3 rounded mt-6 flex items-center">
                <CheckCircle className="h-5 w-5 mr-2" />
                {success}
              </div>
            )}

            {/* Profile Tab */}
            <TabsContent value="profile" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Personal Information</CardTitle>
                      <CardDescription>View your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <User className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Username</p>
                          <p className="font-medium">{user?.username}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{user?.email}</p>
                        </div>
                      </div>
                      {user?.name && (
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Name</p>
                            <p className="font-medium">{user.name}</p>
                          </div>
                        </div>
                      )}
                      {user?.location && (
                        <div className="flex items-center gap-3">
                          <MapPin className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Location</p>
                            <p className="font-medium">{user.location}</p>
                          </div>
                        </div>
                      )}
                      {user?.website && (
                        <div className="flex items-center gap-3">
                          <Briefcase className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Website</p>
                            <p className="font-medium">{user.website}</p>
                          </div>
                        </div>
                      )}
                      {user?.occupation && (
                        <div className="flex items-center gap-3">
                          <GraduationCap className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <p className="text-sm text-muted-foreground">Occupation</p>
                            <p className="font-medium">{user.occupation}</p>
                          </div>
                        </div>
                      )}
                      {user?.bio && (
                        <div className="mt-4">
                          <h3 className="font-medium mb-2">Bio</h3>
                          <p className="text-muted-foreground">{user.bio}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle>Account Information</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center gap-3">
                        <Briefcase className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Account Type</p>
                          <p className="font-medium capitalize">{user?.provider || 'local'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Award className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Role</p>
                          <p className="font-medium">
                            {user?.roles.includes('ROLE_ADMIN') ? 'Admin' : 'User'}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            {/* New Posts Tab */}
            <TabsContent value="posts" className="pt-6">
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

            {/* Settings Tab */}
            <TabsContent value="settings" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Profile</CardTitle>
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
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update your post details
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4 px-1">
              <div className="grid gap-2">
                <label htmlFor="edit-title" className="text-sm font-medium">
                  Title
                </label>
                <Input
                  id="edit-title"
                  placeholder="Enter post title"
                  value={postTitle}
                  onChange={(e) => setPostTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <label htmlFor="edit-description" className="text-sm font-medium">
                  Description
                </label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter post description"
                  className="min-h-[100px]"
                  value={postDescription}
                  onChange={(e) => setPostDescription(e.target.value)}
                />
              </div>
              {selectedPost?.imageUrl && (
                <div className="grid gap-2">
                  <label className="text-sm font-medium">
                    Current Image
                  </label>
                  <div className="h-40 w-full overflow-hidden rounded-md border">
                    <img
                      src={selectedPost.imageUrl}
                      alt={selectedPost.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdatePost} 
              disabled={isSubmitting || !postTitle || !postDescription}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Post Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedPost && (
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="h-24 w-32 overflow-hidden rounded-md border">
                  {selectedPost.imageUrl ? (
                    <img
                      src={selectedPost.imageUrl}
                      alt={selectedPost.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-medium">{selectedPost.title}</p>
                <p className="text-sm text-muted-foreground">
                  Created on {new Date(selectedPost.createdAt).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeletePost} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
