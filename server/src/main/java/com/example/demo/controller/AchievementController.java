package com.example.demo.controller;

import com.example.demo.model.Achievement;
import com.example.demo.service.AchievementService;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private final AchievementService achievementService;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        List<Achievement> achievements = achievementService.getAllAchievements();
        return ResponseEntity.ok(achievements);
    }

    @PostMapping
    public ResponseEntity<Achievement> createAchievement(@RequestBody Achievement achievement) {
        Achievement createdAchievement = achievementService.createAchievement(achievement);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAchievement);
    }

    // Change the ID type to String
    @GetMapping("/{id}")
    public ResponseEntity<Achievement> getAchievementById(@PathVariable String id) {
        Achievement achievement = achievementService.getAchievementById(id);
        return ResponseEntity.ok(achievement);
    }

    // Add endpoint to get achievements by userId
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getAchievementsByUserId(@PathVariable String userId, Authentication authentication) {
        // Check if user is authenticated
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Authentication required");
        }
        
        // Get authenticated user
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        String username = userDetails.getUsername();
        
        // Get authenticated user from repository
        Optional<User> authUser = userRepository.findByUsername(username);
        if (!authUser.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("User not found");
        }
        
        // Check if user is requesting their own achievements or is an admin
        boolean isAdmin = authUser.get().getRoles().contains("ROLE_ADMIN");
        boolean isOwnProfile = authUser.get().getId().equals(userId);
        
        if (!isOwnProfile && !isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("You don't have permission to access this user's achievements");
        }
        
        // Get achievements by userId
        List<Achievement> achievements = achievementService.getAchievementsByUserId(userId);
        return ResponseEntity.ok(achievements);
    }

    // Change the ID type to String
    @PutMapping("/{id}")
    public ResponseEntity<Achievement> updateAchievement(@PathVariable String id, 
                                                         @RequestBody Achievement achievement) {
        Achievement updatedAchievement = achievementService.updateAchievement(id, achievement);
        return ResponseEntity.ok(updatedAchievement);
    }

    // Change the ID type to String
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAchievement(@PathVariable String id) {
        achievementService.deleteAchievement(id);
        return ResponseEntity.noContent().build();
    }
}
