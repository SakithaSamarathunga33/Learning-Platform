package com.example.demo.controller;

import com.example.demo.dto.TaskDTO;
import com.example.demo.service.TaskService;
import com.example.demo.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tasks")
@CrossOrigin(origins = "http://localhost:3030")
public class TaskController {

    @Autowired
    private TaskService taskService;
    
    @Autowired
    private AuthUtil authUtil;

    // Create a new task (admin only)
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskDTO> createTask(@RequestBody TaskDTO taskDTO) {
        TaskDTO createdTask = taskService.createTask(taskDTO);
        return ResponseEntity.ok(createdTask);
    }

    // Get all tasks (admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<TaskDTO>> getAllTasks() {
        return ResponseEntity.ok(taskService.getAllTasks());
    }

    // Get task by ID
    @GetMapping("/{id}")
    public ResponseEntity<TaskDTO> getTaskById(@PathVariable String id) {
        return ResponseEntity.ok(taskService.getTaskById(id));
    }

    // Get tasks for a course
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<TaskDTO>> getTasksByCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(taskService.getTasksByCourse(courseId));
    }

    // Get tasks for the current user
    @GetMapping("/my-tasks")
    public ResponseEntity<List<TaskDTO>> getMyTasks() {
        String userId = authUtil.getCurrentUser().getId();
        return ResponseEntity.ok(taskService.getTasksByUser(userId));
    }

    // Get tasks for a specific course and the current user
    @GetMapping("/my-tasks/course/{courseId}")
    public ResponseEntity<List<TaskDTO>> getMyCourseTasksByCourse(@PathVariable String courseId) {
        String userId = authUtil.getCurrentUser().getId();
        return ResponseEntity.ok(taskService.getTasksByCourseAndUser(courseId, userId));
    }

    // Update task (admin only)
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TaskDTO> updateTask(@PathVariable String id, @RequestBody TaskDTO taskDTO) {
        TaskDTO updatedTask = taskService.updateTask(id, taskDTO);
        return ResponseEntity.ok(updatedTask);
    }

    // Update task completion status
    @PatchMapping("/{id}/status")
    public ResponseEntity<TaskDTO> updateTaskStatus(@PathVariable String id, @RequestBody Map<String, Boolean> statusUpdate) {
        boolean completed = statusUpdate.get("completed");
        String userId = authUtil.getCurrentUser().getId();
        TaskDTO updatedTask = taskService.updateTaskStatus(id, completed, userId);
        return ResponseEntity.ok(updatedTask);
    }

    // Delete task (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> deleteTask(@PathVariable String id) {
        boolean deleted = taskService.deleteTask(id);
        return ResponseEntity.ok(Map.of("success", deleted));
    }
    
    // Mark task as complete
    @PutMapping("/{id}/complete")
    public ResponseEntity<TaskDTO> markTaskAsComplete(@PathVariable String id) {
        String userId = authUtil.getCurrentUser().getId();
        TaskDTO updatedTask = taskService.updateTaskStatus(id, true, userId);
        return ResponseEntity.ok(updatedTask);
    }
    
    // Mark task as incomplete
    @PutMapping("/{id}/incomplete")
    public ResponseEntity<TaskDTO> markTaskAsIncomplete(@PathVariable String id) {
        String userId = authUtil.getCurrentUser().getId();
        TaskDTO updatedTask = taskService.updateTaskStatus(id, false, userId);
        return ResponseEntity.ok(updatedTask);
    }
}
