package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.DBRef;
import java.time.LocalDateTime;

@Document(collection = "ratings")
public class Rating {
    @Id
    private String id;

    @DBRef
    private User user;

    private String courseId;        // reference by ID
    private int stars;              // 1–5
    private LocalDateTime ratedAt;

    public Rating() {
        this.ratedAt = LocalDateTime.now();
    }

    public String getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public String getCourseId() {
        return courseId;
    }

    public int getStars() {
        return stars;
    }

    public LocalDateTime getRatedAt() {
        return ratedAt;
    }

    public void setId(String id) {
        this.id = id;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setCourseId(String courseId) {
        this.courseId = courseId;
    }

    public void setStars(int stars) {
        this.stars = stars;
    }

    public void setRatedAt(LocalDateTime ratedAt) {
        this.ratedAt = ratedAt;
    }
}
