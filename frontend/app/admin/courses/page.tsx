'use client';

import { useState, useEffect } from 'react';
import { getAuthenticatedFetch } from '@/utils/auth';

interface Course {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  price: number;
  category: string;
  isPublished: boolean;
  published?: boolean;
  instructor: {
    id: string;
    username: string;
  };
}

interface User {
  id: string;
  username: string;
  email: string;
  roles: string[];
  profilePicture?: string;
}

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [newCourse, setNewCourse] = useState<Partial<Course>>({
    title: '',
    description: '',
    thumbnailUrl: '',
    price: 0,
    category: '',
    isPublished: false,
    instructor: {
      id: '',
      username: ''
    }
  });
  const authenticatedFetch = getAuthenticatedFetch();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (err) {
        console.error('Error parsing user data:', err);
      }
    }
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const response = await authenticatedFetch('http://localhost:8080/api/courses');
      if (!response) return; // User was redirected to login

      if (!response.ok) {
        throw new Error(`Failed to fetch courses: ${response.status}`);
      }

      const data = await response.json();
      setCourses(data);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError(err instanceof Error ? err.message : 'Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const response = await authenticatedFetch(`http://localhost:8080/api/courses/${courseId}`, {
        method: 'DELETE'
      });
      if (!response) return; // User was redirected to login

      if (response.ok) {
        setCourses(courses.filter(course => course.id !== courseId));
      } else {
        setError('Failed to delete course');
      }
    } catch (err) {
      setError('Error connecting to server');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    const courseToUpdate = {
      ...editingCourse,
      published: editingCourse.isPublished
    };

    try {
      const response = await authenticatedFetch(`http://localhost:8080/api/courses/${editingCourse.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseToUpdate)
      });
      if (!response) return; // User was redirected to login

      if (!response.ok) {
        throw new Error('Failed to update course');
      }

      const updatedCourse = await response.json();
      setCourses(courses.map(course => 
        course.id === editingCourse.id ? updatedCourse : course
      ));
      setEditingCourse(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update course');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const courseData = {
        title: newCourse.title,
        description: newCourse.description,
        thumbnailUrl: newCourse.thumbnailUrl || '',
        price: newCourse.price || 0,
        category: newCourse.category || 'General',
        isPublished: newCourse.isPublished || false,
        published: newCourse.isPublished || false
      };

      console.log('Creating course with publish status:', courseData.isPublished);
      
      const response = await authenticatedFetch('http://localhost:8080/api/courses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(courseData)
      });

      if (!response) return; // User was redirected to login

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to create course');
      }

      const createdCourse = await response.json();
      console.log('Created course:', createdCourse);
      setCourses([...courses, createdCourse]);
      setIsCreating(false);
      setNewCourse({
        title: '',
        description: '',
        thumbnailUrl: '',
        price: 0,
        category: '',
        isPublished: false
      });
    } catch (error) {
      console.error('Error creating course:', error);
      setError(error instanceof Error ? error.message : 'Failed to create course');
    }
  };

  const handleCreateCourse = () => {
    setNewCourse({
      title: '',
      description: '',
      thumbnailUrl: '',
      price: 0,
      category: '',
      isPublished: false,
      instructor: {
        id: '',
        username: ''
      }
    });
    setIsCreating(true);
  };

  const handleEditCourse = (course: Course) => {
    const isPublished = course.isPublished === true || course.published === true;
    
    setEditingCourse({
      ...course,
      thumbnailUrl: course.thumbnailUrl || '',
      category: course.category || '',
      isPublished: isPublished,
      instructor: {
        id: course.instructor?.id || '',
        username: course.instructor?.username || ''
      }
    });
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#2AB7CA]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="bg-gradient-to-r from-[#2AB7CA] to-[#4169E1] rounded-2xl shadow-xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold">Courses Management</h1>
        <p className="mt-2 opacity-90">Manage all courses on your learning platform</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2AB7CA]"
          />
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">Course List</h2>
          <button 
            onClick={handleCreateCourse}
            className="px-4 py-2 bg-[#2AB7CA] text-white rounded-lg flex items-center hover:bg-[#2AB7CA]/90 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Add Course
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.length > 0 ? (
            filteredCourses.map((course) => (
              <div key={course.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                {course.thumbnailUrl && (
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-semibold text-gray-800">{course.title}</h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${course.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                      {course.isPublished ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{course.description}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[#2AB7CA] font-semibold">${course.price}</span>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleEditCourse(course)}
                        className="p-2 rounded-lg text-blue-600 hover:bg-blue-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button 
                        onClick={() => handleDelete(course.id)}
                        className="p-2 rounded-lg text-red-600 hover:bg-red-50"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12 text-gray-500">
              No courses found. Try a different search or add a new course.
            </div>
          )}
        </div>
      </div>

      {/* Edit Course Modal */}
      {editingCourse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Edit Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingCourse.title || ''}
                  onChange={e => setEditingCourse({...editingCourse, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={editingCourse.description || ''}
                  onChange={e => setEditingCourse({...editingCourse, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                <input
                  type="text"
                  value={editingCourse.thumbnailUrl || ''}
                  onChange={e => setEditingCourse({...editingCourse, thumbnailUrl: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  value={editingCourse.price || 0}
                  onChange={e => setEditingCourse({...editingCourse, price: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={editingCourse.category || ''}
                  onChange={e => setEditingCourse({...editingCourse, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="isPublished"
                  type="checkbox"
                  checked={editingCourse.isPublished || false}
                  onChange={e => setEditingCourse({...editingCourse, isPublished: e.target.checked})}
                  className="h-4 w-4 text-[#2AB7CA] focus:ring-[#2AB7CA] border-gray-300 rounded"
                />
                <label htmlFor="isPublished" className="ml-2 block text-sm text-gray-900">
                  Published
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setEditingCourse(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2AB7CA] rounded-md hover:bg-[#2395A5]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Course Modal */}
      {isCreating && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold mb-4">Create New Course</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={newCourse.title || ''}
                  onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newCourse.description || ''}
                  onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                  rows={4}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thumbnail URL</label>
                <input
                  type="text"
                  value={newCourse.thumbnailUrl || ''}
                  onChange={e => setNewCourse({...newCourse, thumbnailUrl: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  type="number"
                  value={newCourse.price || 0}
                  onChange={e => setNewCourse({...newCourse, price: Number(e.target.value)})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <input
                  type="text"
                  value={newCourse.category || ''}
                  onChange={e => setNewCourse({...newCourse, category: e.target.value})}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
              <div className="flex items-center">
                <input
                  id="newIsPublished"
                  type="checkbox"
                  checked={newCourse.isPublished || false}
                  onChange={e => setNewCourse({...newCourse, isPublished: e.target.checked})}
                  className="h-4 w-4 text-[#2AB7CA] focus:ring-[#2AB7CA] border-gray-300 rounded"
                />
                <label htmlFor="newIsPublished" className="ml-2 block text-sm text-gray-900">
                  Published
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateSubmit}
                className="px-4 py-2 text-sm font-medium text-white bg-[#2AB7CA] rounded-md hover:bg-[#2395A5]"
              >
                Create Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 