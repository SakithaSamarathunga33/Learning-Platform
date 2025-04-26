package com.example.demo.repository;

import com.example.demo.model.Message;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Repository
public interface MessageRepository extends JpaRepository<Message, UUID> {
    
    /**
     * Find all messages between two users, ordered by timestamp
     */
    @Query("SELECT m FROM Message m WHERE (m.senderId = :userId1 AND m.recipientId = :userId2) OR (m.senderId = :userId2 AND m.recipientId = :userId1) ORDER BY m.timestamp ASC")
    List<Message> findMessagesBetweenUserIds(@Param("userId1") String userId1, @Param("userId2") String userId2);
    
    /**
     * Find the latest message between two users
     */
    @Query("SELECT m FROM Message m WHERE (m.senderId = :userId1 AND m.recipientId = :userId2) OR (m.senderId = :userId2 AND m.recipientId = :userId1) ORDER BY m.timestamp DESC LIMIT 1")
    Message findLatestMessageBetweenUserIds(@Param("userId1") String userId1, @Param("userId2") String userId2);
    
    /**
     * Find all unread messages for a user
     */
    List<Message> findByRecipientIdAndReadFalse(String recipientId);
    
    /**
     * Count unread messages for a user
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.recipientId = :recipientId AND m.read = false")
    int countUnreadMessagesByRecipientId(@Param("recipientId") String recipientId);
    
    /**
     * Mark all messages from a sender to a receiver as read
     */
    @Modifying
    @Transactional
    @Query("UPDATE Message m SET m.read = true WHERE m.senderId = :senderId AND m.recipientId = :recipientId AND m.read = false")
    void markMessagesAsReadByUserIds(@Param("senderId") String senderId, @Param("recipientId") String recipientId);
    
    /**
     * Find user IDs who have conversations with the given user
     */
    @Query("SELECT DISTINCT CASE WHEN m.senderId = :userId THEN m.recipientId ELSE m.senderId END FROM Message m WHERE m.senderId = :userId OR m.recipientId = :userId")
    List<String> findConversationPartnerIds(@Param("userId") String userId);
    
    /**
     * Find the latest message between the user and each of their conversation partners
     */
    @Query(value = "SELECT DISTINCT ON (CASE WHEN m.sender_id = :userId THEN m.recipient_id ELSE m.sender_id END) * " +
           "FROM messages m " +
           "WHERE m.sender_id = :userId OR m.recipient_id = :userId " +
           "ORDER BY CASE WHEN m.sender_id = :userId THEN m.recipient_id ELSE m.sender_id END, m.timestamp DESC", nativeQuery = true)
    List<Message> findLatestMessagesForUserId(String userId);

    /**
     * Count unread messages from a specific sender to a specific recipient
     */
    @Query("SELECT COUNT(m) FROM Message m WHERE m.senderId = :senderId AND m.recipientId = :recipientId AND m.read = false")
    int countUnreadMessagesBySenderIdAndRecipientId(@Param("senderId") String senderId, @Param("recipientId") String recipientId);
} 