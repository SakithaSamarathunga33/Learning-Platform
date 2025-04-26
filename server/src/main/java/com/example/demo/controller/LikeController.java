package com.example.demo.controller;

import com.example.demo.service.LikeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/achievements/{achievementId}/likes")
public class LikeController {

    private final LikeService likeService;

    @Autowired
    public LikeController(LikeService likeService) {
        this.likeService = likeService;
    }

    @PostMapping
    public ResponseEntity<Void> likeAchievement(
            @PathVariable String achievementId,
            @RequestHeader("X-User-ID") String userId) {
        likeService.likeAchievement(achievementId, userId);
        return ResponseEntity.status(HttpStatus.CREATED).build();
    }

    @DeleteMapping
    public ResponseEntity<Void> unlikeAchievement(
            @PathVariable String achievementId,
            @RequestHeader("X-User-ID") String userId) {
        likeService.unlikeAchievement(achievementId, userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/count")
    public ResponseEntity<Long> getLikeCount(@PathVariable String achievementId) {
        Long count = likeService.getLikeCount(achievementId);
        return ResponseEntity.ok(count);
    }

    @GetMapping("/has-liked")
    public ResponseEntity<Boolean> hasUserLiked(
            @PathVariable String achievementId,
            @RequestHeader("X-User-ID") String userId) {
        Boolean hasLiked = likeService.hasUserLiked(achievementId, userId);
        return ResponseEntity.ok(hasLiked);
    }
}
