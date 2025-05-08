package com.example.demo.dto;

import com.example.demo.model.Feedback;
import java.time.LocalDateTime;

public class FeedbackDTO {
    private String id;
    private String title;
    private String description;
    private String type;
    private Integer rating;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String status;
    private String adminResponse;
    private String userId;
    private String userName;
    private String userEmail;
    private String courseId;
    private String courseName;
    
    // Default constructor
    public FeedbackDTO() {
    }
    
    // Constructor from Feedback entity
    public FeedbackDTO(Feedback feedback) {
        this.id = feedback.getId();
        this.title = feedback.getTitle();
        this.description = feedback.getDescription();
        this.type = feedback.getType();
        this.rating = feedback.getRating();
        this.createdAt = feedback.getCreatedAt();
        this.updatedAt = feedback.getUpdatedAt();
        this.status = feedback.getStatus();
        this.adminResponse = feedback.getAdminResponse();
        
        if (feedback.getUser() != null) {
            this.userId = feedback.getUser().getId();
            this.userName = feedback.getUser().getName();
            this.userEmail = feedback.getUser().getEmail();
        }
        
        if (feedback.getCourse() != null) {
            this.courseId = feedback.getCourse().getId();
            this.courseName = feedback.getCourse().getTitle();
        }
    }
    
    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Integer getRating() {
        return rating;
    }

    public void setRating(Integer rating) {
        this.rating = rating;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAdminResponse() {
        return adminResponse;
    }

    public void setAdminResponse(String adminResponse) {
        this.adminResponse = adminResponse;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getUserName() {
        return userName;
    }

    public void setUserName(String userName) {
        this.userName = userName;
    }

    public String getUserEmail() {
        return userEmail;
    }

    public void setUserEmail(String userEmail) {
        this.userEmail = userEmail;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getCourseName() {
        return courseName;
    }

    public void setCourseName(String courseName) {
        this.courseName = courseName;
    }
} 