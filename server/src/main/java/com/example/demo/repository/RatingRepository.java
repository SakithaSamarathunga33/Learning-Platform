package com.example.demo.repository;

import com.example.demo.model.Rating;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface RatingRepository extends MongoRepository<Rating, String> {
    List<Rating> findByCourseId(String courseId);
    Optional<Rating> findByCourseIdAndUserId(String courseId, String userId);
}
