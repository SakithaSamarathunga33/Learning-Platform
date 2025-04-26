/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { FileEdit, MoreHorizontal, Plus, Search, Trash2, Eye, ImagePlus, Medal, FileText } from 'lucide-react';
import AchievementUpload from '@/components/AchievementUpload';

interface User {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  profilePicture?: string;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  imagePublicId: string;
  createdAt: string;
  likes: number;
  user: User;
  hasLiked?: boolean;
}

export default function AchievementsAdminPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imagePublicId, setImagePublicId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

  // Utility function for authenticated API calls
  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }

    const headers = new Headers(options.headers || {});
    headers.set('Authorization', `Bearer ${token}`);
    
    if (options.body && !headers.has('Content-Type')) {
      headers.set('Content-Type', 'application/json');
    }

    console.log(`Making ${options.method || 'GET'} request to ${url}`);
    const response = await fetch(url, {
      ...options,
      headers
    });

    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      // Don't try to read body multiple times - just throw the status
      throw new Error(`Request failed with status ${response.status}`);
    }

    try {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
      return await response.text();
    } catch (e) {
      console.error('Error parsing response:', e);
      return null;
    }
  };

  // Check authentication and fetch user info
  useEffect(() => {
    // Since this is in the admin section, we can assume the user is already authenticated
    // Just fetch the achievements directly
    setIsAuthenticated(true);
    fetchAchievements();
  }, []);

  // Fetch achievements
  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      console.log('Starting to fetch achievements');
      
      // Get token if available (but don't require it)
      const token = localStorage.getItem('token');
      const headers: HeadersInit = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        // Add admin header now that CORS is configured to allow it
        headers['X-Admin-Access'] = 'true';
      }

      // Use Next.js API proxy instead of direct backend call to avoid CORS issues
      const response = await fetch(`/api/achievements?admin=true`, {
        headers,
        cache: 'no-store'
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch posts (Status: ${response.status})`);
      }
      
      const data = await response.json();
      console.log('Fetched posts data:', data);
      console.log('Number of posts:', Array.isArray(data) ? data.length : 'Not an array');
      setAchievements(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      toast.error('Failed to load posts');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter achievements based on search term
  const filteredAchievements = achievements.filter(achievement => 
    achievement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    achievement.user?.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Handle create achievement
  const handleCreateAchievement = async () => {
    try {
      setIsSubmitting(true);
      
      if (!title.trim()) {
        throw new Error('Title is required');
      }

      if (!description.trim()) {
        throw new Error('Description is required');
      }

      if (!imageUrl || !imagePublicId) {
        throw new Error('Image is required');
      }

      const achievementData = {
        title,
        description,
        imageUrl,
        imagePublicId
      };

      console.log('Creating post with data:', achievementData);
      
      // Use direct fetch instead of fetchWithAuth
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(`${apiUrl}/api/achievements`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(achievementData)
      });
      
      console.log('Create status:', response.status);
      
      if (!response.ok) {
        throw new Error(`Failed to create post (Status: ${response.status})`);
      }
      
      toast.success('Post created successfully');
      setIsCreateDialogOpen(false);
      fetchAchievements();
      
      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');
      setImagePublicId('');
    } catch (err) {
      console.error('Error creating post:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to create post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle update achievement
  const handleUpdateAchievement = async () => {
    try {
      if (!selectedAchievement) return;
      
      setIsSubmitting(true);
      
      if (!title.trim()) {
        throw new Error('Title is required');
      }

      if (!description.trim()) {
        throw new Error('Description is required');
      }

      const achievementData = {
        title,
        description
      };

      console.log('Updating post with ID:', selectedAchievement.id);
      console.log('Update data:', achievementData);
      
      // Try admin API route instead of direct backend call
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Use the Next.js admin API route
      const response = await fetch(`/api/admin/achievements/${selectedAchievement.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(achievementData)
      });
      
      console.log('Update response status:', response.status);
      
      if (!response.ok) {
        // Log the error for debugging
        let errorMessage;
        try {
          const errorData = await response.json();
          console.error('Error data:', errorData);
          errorMessage = errorData.error || `Failed to update post (Status: ${response.status})`;
        } catch (e) {
          errorMessage = `Failed to update post (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      toast.success('Post updated successfully');
      setIsEditDialogOpen(false);
      fetchAchievements();
    } catch (err) {
      console.error('Error updating post:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to update post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle delete achievement
  const handleDeleteAchievement = async () => {
    try {
      if (!selectedAchievement) return;
      
      setIsSubmitting(true);
      
      console.log('Deleting post with ID:', selectedAchievement.id);
      
      // Try admin API route instead of direct backend call
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // Use the Next.js admin API route
      const response = await fetch(`/api/admin/achievements/${selectedAchievement.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Delete response status:', response.status);
      
      if (!response.ok) {
        // Log the error for debugging
        let errorMessage;
        try {
          const errorData = await response.json();
          console.error('Error data:', errorData);
          errorMessage = errorData.error || `Failed to delete post (Status: ${response.status})`;
        } catch (e) {
          errorMessage = `Failed to delete post (Status: ${response.status})`;
        }
        throw new Error(errorMessage);
      }
      
      toast.success('Post deleted successfully');
      setIsDeleteDialogOpen(false);
      fetchAchievements();
    } catch (err) {
      console.error('Error deleting post:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to delete post');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset form data before opening create dialog
  const openCreateDialog = () => {
    // Reset all form state
    setTitle('');
    setDescription('');
    setImageUrl('');
    setImagePublicId('');
    setIsCreateDialogOpen(true);
  };

  // Edit achievement dialog opener
  const openEditDialog = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setTitle(achievement.title);
    setDescription(achievement.description);
    setImageUrl(achievement.imageUrl);
    setImagePublicId(achievement.imagePublicId);
    setIsEditDialogOpen(true);
  };

  // Delete achievement dialog opener
  const openDeleteDialog = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsDeleteDialogOpen(true);
  };

  // View achievement dialog opener
  const openViewDialog = (achievement: Achievement) => {
    setSelectedAchievement(achievement);
    setIsViewDialogOpen(true);
  };

  return (
    <div className="container py-10 max-w-7xl">
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Posts</CardTitle>
              <CardDescription>
                View and manage all posts on the platform.
              </CardDescription>
            </div>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              New Post
            </Button>
          </div>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search posts..."
                className="w-full pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
              <div className="flex items-center gap-4 p-4">
                <Skeleton className="h-12 w-12" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
              </div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <FileText className="h-10 w-10 text-destructive mb-4" />
              <h3 className="text-lg font-medium">Error Loading Posts</h3>
              <p className="text-sm text-muted-foreground mt-2 max-w-md">
                {error}
              </p>
              <div className="mt-4">
                <Button onClick={fetchAchievements}>Try Again</Button>
              </div>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px]">Image</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead className="text-center">Likes</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAchievements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <Medal className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground font-medium">No posts found</p>
                          {searchTerm && (
                            <p className="text-sm text-muted-foreground">
                              Try adjusting your search term
                            </p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredAchievements.map((achievement) => (
                      <TableRow key={achievement.id}>
                        <TableCell>
                          <div className="h-12 w-16 overflow-hidden rounded-md border">
                            {achievement.imageUrl ? (
                              <img
                                src={achievement.imageUrl}
                                alt={achievement.title}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-muted">
                                <ImagePlus className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{achievement.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1">
                            {achievement.description}
                          </div>
                        </TableCell>
                        <TableCell>
                          {achievement.user ? (
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                                {achievement.user.profilePicture ? (
                                  <img 
                                    src={achievement.user.profilePicture} 
                                    alt={achievement.user.username} 
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <span className="text-xs font-medium">
                                    {achievement.user.username?.charAt(0).toUpperCase() || '?'}
                                  </span>
                                )}
                              </div>
                              <span className="text-sm font-medium">
                                {achievement.user.username || 'Unknown User'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-muted-foreground">Unknown User</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {new Date(achievement.createdAt).toLocaleDateString()}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className="bg-primary/10 text-primary">
                            {achievement.likes || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => openViewDialog(achievement)}>
                                <Eye className="mr-2 h-4 w-4" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => openEditDialog(achievement)}>
                                <FileEdit className="mr-2 h-4 w-4" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => openDeleteDialog(achievement)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredAchievements.length} of {achievements.length} posts
          </div>
          <Button variant="outline" onClick={fetchAchievements}>
            Refresh
          </Button>
        </CardFooter>
      </Card>

      {/* Add Post Dialog */}
      <Dialog 
        open={isCreateDialogOpen} 
        onOpenChange={(open) => {
          if (!open) {
            // Reset form when dialog is closed
            setTitle('');
            setDescription('');
            setImageUrl('');
            setImagePublicId('');
          }
          setIsCreateDialogOpen(open);
        }}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Add New Post</DialogTitle>
            <DialogDescription>
              Create a new post for the platform.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4 px-1">
              <div className="grid gap-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Enter post description"
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Image</Label>
                <AchievementUpload
                  imageUrl={imageUrl}
                  imagePublicId={imagePublicId}
                  setImageUrl={setImageUrl}
                  setImagePublicId={setImagePublicId}
                />
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateAchievement} 
              disabled={isSubmitting || !title || !description || !imageUrl}
            >
              {isSubmitting ? 'Creating...' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Post Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update post details.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <div className="grid gap-4 py-4 px-1">
              <div className="grid gap-2">
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Enter post description"
                  className="min-h-[100px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <div className="grid gap-2">
                <Label>Current Image</Label>
                <div className="h-40 w-full overflow-hidden rounded-md border">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <ImagePlus className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleUpdateAchievement} 
              disabled={isSubmitting || !title || !description}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Post Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            {selectedAchievement && (
              <div className="flex flex-col items-center justify-center space-y-2 text-center">
                <div className="h-24 w-32 overflow-hidden rounded-md border">
                  {selectedAchievement.imageUrl ? (
                    <img
                      src={selectedAchievement.imageUrl}
                      alt={selectedAchievement.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <ImagePlus className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <p className="font-medium">{selectedAchievement.title}</p>
                <p className="text-sm text-muted-foreground">
                  Created by {selectedAchievement.user?.username || 'Unknown User'}
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
              onClick={handleDeleteAchievement} 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Deleting...' : 'Delete Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Post Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>Post Details</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            {selectedAchievement && (
              <div className="py-4 px-1">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <div className="h-[250px] w-full overflow-hidden rounded-md border">
                      {selectedAchievement.imageUrl ? (
                        <img
                          src={selectedAchievement.imageUrl}
                          alt={selectedAchievement.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-muted">
                          <ImagePlus className="h-12 w-12 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Created At
                        </span>
                        <span className="text-sm">
                          {new Date(selectedAchievement.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-muted-foreground">
                          Likes
                        </span>
                        <Badge variant="outline" className="bg-primary/10 text-primary">
                          {selectedAchievement.likes || 0}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Title
                      </span>
                      <h2 className="text-xl font-semibold mt-1">
                        {selectedAchievement.title}
                      </h2>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Description
                      </span>
                      <div className="h-[150px] mt-1 rounded-md border p-3 overflow-y-auto">
                        <p className="text-sm">
                          {selectedAchievement.description}
                        </p>
                      </div>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">
                        Created By
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center overflow-hidden">
                          {selectedAchievement.user?.profilePicture ? (
                            <img 
                              src={selectedAchievement.user.profilePicture} 
                              alt={selectedAchievement.user.username} 
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <span className="text-xs font-medium">
                              {selectedAchievement.user?.username?.charAt(0).toUpperCase() || '?'}
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">
                            {selectedAchievement.user?.firstName && selectedAchievement.user?.lastName 
                              ? `${selectedAchievement.user.firstName} ${selectedAchievement.user.lastName}` 
                              : selectedAchievement.user?.username || 'Unknown User'}
                          </p>
                          {selectedAchievement.user?.username && (
                            <p className="text-xs text-muted-foreground">
                              @{selectedAchievement.user.username}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsViewDialogOpen(false)}
            >
              Close
            </Button>
            <Button 
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedAchievement) {
                  openEditDialog(selectedAchievement);
                }
              }}
            >
              Edit Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 