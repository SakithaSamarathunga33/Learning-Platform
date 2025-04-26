package com.example.demo.service;

import com.example.demo.model.Message;
import com.example.demo.model.User;
import com.example.demo.dto.ConversationDTO;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface MessageService {
    
    /**
     * Retrieve all messages between two users
     */
    List<Message> getMessagesBetweenUsers(User user1, User user2);
    
    /**
     * Send a new message
     */
    Message sendMessage(User sender, User recipient, String content);
    
    /**
     * Mark all messages from sender to receiver as read
     */
    void markMessagesAsRead(User sender, User recipient);
    
    /**
     * Get conversations for a user
     */
    List<ConversationDTO> getConversationsForUser(UUID userId);
    
    /**
     * Count unread messages for a user
     */
    int countUnreadMessages(UUID userId);
    
    // Get all conversations for a user with their latest messages
    List<Map<String, Object>> getUserConversations(User user);
    
    // Get count of unread messages for a user
    int getUnreadMessageCount(User user);
    
    // Delete a message
    void deleteMessage(UUID messageId, User requestingUser);
} 