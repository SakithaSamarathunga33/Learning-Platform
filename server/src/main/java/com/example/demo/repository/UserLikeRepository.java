package com.example.demo.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.demo.model.UserLike;

public interface UserLikeRepository extends MongoRepository<UserLike, String> {
    UserLike findByAchievementIdAndUserId(String achievementId, String userId);
    Long countByAchievementId(String achievementId);
    Boolean existsByAchievementIdAndUserId(String achievementId, String userId);
}
