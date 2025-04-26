package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.LocalDateTime;

@Document(collection = "user_likes")
@CompoundIndexes({
    @CompoundIndex(name = "user_achievement_idx", def = "{'userId': 1, 'achievementId': 1}", unique = true)
})
public class UserLike {
    @Id
    private String id;

    private String userId;

    private String achievementId;

    @CreatedDate
    private LocalDateTime likedAt;

    public UserLike() {
    }

    public UserLike(String userId, String achievementId) {
        this.userId = userId;
        this.achievementId = achievementId;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getAchievementId() {
        return achievementId;
    }

    public void setAchievementId(String achievementId) {
        this.achievementId = achievementId;
    }

    public LocalDateTime getLikedAt() {
        return likedAt;
    }

    public void setLikedAt(LocalDateTime likedAt) {
        this.likedAt = likedAt;
    }

    @Override
    public String toString() {
        return "UserLike{" +
                "id='" + id + '\'' +
                ", userId='" + userId + '\'' +
                ", achievementId='" + achievementId + '\'' +
                ", likedAt=" + likedAt +
                '}';
    }
}