'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface User {
  username: string;
  email: string;
  roles: string[];
}

interface Media {
  id: string;
  title: string;
  description: string;
  url: string;
  type: string;
  uploadDate: string;
}

export default function UserDashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userMedia, setUserMedia] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
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
        // Redirect admin users to admin dashboard
        if (userData.roles?.includes('ROLE_ADMIN')) {
          router.push('/admin/dashboard');
          return;
        }
        setUser(userData);

        // Fetch user media
        const fetchUserMedia = async () => {
          try {
            const response = await fetch(`http://localhost:8080/api/media/user/${userData.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              credentials: 'include',
            });

            if (!response.ok) {
              throw new Error('Failed to fetch user media');
            }

            const data = await response.json();
            setUserMedia(data);
          } catch (error) {
            console.error('Error fetching user media:', error);
          }
        };

        fetchUserMedia();
      } catch (error) {
        console.error('Error parsing user data:', error);
        router.push('/login');
      } finally {
        setLoading(false);
      }
    } else {
      router.push('/login');
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-secondary-100 flex justify-center items-center">
        <div className="animate-pulse text-secondary-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-secondary-100">
      {/* Header */}
      <header className="bg-white shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary-500 to-accent flex items-center justify-center shadow-soft">
                <span className="text-white font-bold text-xl">P</span>
              </div>
              <h1 className="ml-3 text-xl font-semibold text-secondary-900">User Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/upload"
                className="px-4 py-2 text-sm font-medium text-secondary-700 hover:text-secondary-900 transition-colors duration-200"
              >
                Upload Media
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* User Info Card */}
        <div className="bg-white rounded-2xl shadow-soft p-6 mb-8 animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary-900">Welcome, {user?.username}!</h2>
            <p className="mt-2 text-secondary-600">Here&apos;s your account information</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="text-sm font-medium text-secondary-500">Username</p>
              <p className="mt-1 text-secondary-900">{user?.username}</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="text-sm font-medium text-secondary-500">Email</p>
              <p className="mt-1 text-secondary-900">{user?.email}</p>
            </div>
            <div className="p-4 bg-secondary-50 rounded-lg">
              <p className="text-sm font-medium text-secondary-500">Role</p>
              <p className="mt-1 text-secondary-900">{user?.roles?.join(', ')}</p>
            </div>
          </div>
        </div>

        {/* User Media Section */}
        <div className="bg-white rounded-2xl shadow-soft p-6 animate-fade-in-up">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-secondary-900">Your Media</h2>
            <p className="mt-2 text-secondary-600">Manage your uploaded media files</p>
          </div>

          {userMedia.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-secondary-600">You haven&apos;t uploaded any media yet.</p>
              <Link
                href="/upload"
                className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md shadow-sm transition-colors duration-200"
              >
                Upload Your First Media
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {userMedia.map((media) => (
                <div key={media.id} className="bg-secondary-50 rounded-lg overflow-hidden">
                  {media.type === 'PHOTO' ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={media.url}
                        alt={media.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
                  ) : (
                    <video src={media.url} className="w-full h-48 object-cover" controls />
                  )}
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-secondary-900">{media.title}</h3>
                    <p className="mt-1 text-sm text-secondary-600">{media.description}</p>
                    <p className="mt-2 text-xs text-secondary-500">
                      Uploaded on {new Date(media.uploadDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
