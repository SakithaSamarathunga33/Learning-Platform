package com.example.demo.repository;

import com.example.demo.model.Achievement;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

public interface AchievementRepo extends MongoRepository<Achievement, String> {
    List<Achievement> findByTitle(String title);
}