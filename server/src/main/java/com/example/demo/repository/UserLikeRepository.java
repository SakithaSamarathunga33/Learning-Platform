package com.example.demo.repository;

import com.example.demo.model.UserLike;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserLikeRepository extends MongoRepository<UserLike, String> {
    
    // Find likes by user
    List<UserLike> findByUserId(String userId);
    
    // Find likes for a specific achievement
    List<UserLike> findByAchievementId(String achievementId);
    
    // Find if a user has liked a specific achievement
    Optional<UserLike> findByUserIdAndAchievementId(String userId, String achievementId);
    
    // Count likes for an achievement
    long countByAchievementId(String achievementId);
    
    // Delete a like
    void deleteByUserIdAndAchievementId(String userId, String achievementId);
} 