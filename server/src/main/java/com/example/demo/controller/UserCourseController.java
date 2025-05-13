package com.example.demo.controller;

import com.example.demo.dto.TaskDTO;
import com.example.demo.service.TaskService;
import com.example.demo.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/user/courses")
@CrossOrigin(origins = "http://localhost:3030")
public class UserCourseController {

    @Autowired
    private TaskService taskService;
    
    @Autowired
    private AuthUtil authUtil;
    
    // Get tasks for a specific course and the current user
    @GetMapping("/{courseId}/tasks")
    public ResponseEntity<List<TaskDTO>> getUserCourseTasks(@PathVariable String courseId) {
        // Get current user ID from authentication
        String userId = authUtil.getCurrentUser().getId();
        
        // Get user-specific tasks for this course, creating them if they don't exist
        List<TaskDTO> tasks = taskService.getUserTasksForCourse(courseId, userId);
        
        return ResponseEntity.ok(tasks);
    }
    
    // Get progress percentage for a course
    @GetMapping("/{courseId}/progress")
    public ResponseEntity<Double> getCourseProgress(@PathVariable String courseId) {
        String userId = authUtil.getCurrentUser().getId();
        double progress = taskService.getCourseProgressPercentage(courseId, userId);
        return ResponseEntity.ok(progress);
    }
} 