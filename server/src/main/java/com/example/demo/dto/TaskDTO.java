package com.example.demo.dto;

import java.time.LocalDateTime;

public class TaskDTO {
    private String id;
    private String title;
    private String description;
    private boolean completed;
    private String courseId;
    private String userId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private int orderIndex;
    private LocalDateTime dueDate;

    // Default constructor
    public TaskDTO() {
    }

    // Constructor with parameters
    public TaskDTO(String id, String title, String description, boolean completed, 
                  String courseId, String userId, LocalDateTime createdAt, 
                  LocalDateTime updatedAt, int orderIndex, LocalDateTime dueDate) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.completed = completed;
        this.courseId = courseId;
        this.userId = userId;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.orderIndex = orderIndex;
        this.dueDate = dueDate;
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

    public boolean isCompleted() {
        return completed;
    }

    public void setCompleted(boolean completed) {
        this.completed = completed;
    }

    public String getCourseId() {
        return courseId;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
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

    public int getOrderIndex() {
        return orderIndex;
    }

    public void setOrderIndex(int orderIndex) {
        this.orderIndex = orderIndex;
    }

    public LocalDateTime getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDateTime dueDate) {
        this.dueDate = dueDate;
    }
} 