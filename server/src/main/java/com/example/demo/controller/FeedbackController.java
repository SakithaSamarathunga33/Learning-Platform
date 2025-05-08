package com.example.demo.controller;

import com.example.demo.dto.FeedbackDTO;
import com.example.demo.model.User;
import com.example.demo.service.FeedbackService;
import com.example.demo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/feedback")
public class FeedbackController {

    @Autowired
    private FeedbackService feedbackService;

    @Autowired
    private UserService userService;

    // Create a new feedback
    @PostMapping
    public ResponseEntity<FeedbackDTO> createFeedback(@RequestBody FeedbackDTO feedbackDTO) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        
        feedbackDTO.setUserId(user.getId());
        FeedbackDTO createdFeedback = feedbackService.createFeedback(feedbackDTO);
        return new ResponseEntity<>(createdFeedback, HttpStatus.CREATED);
    }

    // Get all feedback with pagination (admin only)
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<FeedbackDTO>> getAllFeedback(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction) {
        
        Sort.Direction sortDirection = direction.equalsIgnoreCase("asc") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortDirection, sortBy));
        
        Page<FeedbackDTO> feedbackPage = feedbackService.getAllFeedback(pageable);
        return ResponseEntity.ok(feedbackPage);
    }

    // Get feedback by ID
    @GetMapping("/{id}")
    public ResponseEntity<FeedbackDTO> getFeedbackById(@PathVariable String id) {
        FeedbackDTO feedbackDTO = feedbackService.getFeedbackById(id);
        return ResponseEntity.ok(feedbackDTO);
    }

    // Get feedback by current user
    @GetMapping("/my-feedback")
    public ResponseEntity<List<FeedbackDTO>> getMyFeedback() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        
        List<FeedbackDTO> feedbackList = feedbackService.getFeedbackByUser(user.getId());
        return ResponseEntity.ok(feedbackList);
    }

    // Get feedback by status (admin only)
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<FeedbackDTO>> getFeedbackByStatus(
            @PathVariable String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        Pageable pageable = PageRequest.of(page, size);
        Page<FeedbackDTO> feedbackPage = feedbackService.getFeedbackByStatus(status, pageable);
        return ResponseEntity.ok(feedbackPage);
    }

    // Update feedback (admin or owner)
    @PutMapping("/{id}")
    public ResponseEntity<FeedbackDTO> updateFeedback(
            @PathVariable String id,
            @RequestBody FeedbackDTO feedbackDTO) {
        
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        User user = userService.findByUsername(username);
        
        // Get the current feedback
        FeedbackDTO currentFeedback = feedbackService.getFeedbackById(id);
        
        // Check if current user is admin or the owner of the feedback
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        boolean isOwner = currentFeedback.getUserId().equals(user.getId());
        
        if (!isAdmin && !isOwner) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        FeedbackDTO updatedFeedback = feedbackService.updateFeedback(id, feedbackDTO);
        return ResponseEntity.ok(updatedFeedback);
    }

    // Update feedback status (admin only)
    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackDTO> updateFeedbackStatus(
            @PathVariable String id,
            @RequestBody Map<String, String> statusUpdate) {
        
        String status = statusUpdate.get("status");
        String adminResponse = statusUpdate.get("adminResponse");
        
        if (status == null) {
            return ResponseEntity.badRequest().build();
        }
        
        FeedbackDTO updatedFeedback = feedbackService.updateFeedbackStatus(id, status, adminResponse);
        return ResponseEntity.ok(updatedFeedback);
    }

    // Delete feedback (admin only)
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteFeedback(@PathVariable String id) {
        feedbackService.deleteFeedback(id);
        return ResponseEntity.noContent().build();
    }

    // Get feedback statistics (admin only)
    @GetMapping("/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<FeedbackService.FeedbackStats> getFeedbackStats() {
        FeedbackService.FeedbackStats stats = feedbackService.getFeedbackStats();
        return ResponseEntity.ok(stats);
    }
} 