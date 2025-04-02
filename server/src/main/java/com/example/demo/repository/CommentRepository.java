package com.example.demo.repository;

import com.example.demo.model.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CommentRepository extends MongoRepository<Comment, String> {

    // Find all comments for a specific achievement, ordered by creation date ascending (oldest first)
    List<Comment> findByAchievementIdOrderByCreatedAtAsc(String achievementId);
    
    // Find all comments for a specific achievement, ordered by creation date descending (newest first)
    List<Comment> findByAchievementIdOrderByCreatedAtDesc(String achievementId);

    // You might need more specific query methods later, e.g., for admin filtering
} 