package com.example.demo.service.impl;

import com.example.demo.dto.ConversationDTO;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.model.Message;
import com.example.demo.model.User;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.MessageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Autowired
    public MessageServiceImpl(MessageRepository messageRepository, UserRepository userRepository) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
    }

    @Override
    public Message sendMessage(User sender, User recipient, String content) {
        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        
        return messageRepository.save(message);
    }

    @Override
    public List<Message> getMessagesBetweenUsers(User user1, User user2) {
        List<Message> messages = messageRepository.findMessagesBetweenUserIds(user1.getId(), user2.getId());
        
        // Load the User objects into the messages
        messages.forEach(message -> {
            loadUserReferences(message);
        });
        
        return messages;
    }

    @Override
    @Transactional
    public void markMessagesAsRead(User sender, User recipient) {
        messageRepository.markMessagesAsReadByUserIds(sender.getId(), recipient.getId());
    }
    
    @Override
    public List<ConversationDTO> getConversationsForUser(UUID userId) {
        // Find the MongoDB user by UUID string
        User user = userRepository.findById(userId.toString())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        List<String> partnerIds = messageRepository.findConversationPartnerIds(user.getId());
        
        return partnerIds.stream()
            .map(partnerId -> {
                User partner = userRepository.findById(partnerId)
                    .orElse(null); // Skip if user no longer exists
                
                if (partner == null) return null;
                
                Message latestMessage = messageRepository.findLatestMessageBetweenUserIds(user.getId(), partner.getId());
                int unreadCount = messageRepository.countUnreadMessagesBySenderIdAndRecipientId(partner.getId(), user.getId());
                
                return ConversationDTO.fromUserAndMessage(
                    partner, 
                    latestMessage, 
                    unreadCount > 0, 
                    unreadCount
                );
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }
    
    @Override
    public int countUnreadMessages(UUID userId) {
        // Convert UUID to String for MongoDB
        return messageRepository.countUnreadMessagesByRecipientId(userId.toString());
    }

    @Override
    public List<Map<String, Object>> getUserConversations(User user) {
        List<String> partnerIds = messageRepository.findConversationPartnerIds(user.getId());
        
        return partnerIds.stream()
            .map(partnerId -> {
                User partner = userRepository.findById(partnerId)
                    .orElse(null); // Skip if user no longer exists
                
                if (partner == null) return null;
                
                Map<String, Object> conversation = new HashMap<>();
                Message latestMessage = messageRepository.findLatestMessageBetweenUserIds(user.getId(), partner.getId());
                
                // Set the user references in the message
                if (latestMessage != null) {
                    loadUserReferences(latestMessage);
                }
                
                conversation.put("user", partner);
                conversation.put("lastMessage", latestMessage);
                conversation.put("unreadCount", messageRepository.countUnreadMessagesBySenderIdAndRecipientId(partner.getId(), user.getId()));
                
                return conversation;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    @Override
    public int getUnreadMessageCount(User user) {
        return messageRepository.countUnreadMessagesByRecipientId(user.getId());
    }

    @Override
    @Transactional
    public void deleteMessage(UUID messageId, User requestingUser) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message not found"));
        
        // Load the user references to ensure the sender check works properly
        loadUserReferences(message);
        
        // Only the sender can delete their message
        if (!message.getSenderId().equals(requestingUser.getId())) {
            throw new UnauthorizedException("You can only delete your own messages");
        }
        
        messageRepository.delete(message);
    }
    
    /**
     * Helper method to load User references from senderId and recipientId
     */
    private void loadUserReferences(Message message) {
        if (message.getSenderId() != null && (message.getSender() == null || !message.getSenderId().equals(message.getSender().getId()))) {
            userRepository.findById(message.getSenderId()).ifPresent(message::setSender);
        }
        
        if (message.getRecipientId() != null && (message.getRecipient() == null || !message.getRecipientId().equals(message.getRecipient().getId()))) {
            userRepository.findById(message.getRecipientId()).ifPresent(message::setRecipient);
        }
    }
} 