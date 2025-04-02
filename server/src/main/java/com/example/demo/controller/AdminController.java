package com.example.demo.controller;

import com.example.demo.model.Comment;
import com.example.demo.model.User;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.CourseRepository;
import com.example.demo.service.UserService;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;
import java.util.Optional;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3030", "http://localhost:3000"})
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AchievementRepository achievementRepository;
    
    @Autowired
    private CourseRepository courseRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.countByEnabled(true);
            long totalComments = commentRepository.count();
            long totalAchievements = achievementRepository.count();
            long totalCourses = courseRepository.count();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
            stats.put("totalComments", totalComments);
            stats.put("totalAchievements", totalAchievements);
            stats.put("totalCourses", totalCourses);
            stats.put("totalMedia", 0); // You can implement this when you have media functionality

            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/users")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        List<User> users = userService.getAllUsers();
        return ResponseEntity.ok(users);
    }

    @DeleteMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        return userService.deleteUser(id) 
            ? ResponseEntity.ok().build() 
            : ResponseEntity.notFound().build();
    }

    @PutMapping("/users/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> userDetails) {
        try {
            User existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.notFound().build();
            }

            if (userDetails.get("name") != null) {
                existingUser.setName((String) userDetails.get("name"));
            }
            if (userDetails.get("email") != null) {
                existingUser.setEmail((String) userDetails.get("email"));
            }
            if (userDetails.get("enabled") != null) {
                existingUser.setEnabled((Boolean) userDetails.get("enabled"));
            }

            User updatedUser = userService.updateUser(id, existingUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user: " + e.getMessage());
        }
    }

    @PutMapping("/users/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRole(@PathVariable String id, @RequestBody Map<String, Object> request) {
        try {
            User existingUser = userService.getUserById(id);
            if (existingUser == null) {
                return ResponseEntity.notFound().build();
            }

            @SuppressWarnings("unchecked")
            List<String> roles = (List<String>) request.get("roles");
            if (roles == null || roles.isEmpty()) {
                return ResponseEntity.badRequest().body("Roles list cannot be empty");
            }

            // Convert roles to Set and save
            existingUser.setRoles(Set.copyOf(roles));
            User updatedUser = userService.updateUser(id, existingUser);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating user role: " + e.getMessage());
        }
    }

    @GetMapping("/comments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Comment>> getAllComments() {
        List<Comment> comments = commentRepository.findAll();
        return ResponseEntity.ok(comments);
    }

    @PutMapping("/comments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateComment(@PathVariable String id, @RequestBody Map<String, String> commentDetails) {
        try {
            // Check if comment exists
            Optional<Comment> commentOptional = commentRepository.findById(id);
            if (!commentOptional.isPresent()) {
                return new ResponseEntity<>("Comment not found", HttpStatus.NOT_FOUND);
            }
            
            // Get the text from the request body
            String text = commentDetails.get("text");
            if (text == null || text.trim().isEmpty()) {
                return new ResponseEntity<>("Comment text is required", HttpStatus.BAD_REQUEST);
            }
            
            // Update the comment
            Comment comment = commentOptional.get();
            comment.setText(text);
            
            // Save the updated comment
            Comment updatedComment = commentRepository.save(comment);
            
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            return new ResponseEntity<>("Error updating comment: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @DeleteMapping("/comments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteComment(@PathVariable String id) {
        if (!commentRepository.existsById(id)) {
            return new ResponseEntity<>("Comment not found", HttpStatus.NOT_FOUND);
        }
        commentRepository.deleteById(id);
        return ResponseEntity.ok().body(Map.of("message", "Comment deleted successfully"));
    }
}
