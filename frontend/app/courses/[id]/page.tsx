"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAuthenticatedFetch } from '@/utils/auth';
import CourseView from '@/components/courses/CourseView';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const authenticatedFetch = getAuthenticatedFetch();

  useEffect(() => {
    // Verify that the course exists and the user has access
    const verifyCourseAccess = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch(`http://localhost:8080/api/courses/${courseId}`);
        
        if (!response) {
          setError('Authentication required');
          setIsAuthenticated(false);
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          setError('Course not found or you do not have access to this course');
          setLoading(false);
          return;
        }
        
        setIsAuthenticated(true);
        setLoading(false);
      } catch (error) {
        console.error('Error verifying course access:', error);
        setError('Failed to load course');
        setLoading(false);
      }
    };

    verifyCourseAccess();
  }, [courseId]);

  const handleLogin = () => {
    // Store the current URL to redirect back after login
    localStorage.setItem('redirectAfterLogin', window.location.pathname);
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="max-w-md mx-auto bg-blue-50 dark:bg-blue-900/20 p-8 rounded-xl border border-blue-200 dark:border-blue-800 shadow-lg">
          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Authentication Required</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            You need to be logged in to view course details and track your progress.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={handleLogin} className="gap-2">
              <LogIn className="h-4 w-4" />
              Log In
            </Button>
            <Link href="/courses">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Courses
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error && isAuthenticated) {
    return (
      <div className="container mx-auto p-8 text-center">
        <div className="max-w-md mx-auto bg-red-50 dark:bg-red-900/20 p-6 rounded-lg border border-red-200 dark:border-red-800">
          <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">Error</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-4">{error}</p>
          <Link href="/courses">
            <Button className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <Link href="/courses">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Courses
          </Button>
        </Link>
      </div>
      
      <CourseView courseId={courseId} />
    </div>
  );
}
