package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_likes")
public class UserLike {
    @Id
    private String id;
    
    private String userId;
    private String achievementId;
    
    public UserLike() {
    }
    
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
} 