package com.example.demo.repository;

import com.example.demo.model.Task;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TaskRepository extends MongoRepository<Task, String> {
    List<Task> findByCourseId(String courseId);
    List<Task> findByCourseIdAndUserId(String courseId, String userId);
    List<Task> findByCourseIdAndUserIdIsNull(String courseId);
    List<Task> findByUserIdAndCompleted(String userId, boolean completed);
    long countByCourseIdAndUserIdAndCompleted(String courseId, String userId, boolean completed);
    long countByCourseIdAndUserId(String courseId, String userId);
}
