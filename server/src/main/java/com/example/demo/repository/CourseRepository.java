package com.example.demo.repository;

import com.example.demo.model.Course;
import com.example.demo.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface CourseRepository extends MongoRepository<Course, String> {
    List<Course> findByInstructor(User instructor);
    List<Course> findByCategory(String category);
    List<Course> findByIsPublished(boolean isPublished);
    List<Course> findByTitleContainingIgnoreCase(String title);
} 