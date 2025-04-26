package com.example.demo.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.demo.repository.UserLikeRepository;
import com.example.demo.repository.AchievementRepo;
import com.example.demo.model.UserLike;

@Service
public class LikeService {

    @Autowired
    private AchievementRepo achievementRepository;

    @Autowired
    private UserLikeRepository userLikeRepository;  // Using UserLikeRepository

    public void likeAchievement(String achievementId, String userId) {
        // Check if the achievement exists
        if (!achievementRepository.existsById(achievementId)) {
            throw new RuntimeException("Achievement not found with id: " + achievementId);
        }

        // Create a new like
        UserLike like = new UserLike();
        like.setAchievementId(achievementId);
        like.setUserId(userId);

        userLikeRepository.save(like);  // Save the like
    }

    public void unlikeAchievement(String achievementId, String userId) {
        // Remove like
        UserLike like = userLikeRepository.findByAchievementIdAndUserId(achievementId, userId);
        if (like != null) {
            userLikeRepository.delete(like);  // Delete the like
        } else {
            throw new RuntimeException("Like not found for the given achievement and user.");
        }
    }

    public Long getLikeCount(String achievementId) {
        return userLikeRepository.countByAchievementId(achievementId);  // Count likes for the achievement
    }

    public Boolean hasUserLiked(String achievementId, String userId) {
        return userLikeRepository.existsByAchievementIdAndUserId(achievementId, userId);  // Check if user has liked
    }
}
