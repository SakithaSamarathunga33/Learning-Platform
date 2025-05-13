package com.example.demo.repository;

import com.example.demo.model.Message;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends MongoRepository<Message, String> {
    
    /**
     * Find all messages between two users, ordered by timestamp
     */
    @Query("{ $or: [ { 'senderId': ?0, 'recipientId': ?1 }, { 'senderId': ?1, 'recipientId': ?0 } ] }")
    List<Message> findMessagesBetweenUserIds(String userId1, String userId2);
    
    /**
     * Find the latest message between two users
     */
    @Query(value = "{ $or: [ { 'senderId': ?0, 'recipientId': ?1 }, { 'senderId': ?1, 'recipientId': ?0 } ] }", sort = "{ 'timestamp': -1 }")
    Message findLatestMessageBetweenUserIds(String userId1, String userId2);
    
    /**
     * Find all unread messages for a user
     */
    List<Message> findByRecipientIdAndReadFalse(String recipientId);
    
    /**
     * Count unread messages for a user
     */
    @Query(value = "{ 'recipientId': ?0, 'read': false }", count = true)
    int countUnreadMessagesByRecipientId(String recipientId);
    
    /**
     * Mark all messages from a sender to a receiver as read
     */
    @Query(value = "{ 'senderId': ?0, 'recipientId': ?1, 'read': false }", fields = "{ 'read': true }")
    void markMessagesAsReadByUserIds(String senderId, String recipientId);
    
    /**
     * Find user IDs who have conversations with the given user
     */
    @Query(value = "{ $or: [ { 'senderId': ?0 }, { 'recipientId': ?0 } ] }", fields = "{ '_id': 0, 'senderId': 1, 'recipientId': 1 }")
    List<Message> findConversationsByUserId(String userId);
    
    /**
     * Count unread messages from a specific sender to a specific recipient
     */
    @Query(value = "{ 'senderId': ?0, 'recipientId': ?1, 'read': false }", count = true)
    int countUnreadMessagesBySenderIdAndRecipientId(String senderId, String recipientId);
} 