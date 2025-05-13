package com.example.demo.service;

import com.example.demo.dto.TaskDTO;
import com.example.demo.model.Task;
import com.example.demo.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class TaskService {

    @Autowired
    private TaskRepository taskRepository;

    // Convert between DTO and entity
    private TaskDTO convertToDTO(Task task) {
        TaskDTO dto = new TaskDTO();
        dto.setId(task.getId());
        dto.setTitle(task.getTitle());
        dto.setDescription(task.getDescription());
        dto.setCompleted(task.isCompleted());
        dto.setCourseId(task.getCourseId());
        dto.setUserId(task.getUserId());
        dto.setCreatedAt(task.getCreatedAt());
        dto.setUpdatedAt(task.getUpdatedAt());
        dto.setOrderIndex(task.getOrderIndex());
        dto.setDueDate(task.getDueDate());
        return dto;
    }

    private Task convertToEntity(TaskDTO dto) {
        Task task = new Task();
        task.setId(dto.getId());
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setCompleted(dto.isCompleted());
        task.setCourseId(dto.getCourseId());
        task.setUserId(dto.getUserId());
        
        if (dto.getCreatedAt() != null) {
            task.setCreatedAt(dto.getCreatedAt());
        } else {
            task.setCreatedAt(LocalDateTime.now());
        }
        
        if (dto.getUpdatedAt() != null) {
            task.setUpdatedAt(dto.getUpdatedAt());
        } else {
            task.setUpdatedAt(LocalDateTime.now());
        }
        
        task.setOrderIndex(dto.getOrderIndex());
        task.setDueDate(dto.getDueDate());
        return task;
    }

    // Required methods for TaskController
    public TaskDTO createTask(TaskDTO taskDTO) {
        Task task = convertToEntity(taskDTO);
        task.setCreatedAt(LocalDateTime.now());
        task.setUpdatedAt(LocalDateTime.now());
        return convertToDTO(taskRepository.save(task));
    }

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TaskDTO getTaskById(String id) {
        Optional<Task> task = taskRepository.findById(id);
        return task.map(this::convertToDTO).orElse(null);
    }

    public List<TaskDTO> getTasksByCourse(String courseId) {
        return taskRepository.findByCourseId(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByUser(String userId) {
        return taskRepository.findAll().stream()
                .filter(task -> task.getUserId() != null && task.getUserId().equals(userId))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getTasksByCourseAndUser(String courseId, String userId) {
        return taskRepository.findByCourseIdAndUserId(courseId, userId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public TaskDTO updateTask(String id, TaskDTO taskDTO) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            task.setTitle(taskDTO.getTitle());
            task.setDescription(taskDTO.getDescription());
            task.setOrderIndex(taskDTO.getOrderIndex());
            task.setDueDate(taskDTO.getDueDate());
            task.setUpdatedAt(LocalDateTime.now());
            return convertToDTO(taskRepository.save(task));
        }
        return null;
    }

    public TaskDTO updateTaskStatus(String id, boolean completed, String userId) {
        Optional<Task> taskOpt = taskRepository.findById(id);
        if (taskOpt.isPresent()) {
            Task task = taskOpt.get();
            
            // Check if this is a user-specific task or if the user has permission
            if ((task.getUserId() == null) || task.getUserId().equals(userId)) {
                task.setCompleted(completed);
                task.setUpdatedAt(LocalDateTime.now());
                return convertToDTO(taskRepository.save(task));
            }
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

    // Existing methods with converted return types
    public List<TaskDTO> getAllTasksForCourse(String courseId) {
        return taskRepository.findByCourseIdAndUserIdIsNull(courseId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getUserTasksForCourse(String courseId, String userId) {
        List<Task> userTasks = taskRepository.findByCourseIdAndUserId(courseId, userId);
        
        // If user doesn't have tasks for this course yet, create them from the course template tasks
        if (userTasks.isEmpty()) {
            List<Task> courseTasks = taskRepository.findByCourseIdAndUserIdIsNull(courseId);
            for (Task courseTask : courseTasks) {
                Task userTask = new Task(
                    courseTask.getTitle(),
                    courseTask.getDescription(),
                    courseId,
                    userId,
                    courseTask.getOrderIndex()
                );
                userTask.setDueDate(courseTask.getDueDate());
                taskRepository.save(userTask);
            }
            userTasks = taskRepository.findByCourseIdAndUserId(courseId, userId);
        }
        
        return userTasks.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
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
