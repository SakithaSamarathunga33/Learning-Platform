package com.example.demo.repository;

import com.example.demo.model.Achievement;
import com.example.demo.model.User;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface AchievementRepo extends MongoRepository<Achievement, String> {
    List<Achievement> findByTitle(String title);
    
    // Find by user ID (since we use DBRef for the user field)
    List<Achievement> findByUser_Id(String userId);
    
    // Alternatively, we can use a MongoDB query
    @Query("{ 'user.$id' : ?0 }")
    List<Achievement> findByUserId(String userId);
}