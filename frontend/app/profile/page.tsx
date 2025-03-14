'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import Link from 'next/link';

interface User {
  id: string;
  username: string;
  email: string;
  name: string;
  picture: string;
  roles: string[];
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: ''
  });
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
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          username: userData.username || ''
        });
        setLoading(false);
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleProfilePhotoUpload = async (result: any) => {
    if (!result || result.event !== 'success' || !result.info) {
      console.error('Upload failed or was cancelled');
      return;
    }

    const { secure_url } = result.info;
    
    if (!user) return;
    
    try {
      setUpdating(true);
      setUpdateSuccess(false);
      setUpdateError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update user profile with new picture
      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...user,
          picture: secure_url
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile picture');
      }

      const updatedUser = await response.json();
      
      // Update local storage with updated user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      setUpdateSuccess(true);
      
      // Show success message temporarily
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile picture:', error);
      setUpdateError('Failed to update profile picture. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    try {
      setUpdating(true);
      setUpdateSuccess(false);
      setUpdateError('');
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Update user profile
      const response = await fetch(`http://localhost:8080/api/users/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...user,
          name: formData.name,
          email: formData.email,
          username: formData.username
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile');
      }

      const updatedUser = await response.json();
      
      // Update local storage with updated user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // Update state
      setUser(updatedUser);
      setUpdateSuccess(true);
      setEditMode(false);
      
      // Show success message temporarily
      setTimeout(() => {
        setUpdateSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setUpdateError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-16 flex justify-center items-center">
        <div className="animate-pulse text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-10 bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] bg-clip-text text-transparent">
            My Profile
          </h1>
          <div className="flex space-x-4">
            <Link 
              href="/dashboard" 
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-[#4169E1] border border-gray-300 rounded-lg hover:border-[#4169E1] transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link 
              href="/upload" 
              className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
            >
              Upload Media
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden animate-fade-in-up">
          <div className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Profile Photo Section */}
              <div className="flex flex-col items-center">
                <div className="relative w-40 h-40 rounded-full overflow-hidden bg-gray-100 mb-6 shadow-md border-4 border-white">
                  {user?.picture ? (
                    <Image 
                      src={user.picture} 
                      alt={user.username} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] text-white text-5xl font-bold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                
                <CldUploadWidget
                  uploadPreset="ml_default"
                  options={{
                    cloudName: 'drm8wqymd',
                    maxFiles: 1,
                    resourceType: 'image',
                    clientAllowedFormats: ['image']
                  }}
                  onUpload={handleProfilePhotoUpload}
                >
                  {({ open }) => (
                    <button
                      onClick={() => open()}
                      disabled={updating}
                      className={`text-sm font-medium px-5 py-2.5 rounded-lg shadow-sm ${
                        updating 
                          ? 'bg-gray-300 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] text-white hover:shadow-md transition-all duration-200'
                      }`}
                    >
                      {updating ? 'Updating...' : 'Change Photo'}
                    </button>
                  )}
                </CldUploadWidget>
                
                {updateSuccess && (
                  <div className="mt-4 p-2 bg-green-50 text-green-600 text-sm rounded-lg border border-green-200">
                    Profile updated successfully!
                  </div>
                )}
                
                {updateError && (
                  <div className="mt-4 p-2 bg-red-50 text-red-600 text-sm rounded-lg border border-red-200">
                    {updateError}
                  </div>
                )}
              </div>
              
              {/* User Info Section */}
              <div className="flex-1">
                {editMode ? (
                  <form onSubmit={handleSaveProfile} className="space-y-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4169E1] focus:border-[#4169E1] transition-colors duration-200"
                        placeholder="Your full name"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4169E1] focus:border-[#4169E1] transition-colors duration-200"
                        placeholder="Username"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-[#4169E1] focus:border-[#4169E1] transition-colors duration-200"
                        placeholder="Your email address"
                      />
                    </div>
                    
                    <div className="flex space-x-4 pt-4">
                      <button
                        type="submit"
                        disabled={updating}
                        className={`px-5 py-2.5 rounded-lg shadow-sm ${
                          updating 
                            ? 'bg-gray-300 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] text-white hover:shadow-md transition-all duration-200'
                        }`}
                      >
                        {updating ? 'Saving...' : 'Save Changes'}
                      </button>
                      
                      <button
                        type="button"
                        onClick={() => setEditMode(false)}
                        className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:text-[#4169E1] hover:border-[#4169E1] transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-2xl font-bold text-gray-900">
                        {user?.name || user?.username}
                      </h2>
                      <button
                        onClick={() => setEditMode(true)}
                        className="px-4 py-2 text-sm font-medium text-[#4169E1] border border-[#4169E1] rounded-lg hover:bg-[#4169E1]/5 transition-colors duration-200"
                      >
                        Edit Profile
                      </button>
                    </div>
                    
                    <div className="bg-gradient-to-r from-[#4169E1]/10 to-[#2AB7CA]/10 p-4 rounded-lg mb-6">
                      <p className="text-gray-600">@{user?.username}</p>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                    
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Account Type</h3>
                        <div className="flex space-x-2">
                          {user?.roles?.map((role, index) => (
                            <span 
                              key={index}
                              className="px-3 py-1 bg-gradient-to-r from-[#4169E1]/20 to-[#2AB7CA]/20 text-[#4169E1] text-sm font-medium rounded-full"
                            >
                              {role.replace('ROLE_', '')}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">Account ID</h3>
                        <p className="text-gray-700 font-mono text-sm bg-gray-50 p-2 rounded border border-gray-200">
                          {user?.id}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* User Media Section */}
        <div className="mt-8 bg-white rounded-xl shadow-md overflow-hidden animate-fade-in-up">
          <div className="p-8">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] bg-clip-text text-transparent mb-6">
              My Media
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* This would be populated with the user's media */}
              <div className="bg-gray-50 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100">
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-400">No media yet</p>
                </div>
                <div className="p-4">
                  <Link 
                    href="/upload" 
                    className="text-[#4169E1] hover:underline font-medium"
                  >
                    Upload your first media
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
