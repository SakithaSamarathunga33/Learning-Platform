package com.example.demo.repository;

import com.example.demo.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

<<<<<<< Updated upstream
public interface CommentRepository extends JpaRepository<Comment, String> {
    List<Comment> findByAchievementId(String achievementId);
}
=======
public interface CommentRepository extends MongoRepository<Comment, String> {

    // Find all comments for a specific achievement, ordered by creation date ascending (oldest first)
    List<Comment> findByAchievementIdOrderByCreatedAtAsc(String achievementId);
    
    // Find all comments for a specific achievement, ordered by creation date descending (newest first)
    List<Comment> findByAchievementIdOrderByCreatedAtDesc(String achievementId);

} 
>>>>>>> Stashed changes
