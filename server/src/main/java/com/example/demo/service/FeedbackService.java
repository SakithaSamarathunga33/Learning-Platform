package com.example.demo.service;

import com.example.demo.dto.FeedbackDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Course;
import com.example.demo.model.Feedback;
import com.example.demo.model.User;
import com.example.demo.repository.CourseRepository;
import com.example.demo.repository.FeedbackRepository;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class FeedbackService {

    @Autowired
    private FeedbackRepository feedbackRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CourseRepository courseRepository;

    // Create new feedback
    public FeedbackDTO createFeedback(FeedbackDTO feedbackDTO) {
        Feedback feedback = new Feedback();
        feedback.setTitle(feedbackDTO.getTitle());
        feedback.setDescription(feedbackDTO.getDescription());
        feedback.setType(feedbackDTO.getType());
        feedback.setRating(feedbackDTO.getRating());
        feedback.setStatus("PENDING");
        feedback.setCreatedAt(LocalDateTime.now());
        feedback.setUpdatedAt(LocalDateTime.now());

        // Set user if provided
        if (feedbackDTO.getUserId() != null) {
            User user = userRepository.findById(feedbackDTO.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + feedbackDTO.getUserId()));
            feedback.setUser(user);
        }

        // Set course if provided
        if (feedbackDTO.getCourseId() != null) {
            Course course = courseRepository.findById(feedbackDTO.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + feedbackDTO.getCourseId()));
            feedback.setCourse(course);
        }

        feedback = feedbackRepository.save(feedback);
        return new FeedbackDTO(feedback);
    }

    // Get all feedback with pagination
    public Page<FeedbackDTO> getAllFeedback(Pageable pageable) {
        Page<Feedback> feedbackPage = feedbackRepository.findAll(pageable);
        return feedbackPage.map(FeedbackDTO::new);
    }

    // Get feedback by ID
    public FeedbackDTO getFeedbackById(String id) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));
        return new FeedbackDTO(feedback);
    }

    // Get feedback by user
    public List<FeedbackDTO> getFeedbackByUser(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        List<Feedback> feedbackList = feedbackRepository.findByUser(user);
        return feedbackList.stream().map(FeedbackDTO::new).collect(Collectors.toList());
    }

    // Get feedback by status
    public Page<FeedbackDTO> getFeedbackByStatus(String status, Pageable pageable) {
        Page<Feedback> feedbackPage = feedbackRepository.findByStatus(status, pageable);
        return feedbackPage.map(FeedbackDTO::new);
    }

    // Update feedback
    public FeedbackDTO updateFeedback(String id, FeedbackDTO feedbackDTO) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));

        // Update fields if provided
        Optional.ofNullable(feedbackDTO.getTitle()).ifPresent(feedback::setTitle);
        Optional.ofNullable(feedbackDTO.getDescription()).ifPresent(feedback::setDescription);
        Optional.ofNullable(feedbackDTO.getType()).ifPresent(feedback::setType);
        Optional.ofNullable(feedbackDTO.getRating()).ifPresent(feedback::setRating);
        Optional.ofNullable(feedbackDTO.getStatus()).ifPresent(feedback::setStatus);
        Optional.ofNullable(feedbackDTO.getAdminResponse()).ifPresent(feedback::setAdminResponse);

        feedback.setUpdatedAt(LocalDateTime.now());

        // Update course if provided
        if (feedbackDTO.getCourseId() != null) {
            Course course = courseRepository.findById(feedbackDTO.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + feedbackDTO.getCourseId()));
            feedback.setCourse(course);
        }

        feedback = feedbackRepository.save(feedback);
        return new FeedbackDTO(feedback);
    }

    // Update feedback status
    public FeedbackDTO updateFeedbackStatus(String id, String status, String adminResponse) {
        Feedback feedback = feedbackRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Feedback not found with id: " + id));

        feedback.setStatus(status);
        feedback.setAdminResponse(adminResponse);
        feedback.setUpdatedAt(LocalDateTime.now());

        feedback = feedbackRepository.save(feedback);
        return new FeedbackDTO(feedback);
    }

    // Delete feedback
    public void deleteFeedback(String id) {
        if (!feedbackRepository.existsById(id)) {
            throw new ResourceNotFoundException("Feedback not found with id: " + id);
        }
        feedbackRepository.deleteById(id);
    }

    // Get feedback statistics
    public FeedbackStats getFeedbackStats() {
        FeedbackStats stats = new FeedbackStats();
        stats.setTotalFeedback(feedbackRepository.count());
        stats.setPendingFeedback(feedbackRepository.countByStatus("PENDING"));
        stats.setReviewedFeedback(feedbackRepository.countByStatus("REVIEWED"));
        stats.setResolvedFeedback(feedbackRepository.countByStatus("RESOLVED"));
        stats.setRejectedFeedback(feedbackRepository.countByStatus("REJECTED"));
        return stats;
    }

    // Stats class for feedback analytics
    public static class FeedbackStats {
        private long totalFeedback;
        private long pendingFeedback;
        private long reviewedFeedback;
        private long resolvedFeedback;
        private long rejectedFeedback;

        public long getTotalFeedback() {
            return totalFeedback;
        }

        public void setTotalFeedback(long totalFeedback) {
            this.totalFeedback = totalFeedback;
        }

        public long getPendingFeedback() {
            return pendingFeedback;
        }

        public void setPendingFeedback(long pendingFeedback) {
            this.pendingFeedback = pendingFeedback;
        }

        public long getReviewedFeedback() {
            return reviewedFeedback;
        }

        public void setReviewedFeedback(long reviewedFeedback) {
            this.reviewedFeedback = reviewedFeedback;
        }

        public long getResolvedFeedback() {
            return resolvedFeedback;
        }

        public void setResolvedFeedback(long resolvedFeedback) {
            this.resolvedFeedback = resolvedFeedback;
        }

        public long getRejectedFeedback() {
            return rejectedFeedback;
        }

        public void setRejectedFeedback(long rejectedFeedback) {
            this.rejectedFeedback = rejectedFeedback;
        }
    }
} 