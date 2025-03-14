'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/layout/Navbar';
import ImageUpload from '@/components/ImageUpload';

interface User {
  id: string;
  username: string;
  email: string;
  picture?: string;
  name?: string;
  provider?: string;
  roles: string[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User | null>(null);
  const router = useRouter();

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
        // Ensure we have all required fields with proper defaults
        const completeUserData = {
          ...userData,
          name: userData.name || '',
          picture: userData.picture || '',
          username: userData.username || '',
          email: userData.email || '',
          provider: userData.provider || 'local',
          roles: userData.roles || []
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
      // Ensure we have all required fields with proper defaults
      const userData = {
        id: data.id || '',
        username: data.username || '',
        email: data.email || '',
        name: data.name || '',
        picture: data.picture || '',
        provider: data.provider || 'local',
        roles: data.roles || []
      };
      
      setUser(userData);
      setEditedUser(userData);
      // Update localStorage with complete user data
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
      // Ensure we have all required fields
      const completeUserData = {
        ...updatedUser,
        name: updatedUser.name || '',
        picture: updatedUser.picture || '',
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        provider: updatedUser.provider || 'local'
      };
      
      setUser(completeUserData);
      setEditedUser(completeUserData);
      localStorage.setItem('user', JSON.stringify(completeUserData));
      setSuccess('Profile picture updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating profile picture:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile picture');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

      // Create an object with only the changed fields
      const updatedFields: Partial<User> = {};
      
      // For Google users, only allow updating name and picture
      if (user.provider === 'google') {
        if (editedUser.name !== user.name) {
          updatedFields.name = editedUser.name;
        }
      } else {
        // For regular users, allow updating username and name
        if (editedUser.username !== user.username) {
          updatedFields.username = editedUser.username;
        }
        if (editedUser.name !== user.name) {
          updatedFields.name = editedUser.name;
        }
      }

      // If no fields have changed, don't make the request
      if (Object.keys(updatedFields).length === 0) {
        setIsEditing(false);
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
      // Ensure we have all required fields
      const completeUserData = {
        ...updatedUser,
        name: updatedUser.name || '',
        picture: updatedUser.picture || '',
        username: updatedUser.username || '',
        email: updatedUser.email || '',
        provider: updatedUser.provider || 'local'
      };
      
      setUser(completeUserData);
      setEditedUser(completeUserData);
      localStorage.setItem('user', JSON.stringify(completeUserData));
      setIsEditing(false);
      setSuccess('Profile updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Error updating user details:', err);
      setError(err instanceof Error ? err.message : 'Failed to update user details');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
        <Navbar />
        <div className="flex justify-center items-center min-h-[calc(100vh-4rem)] mt-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#4169E1]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navbar />
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-lg p-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Profile
              </button>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-md">
              <p className="text-green-700">{success}</p>
            </div>
          )}

          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              <ImageUpload
                currentImage={user?.picture}
                onImageUpload={handleImageUpload}
                className="mb-4"
              />
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
                <div className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm">
                  Change Photo
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4">
              Click to upload a new profile picture
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              {isEditing ? (
                <input
                  type="text"
                  name="username"
                  value={editedUser?.username || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{user?.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <p className="mt-1 p-3 bg-gray-50 rounded-lg">{user?.email}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={editedUser?.name || ''}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 p-3 bg-gray-50 rounded-lg">{user?.name || 'Not set'}</p>
              )}
            </div>

            {isEditing && (
              <div className="flex justify-end space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setEditedUser(user);
                    setError('');
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
