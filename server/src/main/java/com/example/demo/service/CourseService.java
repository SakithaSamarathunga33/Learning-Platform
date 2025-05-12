package com.example.demo.service;

import com.example.demo.model.Course;
import com.example.demo.model.Task;
import com.example.demo.model.User;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.TaskRepository;
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

    @Autowired
    private TaskRepository taskRepository;

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
            Course savedCourse = courseRepository.save(course);

            // Save tasks if they exist
            if (course.getTasks() != null && !course.getTasks().isEmpty()) {
                saveTasks(savedCourse.getId(), course.getTasks());
            }

            return savedCourse;
        }

        Optional<User> instructor = userRepository.findById(instructorId);
        if (instructor.isPresent()) {
            course.setInstructor(instructor.get());
            course.setCreatedAt(LocalDateTime.now());
            course.setUpdatedAt(LocalDateTime.now());
            Course savedCourse = courseRepository.save(course);

            // Save tasks if they exist
            if (course.getTasks() != null && !course.getTasks().isEmpty()) {
                saveTasks(savedCourse.getId(), course.getTasks());
            }

            return savedCourse;
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

            Course savedCourse = courseRepository.save(existingCourse);

            // Update tasks if they exist
            if (courseDetails.getTasks() != null && !courseDetails.getTasks().isEmpty()) {
                // First, delete existing tasks for this course (template tasks only, not user-specific tasks)
                List<Task> existingTasks = taskRepository.findByCourseIdAndUserIdIsNull(id);
                for (Task task : existingTasks) {
                    taskRepository.deleteById(task.getId());
                }

                // Then save the new tasks
                saveTasks(savedCourse.getId(), courseDetails.getTasks());
            }

            return savedCourse;
        }
        return null;
    }

    public boolean deleteCourse(String id) {
        if (courseRepository.existsById(id)) {
            // Delete all tasks associated with this course
            List<Task> courseTasks = taskRepository.findByCourseId(id);
            for (Task task : courseTasks) {
                taskRepository.deleteById(task.getId());
            }

            // Delete the course
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

    // Helper method to save tasks for a course
    private void saveTasks(String courseId, List<Task> tasks) {
        int orderIndex = 0;
        for (Task task : tasks) {
            task.setCourseId(courseId);
            task.setUserId(null); // This is a course template task, not user-specific
            task.setOrderIndex(orderIndex++);
            taskRepository.save(task);
        }
    }

    // Get course with its tasks
    public Course getCourseWithTasks(String id) {
        Optional<Course> courseOpt = courseRepository.findById(id);
        if (courseOpt.isPresent()) {
            Course course = courseOpt.get();
            List<Task> tasks = taskRepository.findByCourseIdAndUserIdIsNull(id);
            course.setTasks(tasks);
            return course;
        }
        return null;
    }
}