package com.example.demo.controller;

import com.example.demo.model.User;
import com.example.demo.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3030")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers() {
        return userService.getAllUsers();
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        User user = userService.getUserById(id);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @PostMapping
    public User createUser(@RequestBody User user) {
        return userService.createUser(user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User userDetails) {
        User updatedUser = userService.updateUser(id, userDetails);
        if (updatedUser != null) {
            return ResponseEntity.ok(updatedUser);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        if (userService.deleteUser(id)) {
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/username/{username}")
    public ResponseEntity<User> getUserByUsername(@PathVariable String username) {
        User user = userService.findByUsername(username);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<User> getUserByEmail(@PathVariable String email) {
        User user = userService.findByEmail(email);
        if (user != null) {
            return ResponseEntity.ok(user);
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/picture")
    public ResponseEntity<?> updateProfilePicture(
            @PathVariable String id,
            @RequestBody Map<String, String> request) {
        try {
            String pictureUrl = request.get("pictureUrl");
            if (pictureUrl == null || pictureUrl.isEmpty()) {
                return ResponseEntity.badRequest().body("Picture URL is required and cannot be empty");
            }

            logger.debug("Updating profile picture for user ID: {}", id);
            logger.debug("Picture URL: {}", pictureUrl);

            User user = userService.getUserById(id);
            if (user == null) {
                logger.error("User not found with ID: {}", id);
                return ResponseEntity.notFound().build();
            }

            user.setPicture(pictureUrl);
            User updatedUser = userService.updateUser(id, user);
            
            if (updatedUser == null) {
                logger.error("Failed to update user with ID: {}", id);
                return ResponseEntity.internalServerError().body("Failed to update user");
            }
            
            logger.debug("Profile picture updated successfully for user ID: {}", id);
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            logger.error("Error updating profile picture for user ID: {}", id, e);
            return ResponseEntity.internalServerError()
                .body("Error updating profile picture: " + e.getMessage());
        }
    }
}
