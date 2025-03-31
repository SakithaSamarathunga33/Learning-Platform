'use client';

import { useState, useEffect, useRef } from 'react'; // Added useRef
import { useRouter } from 'next/navigation';
import ImageUpload, { ImageUploadHandle } from '@/components/ImageUpload'; // Fixed import and added ImageUploadHandle
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'; // Fixed import
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'; // Fixed import
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
  Pencil
} from 'lucide-react';

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

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const router = useRouter();
  const imageUploadRef = useRef<ImageUploadHandle>(null); // Added ref for ImageUpload

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
                ref={imageUploadRef} // Added ref
                currentImage={user?.picture}
                onImageUpload={handleImageUpload}
                className="w-32 h-32 border-4 border-background rounded-full"
              />
              <button
                onClick={() => imageUploadRef.current?.triggerFileInput()} // Use ref to trigger click
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
    </div>
  );
}
