package com.example.demo.model;

import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.datatype.jsr310.ser.LocalDateTimeSerializer;
import java.time.LocalDateTime;

@Data
@Document(collection = "comments")
public class Comment {

    @Id
    private String id;

    private String text;

    // Store user details directly instead of using @DBRef which can cause issues
    private User user;
    
    private String achievementId; // Store the ID of the achievement this comment belongs to

    @CreatedDate
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
    @JsonSerialize(using = LocalDateTimeSerializer.class)
    private LocalDateTime createdAt;

    // Custom toString to help with debugging
    @Override
    public String toString() {
        return "Comment{" +
               "id='" + id + '\'' +
               ", text='" + text + '\'' +
               ", userId='" + (user != null ? user.getId() : "null") + '\'' +
               ", achievementId='" + achievementId + '\'' +
               ", createdAt=" + createdAt +
               '}';
    }
} 