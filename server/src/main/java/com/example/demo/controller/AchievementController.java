package com.example.demo.controller;

import com.example.demo.model.Achievement;
import com.example.demo.model.User;
import com.example.demo.model.UserLike;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.UserLikeRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    @Autowired
    private AchievementRepository achievementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserLikeRepository userLikeRepository;

    // Get all achievements (feed) - public endpoint, no authentication required
    @GetMapping
    public ResponseEntity<List<Achievement>> getAllAchievements(Authentication authentication) {
        List<Achievement> achievements = achievementRepository.findAllByOrderByCreatedAtDesc();
        
        // If authenticated, mark which achievements the user has liked
        if (authentication != null) {
            String username = authentication.getName();
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                List<UserLike> userLikes = userLikeRepository.findByUserId(user.getId());
                
                for (Achievement achievement : achievements) {
                    for (UserLike userLike : userLikes) {
                        if (userLike.getAchievementId().equals(achievement.getId())) {
                            achievement.setHasLiked(true);
                            break;
                        }
                    }
                }
            }
        }
        
        return new ResponseEntity<>(achievements, HttpStatus.OK);
    }

    // Get achievements by user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Achievement>> getUserAchievements(@PathVariable String userId) {
        return new ResponseEntity<>(achievementRepository.findByUserIdOrderByCreatedAtDesc(userId), HttpStatus.OK);
    }

    // Post new achievement
    @PostMapping
    public ResponseEntity<?> createAchievement(@RequestBody Achievement achievement, Authentication authentication) {
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();
        achievement.setUser(user);
        Achievement savedAchievement = achievementRepository.save(achievement);
        return new ResponseEntity<>(savedAchievement, HttpStatus.CREATED);
    }

    // Get a specific achievement
    @GetMapping("/{id}")
    public ResponseEntity<?> getAchievement(@PathVariable String id, Authentication authentication) {
        Optional<Achievement> achievementOptional = achievementRepository.findById(id);
        if (!achievementOptional.isPresent()) {
            return new ResponseEntity<>("Achievement not found", HttpStatus.NOT_FOUND);
        }
        
        Achievement achievement = achievementOptional.get();
        
        // If user is authenticated, check if they've liked this achievement
        if (authentication != null) {
            String username = authentication.getName();
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (userOptional.isPresent()) {
                User user = userOptional.get();
                Optional<UserLike> userLike = userLikeRepository.findByUserIdAndAchievementId(user.getId(), id);
                achievement.setHasLiked(userLike.isPresent());
            }
        } else {
            // For non-authenticated users, set hasLiked to false
            achievement.setHasLiked(false);
        }
        
        return new ResponseEntity<>(achievement, HttpStatus.OK);
    }

    // Update an achievement
    @PutMapping("/{id}")
    public ResponseEntity<?> updateAchievement(
            @PathVariable String id, 
            @RequestBody Achievement achievementDetails, 
            Authentication authentication,
            @RequestParam(required = false) Boolean admin) {
        
        Optional<Achievement> achievementOptional = achievementRepository.findById(id);
        if (!achievementOptional.isPresent()) {
            return new ResponseEntity<>("Achievement not found", HttpStatus.NOT_FOUND);
        }

        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();
        Achievement achievement = achievementOptional.get();

        // Check if the authenticated user is the owner of the achievement OR is an admin
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        boolean isAdminRequest = admin != null && admin && isAdmin;
        
        if (!achievement.getUser().getId().equals(user.getId()) && !isAdminRequest) {
            return new ResponseEntity<>("Not authorized to update this achievement", HttpStatus.FORBIDDEN);
        }

        achievement.setTitle(achievementDetails.getTitle());
        achievement.setDescription(achievementDetails.getDescription());
        Achievement updatedAchievement = achievementRepository.save(achievement);
        return new ResponseEntity<>(updatedAchievement, HttpStatus.OK);
    }

    // Delete an achievement
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAchievement(
            @PathVariable String id, 
            Authentication authentication,
            @RequestParam(required = false) Boolean admin) {
            
        Optional<Achievement> achievementOptional = achievementRepository.findById(id);
        if (!achievementOptional.isPresent()) {
            return new ResponseEntity<>("Achievement not found", HttpStatus.NOT_FOUND);
        }

        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();
        Achievement achievement = achievementOptional.get();

        // Check if the authenticated user is the owner of the achievement OR is an admin
        boolean isAdmin = user.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        
        boolean isAdminRequest = admin != null && admin && isAdmin;
        
        if (!achievement.getUser().getId().equals(user.getId()) && !isAdminRequest) {
            return new ResponseEntity<>("Not authorized to delete this achievement", HttpStatus.FORBIDDEN);
        }

        achievementRepository.delete(achievement);
        return new ResponseEntity<>("Achievement deleted successfully", HttpStatus.OK);
    }
    
    // Like an achievement
    @PostMapping("/{id}/like")
    public ResponseEntity<?> likeAchievement(@PathVariable String id, Authentication authentication) {
        // Check if user is authenticated
        if (authentication == null) {
            return new ResponseEntity<>("Authentication required", HttpStatus.UNAUTHORIZED);
        }
        
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        User user = userOptional.get();
        
        Optional<Achievement> achievementOptional = achievementRepository.findById(id);
        if (!achievementOptional.isPresent()) {
            return new ResponseEntity<>("Achievement not found", HttpStatus.NOT_FOUND);
        }
        
        Achievement achievement = achievementOptional.get();
        
        // Check if user already liked this achievement
        Optional<UserLike> existingLike = userLikeRepository.findByUserIdAndAchievementId(user.getId(), id);
        if (existingLike.isPresent()) {
            return new ResponseEntity<>(Map.of(
                "message", "You have already liked this achievement",
                "likes", achievement.getLikes()
            ), HttpStatus.OK);
        }
        
        // Create a new like record
        UserLike userLike = new UserLike();
        userLike.setUserId(user.getId());
        userLike.setAchievementId(id);
        userLikeRepository.save(userLike);
        
        // Update achievement likes count
        achievement.setLikes(achievement.getLikes() + 1);
        achievementRepository.save(achievement);
        
        return new ResponseEntity<>(Map.of(
            "likes", achievement.getLikes(),
            "hasLiked", true
        ), HttpStatus.OK);
    }
    
    // Unlike an achievement
    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> unlikeAchievement(@PathVariable String id, Authentication authentication) {
        // Check if user is authenticated
        if (authentication == null) {
            return new ResponseEntity<>("Authentication required", HttpStatus.UNAUTHORIZED);
        }
        
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        User user = userOptional.get();
        
        Optional<Achievement> achievementOptional = achievementRepository.findById(id);
        if (!achievementOptional.isPresent()) {
            return new ResponseEntity<>("Achievement not found", HttpStatus.NOT_FOUND);
        }
        
        Achievement achievement = achievementOptional.get();
        
        // Check if user has liked this achievement
        Optional<UserLike> existingLike = userLikeRepository.findByUserIdAndAchievementId(user.getId(), id);
        if (!existingLike.isPresent()) {
            return new ResponseEntity<>(Map.of(
                "message", "You have not liked this achievement",
                "likes", achievement.getLikes()
            ), HttpStatus.OK);
        }
        
        // Delete the like record
        userLikeRepository.delete(existingLike.get());
        
        // Update achievement likes count
        if (achievement.getLikes() > 0) {
            achievement.setLikes(achievement.getLikes() - 1);
            achievementRepository.save(achievement);
        }
        
        return new ResponseEntity<>(Map.of(
            "likes", achievement.getLikes(),
            "hasLiked", false
        ), HttpStatus.OK);
    }
} 