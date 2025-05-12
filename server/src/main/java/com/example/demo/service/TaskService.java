package com.example.demo.service;

import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    public List<Task> getAllTasksForCourse(String courseId) {
        return taskRepository.findByCourseIdAndUserIdIsNull(courseId);
    }

    public List<Task> getUserTasksForCourse(String courseId, String userId) {
        List<Task> userTasks = taskRepository.findByCourseIdAndUserId(courseId, userId);
        
        // If user doesn't have tasks for this course yet, create them from the course template tasks
        if (userTasks.isEmpty()) {
            List<Task> courseTasks = taskRepository.findByCourseIdAndUserIdIsNull(courseId);
            for (Task courseTask : courseTasks) {
                Task userTask = new Task(
                    courseTask.getTitle(),
                    courseId,
                    userId,
                    courseTask.getOrderIndex()
                );
                taskRepository.save(userTask);
            }
            userTasks = taskRepository.findByCourseIdAndUserId(courseId, userId);
        }
        
        return userTasks;
    }

    public Task createTask(Task task) {
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return taskRepository.save(task);
    }

    public Task updateTask(String id, Task taskDetails) {
        Optional<Task> task = taskRepository.findById(id);
        if (task.isPresent()) {
            Task existingTask = task.get();
            
            existingTask.setTitle(taskDetails.getTitle());
            existingTask.setOrderIndex(taskDetails.getOrderIndex());
            existingTask.setUpdatedAt(LocalDateTime.now());
            
            return taskRepository.save(existingTask);
        }
        return null;
    }

    public boolean deleteTask(String id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Task markTaskAsComplete(String id, String userId) {
        Optional<Task> task = taskRepository.findById(id);
        if (task.isPresent()) {
            Task existingTask = task.get();
            
            // Only allow completing the task if it belongs to the user
            if (existingTask.getUserId() != null && existingTask.getUserId().equals(userId)) {
                existingTask.setCompleted(true);
                existingTask.setUpdatedAt(LocalDateTime.now());
                return taskRepository.save(existingTask);
            }
        }
        return null;
    }
    
    public Task markTaskAsIncomplete(String id, String userId) {
        Optional<Task> task = taskRepository.findById(id);
        if (task.isPresent()) {
            Task existingTask = task.get();
            
            // Only allow updating the task if it belongs to the user
            if (existingTask.getUserId() != null && existingTask.getUserId().equals(userId)) {
                existingTask.setCompleted(false);
                existingTask.setUpdatedAt(LocalDateTime.now());
                return taskRepository.save(existingTask);
            }
        }
        return null;
    }
    
    public double getCourseProgressPercentage(String courseId, String userId) {
        long totalTasks = taskRepository.countByCourseIdAndUserId(courseId, userId);
        if (totalTasks == 0) {
            return 0.0;
        }
        
        long completedTasks = taskRepository.countByCourseIdAndUserIdAndCompleted(courseId, userId, true);
        return (double) completedTasks / totalTasks * 100;
    }
}
