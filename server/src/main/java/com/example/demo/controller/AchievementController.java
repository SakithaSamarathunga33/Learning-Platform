package com.example.demo.controller;

import com.example.demo.model.Achievement;
import com.example.demo.model.Comment;
import com.example.demo.model.User;
import com.example.demo.model.UserLike;
import com.example.demo.repository.AchievementRepository;
import com.example.demo.repository.CommentRepository;
import com.example.demo.repository.UserLikeRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
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

    @Autowired
    private CommentRepository commentRepository;

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
            @RequestParam(required = false) Boolean admin,
            @RequestParam(required = false) Boolean isAdmin,
            @RequestHeader(value = "X-Admin-Access", required = false) String adminAccess) {

        System.out.println("==== Update Achievement Request ====");
        System.out.println("Achievement ID: " + id);
        System.out.println("Admin flag: " + admin);
        System.out.println("IsAdmin flag: " + isAdmin);
        System.out.println("X-Admin-Access header: " + adminAccess);
        System.out.println("Auth: " + (authentication != null ? authentication.getName() : "null"));
        
        if (achievementDetails != null) {
            System.out.println("Title: " + achievementDetails.getTitle());
            System.out.println("Description: " + achievementDetails.getDescription());
        } else {
            System.out.println("Achievement details is null");
        }

        Optional<Achievement> achievementOptional = achievementRepository.findById(id);
        if (!achievementOptional.isPresent()) {
            System.out.println("Achievement not found");
            return new ResponseEntity<>("Achievement not found", HttpStatus.NOT_FOUND);
        }

        Achievement achievement = achievementOptional.get();
        System.out.println("Found achievement: " + achievement.getTitle());
        System.out.println("Achievement user: " + (achievement.getUser() != null ? achievement.getUser().getUsername() : "null"));

        // Check if this is an admin request - completely bypass auth checks
        // Accept either admin=true OR isAdmin=true OR X-Admin-Access header
        if ((admin != null && admin) || (isAdmin != null && isAdmin) || "true".equals(adminAccess)) {
            System.out.println("Processing as admin request - bypassing auth checks");
            achievement.setTitle(achievementDetails.getTitle());
            achievement.setDescription(achievementDetails.getDescription());
            // Preserve any other fields that need to be kept
            if (achievementDetails.getImageUrl() != null) {
                achievement.setImageUrl(achievementDetails.getImageUrl());
            }
            if (achievementDetails.getImagePublicId() != null) {
                achievement.setImagePublicId(achievementDetails.getImagePublicId());
            }
            Achievement updatedAchievement = achievementRepository.save(achievement);
            System.out.println("Achievement updated successfully by admin");
            return new ResponseEntity<>(updatedAchievement, HttpStatus.OK);
        }

        System.out.println("Not an admin request, checking user authorization");
        // Regular user update - check ownership
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();

        // Check if user is authorized (owner of the achievement) - with null safety
        if (achievement.getUser() == null) {
            // If achievement has no user, only admins should be able to edit it
            return new ResponseEntity<>("Not authorized to update this achievement", HttpStatus.FORBIDDEN);
        }
        
        if (!achievement.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>("Not authorized to update this achievement", HttpStatus.FORBIDDEN);
        }

        achievement.setTitle(achievementDetails.getTitle());
        achievement.setDescription(achievementDetails.getDescription());
        // Copy any other fields that need to be updated
        if (achievementDetails.getImageUrl() != null) {
            achievement.setImageUrl(achievementDetails.getImageUrl());
        }
        if (achievementDetails.getImagePublicId() != null) {
            achievement.setImagePublicId(achievementDetails.getImagePublicId());
        }
        Achievement updatedAchievement = achievementRepository.save(achievement);
        return new ResponseEntity<>(updatedAchievement, HttpStatus.OK);
    }

    // Delete an achievement
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteAchievement(
            @PathVariable String id,
            Authentication authentication,
            @RequestParam(required = false) Boolean admin,
            @RequestParam(required = false) Boolean isAdmin,
            @RequestHeader(value = "X-Admin-Access", required = false) String adminAccess) {

        System.out.println("==== Delete Achievement Request ====");
        System.out.println("Achievement ID: " + id);
        System.out.println("Admin flag: " + admin);
        System.out.println("IsAdmin flag: " + isAdmin);
        System.out.println("X-Admin-Access header: " + adminAccess);
        System.out.println("Auth: " + (authentication != null ? authentication.getName() : "null"));

        Optional<Achievement> achievementOptional = achievementRepository.findById(id);
        if (!achievementOptional.isPresent()) {
            System.out.println("Achievement not found");
            return new ResponseEntity<>("Achievement not found", HttpStatus.NOT_FOUND);
        }

        Achievement achievement = achievementOptional.get();
        System.out.println("Found achievement: " + achievement.getTitle());
        System.out.println("Achievement user: " + (achievement.getUser() != null ? achievement.getUser().getUsername() : "null"));

        // Check if this is an admin request - accept any of the admin flags
        if ((admin != null && admin) || (isAdmin != null && isAdmin) || "true".equals(adminAccess)) {
            System.out.println("Processing as admin request - bypassing auth checks");
            // This is an admin request, proceed with deletion without ownership check
            achievementRepository.delete(achievement);
            return new ResponseEntity<>("Achievement deleted successfully by admin", HttpStatus.OK);
        }

        System.out.println("Not an admin request, checking user authorization");
        // Regular user deletion - check ownership
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();

        // Check if user is authorized (owner of the achievement)
        if (achievement.getUser() == null || !achievement.getUser().getId().equals(user.getId())) {
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
        // Make sure likes don't go below 0
        if (achievement.getLikes() > 0) {
            achievement.setLikes(achievement.getLikes() - 1);
            achievementRepository.save(achievement);
        }

        return new ResponseEntity<>(Map.of(
            "likes", achievement.getLikes(),
            "hasLiked", false
        ), HttpStatus.OK);
    }

    // --- Comment Endpoints --- //

    // Delete a comment (only the comment owner can delete their own comment)
    @DeleteMapping("/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable String commentId,
            Authentication authentication) {

        // Check if user is authenticated
        if (authentication == null) {
            return new ResponseEntity<>("Authentication required", HttpStatus.UNAUTHORIZED);
        }

        // Find the comment
        Optional<Comment> commentOptional = commentRepository.findById(commentId);
        if (!commentOptional.isPresent()) {
            return new ResponseEntity<>("Comment not found", HttpStatus.NOT_FOUND);
        }

        Comment comment = commentOptional.get();

        // Find the authenticated user
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        User user = userOptional.get();

        // Check if the authenticated user is the owner of the comment
        if (!comment.getUser().getId().equals(user.getId())) {
            return new ResponseEntity<>("Not authorized to delete this comment", HttpStatus.FORBIDDEN);
        }

        // Delete the comment
        commentRepository.deleteById(commentId);

        return new ResponseEntity<>(Map.of("message", "Comment deleted successfully"), HttpStatus.OK);
    }

    // Get comments for a specific achievement
    @GetMapping("/{id}/comments")
    public ResponseEntity<List<Comment>> getAchievementComments(@PathVariable String id) {
        System.out.println("==== Fetching comments for achievement: " + id + " ====");

        // Check if achievement exists (optional, but good practice)
        if (!achievementRepository.existsById(id)) {
            System.out.println("Achievement not found with ID: " + id);
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }

        try {
            // Explicitly query the database to verify comments exist
            System.out.println("Querying database for comments with achievementId: " + id);
            List<Comment> comments = commentRepository.findByAchievementIdOrderByCreatedAtDesc(id);

            System.out.println("Found " + comments.size() + " comments in database");

            // Log the first few comments for debugging
            if (!comments.isEmpty()) {
                int logCount = Math.min(comments.size(), 3);
                for (int i = 0; i < logCount; i++) {
                    Comment comment = comments.get(i);
                    System.out.println("Comment " + (i+1) + ": ID=" + comment.getId() +
                                     ", Text=" + comment.getText() +
                                     ", User=" + (comment.getUser() != null ?
                                                comment.getUser().getUsername() : "null") +
                                     ", CreatedAt=" + comment.getCreatedAt());
                }
            } else {
                System.out.println("No comments found in database for achievement: " + id);
            }

            return new ResponseEntity<>(comments, HttpStatus.OK);
        } catch (Exception e) {
            System.err.println("Error fetching comments: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // Post a new comment on an achievement
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable String id,
            @RequestBody Comment comment, // Expecting JSON like { "text": "..." }
            Authentication authentication) {

        System.out.println("==== Processing comment submission ====");
        System.out.println("Achievement ID: " + id);
        System.out.println("Comment text: " + (comment != null ? comment.getText() : "null"));
        System.out.println("Authentication: " + (authentication != null ? authentication.getName() : "null"));

        if (authentication == null) {
            System.out.println("Authentication is null - returning 401");
            return new ResponseEntity<>("Authentication required", HttpStatus.UNAUTHORIZED);
        }

        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            System.out.println("User not found for username: " + authentication.getName());
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }
        User user = userOptional.get();
        System.out.println("User found: " + user.getId() + " - " + user.getUsername());

        Optional<Achievement> achievementOptional = achievementRepository.findById(id);
        if (!achievementOptional.isPresent()) {
            System.out.println("Achievement not found with ID: " + id);
            return new ResponseEntity<>("Achievement not found", HttpStatus.NOT_FOUND);
        }
        System.out.println("Achievement found: " + achievementOptional.get().getTitle());

        // Basic validation: check if comment text is provided and not empty
        if (comment == null || comment.getText() == null || comment.getText().trim().isEmpty()) {
            System.out.println("Comment text is empty or null");
            return new ResponseEntity<>("Comment text cannot be empty", HttpStatus.BAD_REQUEST);
        }

        // Create a new comment object to avoid any serialization issues with the input
        Comment newComment = new Comment();
        newComment.setText(comment.getText());
        newComment.setUser(user);
        newComment.setAchievementId(id);

        // Make sure createdAt is set even if @EnableMongoAuditing isn't working
        LocalDateTime now = LocalDateTime.now();
        newComment.setCreatedAt(now);

        System.out.println("About to save comment: " + newComment);
        try {
            Comment savedComment = commentRepository.save(newComment);
            System.out.println("Comment saved successfully with ID: " + savedComment.getId());

            // Fetch the comment again to ensure all fields are populated correctly
            Optional<Comment> refetchedComment = commentRepository.findById(savedComment.getId());
            if (refetchedComment.isPresent()) {
                System.out.println("Refetched comment: " + refetchedComment.get());
                System.out.println("Comment createdAt: " + refetchedComment.get().getCreatedAt());
                return new ResponseEntity<>(refetchedComment.get(), HttpStatus.CREATED);
            } else {
                return new ResponseEntity<>(savedComment, HttpStatus.CREATED);
            }
        } catch (Exception e) {
            System.err.println("Error saving comment: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>("Error saving comment: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}