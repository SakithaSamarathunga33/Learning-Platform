package com.example.demo.service;

import com.example.demo.model.Course;
import com.example.demo.model.User;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class CourseService {

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    public List<Course> getAllCourses() {
        return courseRepository.findAll();
    }

    public Course getCourseById(String id) {
        return courseRepository.findById(id).orElse(null);
    }

    public Course createCourse(Course course, String instructorId) {
        // If instructorId is null, use the currently authenticated user
        if (instructorId == null || instructorId.isEmpty()) {
            // Set default values for the course
            course.setCreatedAt(LocalDateTime.now());
            course.setUpdatedAt(LocalDateTime.now());
            return courseRepository.save(course);
        }
        
        Optional<User> instructor = userRepository.findById(instructorId);
        if (instructor.isPresent()) {
            course.setInstructor(instructor.get());
            course.setCreatedAt(LocalDateTime.now());
            course.setUpdatedAt(LocalDateTime.now());
            return courseRepository.save(course);
        }
        return null;
    }

    public Course updateCourse(String id, Course courseDetails) {
        Optional<Course> course = courseRepository.findById(id);
        if (course.isPresent()) {
            Course existingCourse = course.get();
            
            existingCourse.setTitle(courseDetails.getTitle());
            existingCourse.setDescription(courseDetails.getDescription());
            existingCourse.setThumbnailUrl(courseDetails.getThumbnailUrl());
            existingCourse.setPrice(courseDetails.getPrice());
            existingCourse.setCategory(courseDetails.getCategory());
            existingCourse.setTags(courseDetails.getTags());
            existingCourse.setPublished(courseDetails.isPublished());
            existingCourse.setUpdatedAt(LocalDateTime.now());

            return courseRepository.save(existingCourse);
        }
        return null;
    }

    public boolean deleteCourse(String id) {
        if (courseRepository.existsById(id)) {
            courseRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public List<Course> getCoursesByInstructor(String instructorId) {
        Optional<User> instructor = userRepository.findById(instructorId);
        return instructor.map(user -> courseRepository.findByInstructor(user))
                        .orElse(List.of());
    }

    public List<Course> getCoursesByCategory(String category) {
        return courseRepository.findByCategory(category);
    }

    public List<Course> getPublishedCourses() {
        return courseRepository.findByIsPublished(true);
    }

    public List<Course> searchCourses(String title) {
        return courseRepository.findByTitleContainingIgnoreCase(title);
    }
} 