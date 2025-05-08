package com.example.demo.repository;

import com.example.demo.model.Feedback;
import com.example.demo.model.User;
import com.example.demo.model.Course;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FeedbackRepository extends MongoRepository<Feedback, String> {
    // Find feedback by user
    List<Feedback> findByUser(User user);
    
    // Find feedback by course
    List<Feedback> findByCourse(Course course);
    
    // Find feedback by status
    List<Feedback> findByStatus(String status);
    
    // Find feedback by type
    List<Feedback> findByType(String type);
    
    // Find feedback by time range
    List<Feedback> findByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Find feedback by user and status
    List<Feedback> findByUserAndStatus(User user, String status);
    
    // Find all feedback with pagination
    Page<Feedback> findAll(Pageable pageable);
    
    // Find feedback by status with pagination
    Page<Feedback> findByStatus(String status, Pageable pageable);
    
    // Count by status
    long countByStatus(String status);
} 