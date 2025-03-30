'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const token = searchParams.get('token');
        const error = searchParams.get('error');

        if (error) {
            setError('Authentication failed. Please try again.');
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        if (!token) {
            setError('No authentication token received');
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        // Store authentication token
        localStorage.setItem('token', token);

        // Fetch user data with the new token
        fetch('http://localhost:8080/api/auth/current-user', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to fetch user data');
            return response.json();
        })
        .then(userData => {
            console.log('Google auth user data:', userData);
            localStorage.setItem('user', JSON.stringify(userData));
            
            // Dispatch custom event to update navbar
            try {
              // Create and dispatch a CustomEvent for better browser compatibility
              const event = new CustomEvent('userDataChanged');
              window.dispatchEvent(event);
            } catch (e) {
              // Fallback for older browsers
              console.error('Error creating custom event:', e);
              const event = document.createEvent('Event');
              event.initEvent('userDataChanged', true, true);
              window.dispatchEvent(event);
            }
            
            // Check if user is admin and redirect accordingly
            if (userData.roles && userData.roles.includes('ROLE_ADMIN')) {
                console.log('Admin login detected, redirecting to admin dashboard');
                router.push('/admin');
            } else {
                router.push('/');
            }
        })
        .catch(error => {
            console.error('Error fetching user data:', error);
            setError('Failed to fetch user data');
            setTimeout(() => {
                localStorage.removeItem('token');
                router.push('/login');
            }, 3000);
        });
    }, [router, searchParams]);

    if (error) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center">
                <div className="text-red-500 mb-4">{error}</div>
                <div>Redirecting to login page...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <div className="mt-4">Authenticating...</div>
        </div>
    );
}