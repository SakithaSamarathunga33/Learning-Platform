package com.example.demo.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Message {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;
    
    // Store sender ID as string to be compatible with MongoDB User ID
    @Column(name = "sender_id", nullable = false)
    private String senderId;
    
    // Store recipient ID as string to be compatible with MongoDB User ID
    @Column(name = "recipient_id", nullable = false)
    private String recipientId;
    
    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;
    
    @Column(nullable = false)
    private LocalDateTime timestamp;
    
    @Column(nullable = false)
    private boolean read;
    
    // Transient fields for User objects - not stored in DB
    @Transient
    private User sender;
    
    @Transient
    private User recipient;

    @PrePersist
    public void prePersist() {
        if (timestamp == null) {
            timestamp = LocalDateTime.now();
        }
        if (id == null) {
            id = UUID.randomUUID();
        }
        
        // Make sure senderId and recipientId are set from User objects if provided
        if (sender != null && (senderId == null || senderId.isEmpty())) {
            senderId = sender.getId();
        }
        
        if (recipient != null && (recipientId == null || recipientId.isEmpty())) {
            recipientId = recipient.getId();
        }
    }
    
    // Helper methods to get/set User objects while maintaining the ID strings
    public User getSender() {
        return sender;
    }
    
    public void setSender(User sender) {
        this.sender = sender;
        if (sender != null) {
            this.senderId = sender.getId();
        }
    }
    
    public User getRecipient() {
        return recipient;
    }
    
    public void setRecipient(User recipient) {
        this.recipient = recipient;
        if (recipient != null) {
            this.recipientId = recipient.getId();
        }
    }
} 