package com.example.demo.controller;

import com.example.demo.model.Comment;
import com.example.demo.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Add a comment to an achievement
    @PostMapping("/{achievementId}")
    public ResponseEntity<Comment> addComment(
            @PathVariable String achievementId,
            @RequestBody Comment comment) {
        Comment createdComment = commentService.addComment(achievementId, comment);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdComment);
    }

    // Get all comments related to an achievement
    @GetMapping("/{achievementId}")
    public ResponseEntity<List<Comment>> getCommentsByAchievement(
            @PathVariable String achievementId) {
        List<Comment> comments = commentService.getCommentsByAchievement(achievementId);
        return ResponseEntity.ok(comments);
    }

    // Delete a comment by ID
    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(
            @PathVariable String commentId) {
        commentService.deleteComment(commentId);
        return ResponseEntity.noContent().build();
    }

    // Update an existing comment
    @PutMapping("/{commentId}")
    public ResponseEntity<Comment> updateComment(
            @PathVariable String commentId,
            @RequestBody Comment updatedComment) {
        Comment updated = commentService.updateComment(commentId, updatedComment);
        return ResponseEntity.ok(updated);
    }
}
