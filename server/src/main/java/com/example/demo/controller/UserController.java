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
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:3030")
public class UserController {

    private static final Logger logger = LoggerFactory.getLogger(UserController.class);

    @Autowired
    private UserService userService;

    @GetMapping
    public List<User> getAllUsers(@RequestParam(required = false) String search) {
        if (search != null && !search.trim().isEmpty()) {
            logger.info("Searching users with query: {}", search);
            return userService.searchUsersByUsername(search);
        }
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
    
    @PostMapping("/{id}/follow/{targetId}")
    public ResponseEntity<?> followUser(@PathVariable String id, @PathVariable String targetId) {
        try {
            if (id.equals(targetId)) {
                return ResponseEntity.badRequest().body("Users cannot follow themselves");
            }
            
            User user = userService.followUser(id, targetId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok().body(Map.of(
                "message", "Successfully followed user",
                "user", user
            ));
        } catch (Exception e) {
            logger.error("Error following user: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body("Error following user: " + e.getMessage());
        }
    }
    
    @PostMapping("/{id}/unfollow/{targetId}")
    public ResponseEntity<?> unfollowUser(@PathVariable String id, @PathVariable String targetId) {
        try {
            User user = userService.unfollowUser(id, targetId);
            if (user == null) {
                return ResponseEntity.notFound().build();
            }
            
            return ResponseEntity.ok().body(Map.of(
                "message", "Successfully unfollowed user",
                "user", user
            ));
        } catch (Exception e) {
            logger.error("Error unfollowing user: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError()
                .body("Error unfollowing user: " + e.getMessage());
        }
    }
    
    @GetMapping("/{id}/followers")
    public ResponseEntity<Set<User>> getUserFollowers(@PathVariable String id) {
        try {
            Set<User> followers = userService.getUserFollowers(id);
            return ResponseEntity.ok(followers);
        } catch (Exception e) {
            logger.error("Error getting user followers: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}/following")
    public ResponseEntity<Set<User>> getUserFollowing(@PathVariable String id) {
        try {
            Set<User> following = userService.getUserFollowing(id);
            return ResponseEntity.ok(following);
        } catch (Exception e) {
            logger.error("Error getting user following: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
    
    @GetMapping("/{id}/is-following/{targetId}")
    public ResponseEntity<Map<String, Boolean>> checkIfFollowing(
            @PathVariable String id, 
            @PathVariable String targetId) {
        try {
            boolean isFollowing = userService.isFollowing(id, targetId);
            return ResponseEntity.ok(Map.of("isFollowing", isFollowing));
        } catch (Exception e) {
            logger.error("Error checking following status: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }
}
