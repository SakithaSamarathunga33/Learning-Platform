'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  category: string;
  isPublished?: boolean;
  published?: boolean;
  instructor: {
    id: string;
    username: string;
  };
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      // Get all courses
      const response = await fetch('http://localhost:8080/api/courses');
      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();
      console.log('All courses from API:', data);
      
      // Filter for published courses
      const publishedCourses = data.filter(course => {
        const isPublished = 
          course.isPublished === true || 
          course.published === true;
          
        console.log(`Course "${course.title}" - Published status:`, isPublished);
        return isPublished;
      });
      
      console.log('Published courses after filter:', publishedCourses);
      setCourses(publishedCourses);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(courses.map(course => course.category))];

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         course.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2AB7CA] dark:border-[#4fc3d5]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pt-20 dark:bg-gray-900 transition-colors duration-200">
      <div className="bg-gradient-to-r from-[#2AB7CA] to-[#4169E1] dark:from-[#4fc3d5] dark:to-[#5278ed] rounded-2xl shadow-xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold">Available Courses</h1>
        <p className="mt-2 opacity-90">Explore our collection of expert-led courses</p>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      <div className="mb-6 space-y-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#2AB7CA] dark:focus:ring-[#4fc3d5] transition-colors duration-200"
          />
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                selectedCategory === category
                  ? 'bg-[#2AB7CA] dark:bg-[#4fc3d5] text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {category.charAt(0).toUpperCase() + category.slice(1)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((course) => (
            <Link href={`/courses/${course.id}`} key={course.id}>
              <div className="group bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 hover:border-[#2AB7CA] dark:hover:border-[#4fc3d5]">
                {course.thumbnailUrl && (
                  <div className="relative w-full h-48 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10"></div>
                    <Image
                      src={course.thumbnailUrl.startsWith('http') ? course.thumbnailUrl : 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&q=85&fm=jpg&crop=entropy&cs=srgb&w=640'}
                      alt={course.title}
                      fill
                      className="object-cover rounded-t-lg transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10">
                      <span className="inline-block px-2 py-1 text-xs font-medium bg-[#2AB7CA]/90 dark:bg-[#4fc3d5]/90 text-white rounded">
                        {course.category || 'General'}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-200 group-hover:text-[#2AB7CA] dark:group-hover:text-[#4fc3d5]">{course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-2 transition-colors duration-200">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#2AB7CA] dark:text-[#4fc3d5] font-semibold transition-colors duration-200">${course.price}</span>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                        By {course.instructor?.username || 'System'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="h-1 w-0 bg-gradient-to-r from-[#4169E1] to-[#2AB7CA] group-hover:w-full transition-all duration-300"></div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400 transition-colors duration-200">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-lg font-medium">No courses found</p>
            <p className="mt-1">Try a different search or category filter</p>
          </div>
        )}
      </div>
    </div>
  );
} 