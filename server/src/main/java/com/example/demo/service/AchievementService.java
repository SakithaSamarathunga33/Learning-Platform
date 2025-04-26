package com.example.demo.service;

import com.example.demo.model.Achievement;
import com.example.demo.repository.AchievementRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AchievementService {

    @Autowired
    private AchievementRepo achievementRepository;

    public List<Achievement> getAllAchievements() {
        return achievementRepository.findAll();
    }

    public Achievement createAchievement(Achievement achievement) {
        return achievementRepository.save(achievement);
    }

    // Update the method to use String for the ID type
    public Achievement getAchievementById(String id) {
        return achievementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Achievement not found with id: " + id));
    }

    // Update the method to use String for the ID type
    public Achievement updateAchievement(String id, Achievement updatedAchievement) {
        Achievement achievement = getAchievementById(id);
        achievement.setTitle(updatedAchievement.getTitle());
        achievement.setDescription(updatedAchievement.getDescription());
        // Update other fields here if needed
        return achievementRepository.save(achievement);
    }

    // Update the method to use String for the ID type
    public void deleteAchievement(String id) {
        achievementRepository.deleteById(id);
    }
}
