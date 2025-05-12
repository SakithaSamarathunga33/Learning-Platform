import React, { useState, useEffect } from 'react';
import { getAuthenticatedFetch } from '@/utils/auth';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, Clock, DollarSign, User, Calendar, BookOpen } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  courseId: string;
  userId?: string;
  orderIndex: number;
  createdAt?: string;
  updatedAt?: string;
}

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  thumbnailUrl: string;
  instructor?: {
    id: string;
    username: string;
  };
  createdAt?: string;
  updatedAt?: string;
  isPublished?: boolean;
  tasks?: Task[];
}

interface CourseViewProps {
  courseId: string;
}

interface TaskProgressProps {
  tasks: Task[];
  onTaskToggle: (taskId: string, completed: boolean) => void;
}

// TaskProgress component for displaying and managing tasks
const TaskProgress: React.FC<TaskProgressProps> = ({ tasks, onTaskToggle }) => {
  return (
    <div className="space-y-4">
      {tasks.map((task, index) => (
        <div 
          key={task.id} 
          className={`flex items-center p-4 rounded-lg border transition-all duration-200 ${task.completed ? 
            'bg-blue-50/50 dark:bg-blue-900/10 border-blue-100 dark:border-blue-900/30' : 
            'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600'} 
            ${task.completed ? 'shadow-sm' : 'hover:shadow-md'}`}
        >
          <div className="mr-4 flex-shrink-0">
            <div 
              onClick={() => onTaskToggle(task.id, !task.completed)}
              className={`h-6 w-6 rounded-full flex items-center justify-center cursor-pointer transition-colors ${task.completed ? 
                'bg-blue-500 text-white' : 
                'border-2 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'}`}
            >
              {task.completed && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center">
              <span className="flex items-center justify-center h-5 w-5 rounded-full bg-gray-100 dark:bg-gray-700 text-xs font-medium text-gray-500 dark:text-gray-400 mr-3">
                {index + 1}
              </span>
              <p 
                onClick={() => onTaskToggle(task.id, !task.completed)}
                className={`font-medium cursor-pointer ${task.completed ? 
                  'text-gray-500 dark:text-gray-400 line-through' : 
                  'text-gray-800 dark:text-gray-200'}`}
              >
                {task.title}
              </p>
            </div>
          </div>
          <div className="ml-2 flex-shrink-0">
            {task.completed ? (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                Completed
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400">
                Pending
              </span>
            )}
          </div>
        </div>
      ))}
      
      {tasks.length === 0 && (
        <div className="text-center py-6 text-gray-500">
          <p>No tasks available for this course.</p>
        </div>
      )}
    </div>
  );
};

const CourseView: React.FC<CourseViewProps> = ({ courseId }) => {
  const [course, setCourse] = useState<Course | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const authenticatedFetch = getAuthenticatedFetch();

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await authenticatedFetch(`http://localhost:8080/api/courses/${courseId}`);
        
        if (!response) {
          toast.error('Authentication required');
          setLoading(false);
          return;
        }
        
        if (!response.ok) {
          toast.error('Failed to load course details');
          setLoading(false);
          return;
        }
        
        const courseData = await response.json();
        setCourse(courseData);
        
        // Fetch tasks for this course - use the user-specific endpoint
        const tasksResponse = await authenticatedFetch(`http://localhost:8080/api/user/courses/${courseId}/tasks`);
        
        if (tasksResponse && tasksResponse.ok) {
          const tasksData = await tasksResponse.json();
          setTasks(tasksData);
          
          // Calculate initial progress
          if (tasksData.length > 0) {
            const completedTasks = tasksData.filter((task: Task) => task.completed).length;
            const progressPercentage = (completedTasks / tasksData.length) * 100;
            setProgress(progressPercentage);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching course details:', error);
        toast.error('Failed to load course details');
        setLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const endpoint = completed ? 
        `http://localhost:8080/api/tasks/${taskId}/complete` : 
        `http://localhost:8080/api/tasks/${taskId}/incomplete`;
      
      const response = await authenticatedFetch(endpoint, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      if (!response) {
        toast.error('Authentication required');
        return;
      }
      
      if (!response.ok) {
        toast.error(`Failed to mark task as ${completed ? 'completed' : 'incomplete'}`);
        return;
      }
      
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      setTasks(updatedTasks);
      
      // Recalculate progress
      if (updatedTasks.length > 0) {
        const completedTasks = updatedTasks.filter(task => task.completed).length;
        const progressPercentage = (completedTasks / updatedTasks.length) * 100;
        setProgress(progressPercentage);
      }
      
      toast.success(`Task marked as ${completed ? 'completed' : 'incomplete'}`);
    } catch (error) {
      console.error('Error toggling task:', error);
      toast.error('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-6 bg-red-50 rounded-lg border border-red-200 text-center">
        <h2 className="text-xl font-semibold text-red-600 mb-2">Course Not Found</h2>
        <p className="text-gray-700">The requested course could not be loaded.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800 transition-all">
      {/* Course Header with Image */}
      <div className="relative h-64 sm:h-80 bg-gradient-to-r from-blue-600 to-violet-600 overflow-hidden">
        {course.thumbnailUrl ? (
          <img 
            src={course.thumbnailUrl} 
            alt={course.title} 
            className="w-full h-full object-cover opacity-90 transition-transform hover:scale-105 duration-700"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent flex items-end">
          <div className="p-6 sm:p-8 w-full">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="px-3 py-1 bg-blue-600/90 text-white text-xs font-medium rounded-full">
                {course.category}
              </span>
              {course.price === 0 && (
                <span className="px-3 py-1 bg-green-600/90 text-white text-xs font-medium rounded-full">
                  Free
                </span>
              )}
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3 drop-shadow-sm">{course.title}</h1>
            <div className="flex flex-wrap items-center text-white/90 text-sm gap-4">
              <span className="flex items-center">
                <BookOpen className="h-4 w-4 mr-2 opacity-70" />
                {tasks.length} {tasks.length === 1 ? 'Task' : 'Tasks'}
              </span>
              {course.instructor && (
                <span className="flex items-center">
                  <User className="h-4 w-4 mr-2 opacity-70" />
                  {course.instructor.username}
                </span>
              )}
              {course.createdAt && (
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 opacity-70" />
                  {new Date(course.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              )}
              <span className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 opacity-70" />
                ${course.price.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Content */}
      <div className="p-6 sm:p-8 max-w-5xl mx-auto">
        {/* Course Description */}
        <div className="mb-10">
          <div className="flex items-center mb-4">
            <div className="h-8 w-1 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">About This Course</h2>
          </div>
          <div className="pl-4 border-l-2 border-gray-100 dark:border-gray-800">
            <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
              {course.description}
            </p>
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-10 bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5">
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Your Progress</h2>
            </div>
            <div className="flex items-center text-sm font-medium bg-white dark:bg-gray-800 py-1 px-3 rounded-full shadow-sm border border-gray-100 dark:border-gray-700">
              <span className="text-blue-600 dark:text-blue-400 mr-1">
                {tasks.filter(task => task.completed).length}
              </span>
              <span className="text-gray-500 dark:text-gray-400">of</span>
              <span className="text-gray-700 dark:text-gray-300 ml-1">
                {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'} completed
              </span>
            </div>
          </div>
          
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4 overflow-hidden">
            <Progress 
              value={progress} 
              className="h-4 transition-all duration-700 ease-out" 
            />
          </div>
          
          <div className="flex justify-between items-center">
            <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {progress === 100 ? (
                <span className="text-green-600 dark:text-green-400 font-medium">Course completed! 🎉</span>
              ) : (
                <span>Estimated completion: {Math.round(progress)}%</span>
              )}
            </p>
            {progress === 100 && (
              <div className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-medium rounded-full">
                Completed
              </div>
            )}
          </div>
        </div>

        {/* Tasks Section */}
        <div>
          <div className="flex items-center mb-6">
            <div className="h-8 w-1 bg-blue-600 rounded-full mr-3"></div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Course Tasks</h2>
          </div>
          
          {tasks.length > 0 ? (
            <div className="space-y-3">
              <TaskProgress 
                tasks={tasks} 
                onTaskToggle={handleTaskToggle} 
              />
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
              <div className="h-16 w-16 mx-auto mb-4 text-gray-300 dark:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">No tasks available for this course.</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Check back later for updates.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseView;
