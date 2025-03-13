'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:8080/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP error! status: ${response.status}`);
      }

      if (data.token && data.user) {
        // Store the token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));

        // Check user roles and redirect accordingly
        const isAdmin = data.user.roles?.includes('ROLE_ADMIN');
        console.log('User roles:', data.user.roles);
        console.log('Is admin:', isAdmin);

        // Use router.replace instead of push to prevent back navigation
        if (isAdmin) {
          await router.replace('/admin');
        } else {
          await router.replace('/dashboard');
        }
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-secondary-50 to-secondary-100 flex flex-col justify-center items-center px-4 py-12 sm:px-6 lg:px-8">
      {/* Header/Logo */}
      <div className="mb-8 flex items-center animate-fade-in-down">
        <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary-500 to-accent flex items-center justify-center shadow-soft">
          <span className="text-white font-bold text-2xl">P</span>
        </div>
        <h2 className="ml-3 text-2xl font-semibold text-secondary-800">PAF2</h2>
      </div>
      
      {/* Login Form Card */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-soft p-8 animate-fade-in-up">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-secondary-900">Welcome Back</h1>
          <p className="mt-2 text-secondary-600">Sign in to your account</p>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-secondary-700">
              Username
            </label>
            <div className="mt-1">
              <input
                id="username"
                name="username"
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200"
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-secondary-700">
              Password
            </label>
            <div className="mt-1">
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-secondary-300 rounded-md shadow-sm placeholder-secondary-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm transition-all duration-200"
                placeholder="Enter your password"
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-secondary-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-secondary-500">Or continue with</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              type="button"
              className="w-full flex items-center justify-center py-2 px-4 border border-secondary-300 rounded-md shadow-sm bg-white text-sm font-medium text-secondary-700 hover:bg-secondary-50 transition-all duration-200"
              disabled={isLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545 10.239v3.821h5.445c-0.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866 0.549 3.921 1.453l2.814-2.814c-1.798-1.677-4.203-2.701-6.735-2.701-5.445 0-9.854 4.409-9.854 9.854s4.409 9.854 9.854 9.854c8.118 0 9.854-7.565 9.854-11.859 0-0.712-0.064-1.424-0.19-2.113h-9.664z" />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center animate-fade-in-up">
        <p className="text-sm text-secondary-600">
          Don&apos;t have an account?{' '}
          <Link href="/" className="font-medium text-primary-600 hover:text-primary-500">
            Go back to home
          </Link>
        </p>
      </div>
    </div>
  );
}
