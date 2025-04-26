package com.example.demo.service;

import com.example.demo.model.Comment;
import com.example.demo.repository.CommentRepository;
import com.example.demo.model.Achievement;
import com.example.demo.repository.AchievementRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private AchievementRepo achievementRepository;

    // Add a comment to an achievement
    // Add a comment to an achievement
    public Comment addComment(String achievementId, Comment comment) {
        // Find the Achievement by its ID (String)
        Achievement achievement = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new RuntimeException("Achievement not found with id: " + achievementId));

        // Set the achievementId for the comment (String)
        comment.setAchievementId(achievementId);

        // Save and return the comment
        return commentRepository.save(comment);
    }

    // Get all comments related to an achievement
    public List<Comment> getCommentsByAchievement(String achievementId) {
        // Fetch all comments by achievementId (String)
        return commentRepository.findByAchievementId(achievementId);
    }

    // Update an existing comment
    public Comment updateComment(String commentId, Comment updatedComment) {
        // Find the existing comment by its ID (String)
        Comment existingComment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found with id: " + commentId));

        // Check if the achievementId is the same
        if (!existingComment.getAchievementId().equals(updatedComment.getAchievementId())) {
            throw new RuntimeException("Achievement ID mismatch");
        }

        // Update the fields of the existing comment
        existingComment.setText(updatedComment.getText());
        existingComment.setUser(updatedComment.getUser());

        // Save and return the updated comment
        return commentRepository.save(existingComment);
    }

    // Delete a comment by its ID
    public void deleteComment(String commentId) {
        // Delete the comment by its ID (String)
        commentRepository.deleteById(commentId);
    }
}
