package com.example.demo.controller;

import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:3030")
public class TaskController {

    @Autowired
    private TaskService taskService;

    // Admin endpoints for managing course tasks
    @GetMapping("/courses/{courseId}/tasks")
    public ResponseEntity<List<Task>> getTasksForCourse(@PathVariable String courseId) {
        return ResponseEntity.ok(taskService.getAllTasksForCourse(courseId));
    }

    @PostMapping("/courses/{courseId}/tasks")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> createTaskForCourse(@PathVariable String courseId, @RequestBody Task task) {
        task.setCourseId(courseId);
        task.setUserId(null); // This is a course template task, not user-specific
        Task createdTask = taskService.createTask(task);
        return ResponseEntity.ok(createdTask);
    }

    @PutMapping("/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Task> updateTask(@PathVariable String id, @RequestBody Task taskDetails) {
        Task updatedTask = taskService.updateTask(id, taskDetails);
        return updatedTask != null ? ResponseEntity.ok(updatedTask) : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/tasks/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Boolean>> deleteTask(@PathVariable String id) {
        boolean deleted = taskService.deleteTask(id);
        return ResponseEntity.ok(Map.of("success", deleted));
    }

    // User endpoints for task completion
    @GetMapping("/user/courses/{courseId}/tasks")
    public ResponseEntity<List<Task>> getUserTasksForCourse(
            @PathVariable String courseId, 
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(taskService.getUserTasksForCourse(courseId, user.getId()));
    }

    @PutMapping("/tasks/{id}/complete")
    public ResponseEntity<Task> markTaskAsComplete(
            @PathVariable String id, 
            @AuthenticationPrincipal User user) {
        Task completedTask = taskService.markTaskAsComplete(id, user.getId());
        return completedTask != null ? ResponseEntity.ok(completedTask) : ResponseEntity.notFound().build();
    }

    @PutMapping("/tasks/{id}/incomplete")
    public ResponseEntity<Task> markTaskAsIncomplete(
            @PathVariable String id, 
            @AuthenticationPrincipal User user) {
        Task task = taskService.markTaskAsIncomplete(id, user.getId());
        return task != null ? ResponseEntity.ok(task) : ResponseEntity.notFound().build();
    }

    @GetMapping("/user/courses/{courseId}/progress")
    public ResponseEntity<Map<String, Double>> getCourseProgress(
            @PathVariable String courseId, 
            @AuthenticationPrincipal User user) {
        double progress = taskService.getCourseProgressPercentage(courseId, user.getId());
        return ResponseEntity.ok(Map.of("progress", progress));
    }
}
