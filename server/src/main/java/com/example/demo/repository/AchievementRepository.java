package com.example.demo.repository;

import com.example.demo.model.Achievement;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends MongoRepository<Achievement, String> {
    List<Achievement> findAllByOrderByCreatedAtDesc();
    List<Achievement> findByUserIdOrderByCreatedAtDesc(String userId);
} 