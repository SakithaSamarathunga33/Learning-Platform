package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:3030", "http://localhost:3000"})
public class AdminController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> getDashboardStats() {
        try {
            long totalUsers = userRepository.count();
            long activeUsers = userRepository.countByEnabled(true);
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalUsers", totalUsers);
            stats.put("activeUsers", activeUsers);
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
}
