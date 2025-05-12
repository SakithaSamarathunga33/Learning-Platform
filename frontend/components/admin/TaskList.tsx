import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash2, Plus, ArrowUp, ArrowDown } from "lucide-react";
import { toast } from "sonner";

interface Task {
  id?: string;
  title: string;
  completed?: boolean;
  orderIndex?: number;
}

interface TaskListProps {
  tasks: Task[];
  onChange: (tasks: Task[]) => void;
}

export default function TaskList({ tasks, onChange }: TaskListProps) {
  const [newTaskTitle, setNewTaskTitle] = useState('');

  const handleAddTask = () => {
    if (!newTaskTitle.trim()) {
      toast.error('Task title cannot be empty');
      return;
    }

    const newTask: Task = {
      title: newTaskTitle,
      completed: false,
      orderIndex: tasks.length
    };

    onChange([...tasks, newTask]);
    setNewTaskTitle('');
  };

  const handleRemoveTask = (index: number) => {
    const updatedTasks = [...tasks];
    updatedTasks.splice(index, 1);
    
    // Update order indices
    const reorderedTasks = updatedTasks.map((task, idx) => ({
      ...task,
      orderIndex: idx
    }));
    
    onChange(reorderedTasks);
  };

  const handleUpdateTaskTitle = (index: number, title: string) => {
    const updatedTasks = [...tasks];
    updatedTasks[index] = { ...updatedTasks[index], title };
    onChange(updatedTasks);
  };

  const moveTask = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === tasks.length - 1)
    ) {
      return;
    }

    const updatedTasks = [...tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap tasks
    [updatedTasks[index], updatedTasks[targetIndex]] = [updatedTasks[targetIndex], updatedTasks[index]];
    
    // Update order indices
    const reorderedTasks = updatedTasks.map((task, idx) => ({
      ...task,
      orderIndex: idx
    }));
    
    onChange(reorderedTasks);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Course Tasks</h3>
      <div className="flex gap-2">
        <Input
          placeholder="Enter task title"
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleAddTask();
            }
          }}
        />
        <Button onClick={handleAddTask} size="sm">
          <Plus className="h-4 w-4 mr-1" /> Add Task
        </Button>
      </div>

      {tasks.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Order</TableHead>
              <TableHead>Task Title</TableHead>
              <TableHead className="w-[150px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tasks.map((task, index) => (
              <TableRow key={task.id || index}>
                <TableCell className="font-medium">{index + 1}</TableCell>
                <TableCell>
                  <Input
                    value={task.title}
                    onChange={(e) => handleUpdateTaskTitle(index, e.target.value)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveTask(index, 'up')}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => moveTask(index, 'down')}
                      disabled={index === tasks.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => handleRemoveTask(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center p-4 border rounded-md bg-muted/20">
          No tasks added yet. Add tasks to help users track their progress through this course.
        </div>
      )}
    </div>
  );
}
