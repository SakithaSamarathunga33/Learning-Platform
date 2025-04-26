package com.example.demo.controller;

import com.example.demo.model.Achievement;
import com.example.demo.service.AchievementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/achievements")
public class AchievementController {

    private final AchievementService achievementService;

    @Autowired
    public AchievementController(AchievementService achievementService) {
        this.achievementService = achievementService;
    }

    @GetMapping
    public ResponseEntity<List<Achievement>> getAllAchievements() {
        List<Achievement> achievements = achievementService.getAllAchievements();
        return ResponseEntity.ok(achievements);
    }

    @PostMapping
    public ResponseEntity<Achievement> createAchievement(@RequestBody Achievement achievement) {
        Achievement createdAchievement = achievementService.createAchievement(achievement);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdAchievement);
    }

    // Change the ID type to String
    @GetMapping("/{id}")
    public ResponseEntity<Achievement> getAchievementById(@PathVariable String id) {
        Achievement achievement = achievementService.getAchievementById(id);
        return ResponseEntity.ok(achievement);
    }

    // Change the ID type to String
    @PutMapping("/{id}")
    public ResponseEntity<Achievement> updateAchievement(@PathVariable String id, 
                                                         @RequestBody Achievement achievement) {
        Achievement updatedAchievement = achievementService.updateAchievement(id, achievement);
        return ResponseEntity.ok(updatedAchievement);
    }

    // Change the ID type to String
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAchievement(@PathVariable String id) {
        achievementService.deleteAchievement(id);
        return ResponseEntity.noContent().build();
    }
}
