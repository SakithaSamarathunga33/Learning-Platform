package com.example.demo.service;

import com.example.demo.model.Course;
import com.example.demo.model.Rating;
import com.example.demo.model.User;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.RatingRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RatingService {

    @Autowired private RatingRepository ratingRepo;
    @Autowired private CourseRepository courseRepo;
    @Autowired private UserRepository userRepo;

    /** Add or update a user’s rating and recalculate aggregates */
    public Rating rateCourse(String courseId, String userId, int stars) {
        User user = userRepo.findById(userId).orElseThrow();
        Course course = courseRepo.findById(courseId).orElseThrow();

        // upsert rating
        Rating rating = ratingRepo.findByCourseIdAndUserId(courseId, userId)
                .orElseGet(() -> {
                    Rating r = new Rating();
                    r.setCourseId(courseId);
                    r.setUser(user);
                    return r;
                });
        rating.setStars(stars);
        rating = ratingRepo.save(rating);

        // recalculate aggregates
        List<Rating> all = ratingRepo.findByCourseId(courseId);
        int count = all.size();
        double avg = all.stream().mapToInt(Rating::getStars).average().orElse(0.0);
        course.setRatingCount(count);
        course.setAverageRating(avg);
        courseRepo.save(course);

        return rating;
    }

    public List<Rating> getCourseRatings(String courseId) {
        return ratingRepo.findByCourseId(courseId);
    }
}
