import React, { useState, useEffect } from 'react';
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAuthenticatedFetch } from '@/utils/auth';
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  courseId: string;
  userId?: string;
  orderIndex: number;
}

interface TaskProgressProps {
  courseId: string;
}

export default function TaskProgress({ courseId }: TaskProgressProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const authenticatedFetch = getAuthenticatedFetch();

  useEffect(() => {
    fetchTasks();
  }, [courseId]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await authenticatedFetch(`http://localhost:8080/api/user/courses/${courseId}/tasks`);
      
      if (!response || !response.ok) {
        throw new Error('Failed to fetch tasks');
      }
      
      const data = await response.json();
      setTasks(data);
      
      // Calculate progress
      calculateProgress(data);
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast.error('Failed to load course tasks');
      setLoading(false);
    }
  };

  const calculateProgress = (taskList: Task[]) => {
    if (taskList.length === 0) {
      setProgress(0);
      return;
    }
    
    const completedCount = taskList.filter(task => task.completed).length;
    const progressPercentage = (completedCount / taskList.length) * 100;
    setProgress(progressPercentage);
  };

  const handleTaskToggle = async (taskId: string, completed: boolean) => {
    try {
      const endpoint = completed 
        ? `http://localhost:8080/api/tasks/${taskId}/complete`
        : `http://localhost:8080/api/tasks/${taskId}/incomplete`;
      
      const response = await authenticatedFetch(endpoint, {
        method: 'PUT'
      });
      
      if (!response || !response.ok) {
        throw new Error('Failed to update task status');
      }
      
      // Update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      );
      
      setTasks(updatedTasks);
      calculateProgress(updatedTasks);
      
      toast.success(completed ? 'Task completed!' : 'Task marked as incomplete');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Failed to update task status');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Course Progress</span>
          <span className="text-sm font-normal">
            {Math.round(progress)}% Complete
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progress} className="h-2" />
        
        {tasks.length > 0 ? (
          <div className="space-y-2 mt-4">
            {tasks
              .sort((a, b) => a.orderIndex - b.orderIndex)
              .map((task) => (
                <div key={task.id} className="flex items-start space-x-2 p-2 rounded hover:bg-muted/50 transition-colors">
                  <Checkbox 
                    id={`task-${task.id}`}
                    checked={task.completed}
                    onCheckedChange={(checked) => {
                      handleTaskToggle(task.id, checked === true);
                    }}
                  />
                  <label 
                    htmlFor={`task-${task.id}`}
                    className={`text-sm cursor-pointer ${task.completed ? 'line-through text-muted-foreground' : ''}`}
                  >
                    {task.title}
                  </label>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center p-4 text-muted-foreground">
            No tasks available for this course.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
