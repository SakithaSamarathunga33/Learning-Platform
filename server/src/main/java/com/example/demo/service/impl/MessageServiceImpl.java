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
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.core.query.Update;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class MessageServiceImpl implements MessageService {

    private final MessageRepository messageRepository;
    private final UserRepository userRepository;
    private final MongoTemplate mongoTemplate;

    @Autowired
    public MessageServiceImpl(MessageRepository messageRepository, UserRepository userRepository, MongoTemplate mongoTemplate) {
        this.messageRepository = messageRepository;
        this.userRepository = userRepository;
        this.mongoTemplate = mongoTemplate;
    }

    @Override
    public Message sendMessage(User sender, User recipient, String content) {
        Message message = new Message();
        message.setSender(sender);
        message.setRecipient(recipient);
        message.setContent(content);
        message.setTimestamp(LocalDateTime.now());
        message.setRead(false);
        message.initialize(); // Initialize the new message
        
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
    public void markMessagesAsRead(User sender, User recipient) {
        Query query = new Query(Criteria.where("senderId").is(sender.getId())
                .and("recipientId").is(recipient.getId())
                .and("read").is(false));
        
        Update update = new Update().set("read", true);
        
        mongoTemplate.updateMulti(query, update, Message.class);
    }
    
    @Override
    public List<ConversationDTO> getConversationsForUser(UUID userId) {
        // Find the MongoDB user by UUID string
        User user = userRepository.findById(userId.toString())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
                
        // Get all conversations for the user
        List<Message> conversations = messageRepository.findConversationsByUserId(user.getId());
        
        // Extract unique partner IDs
        Set<String> partnerIds = new HashSet<>();
        for (Message message : conversations) {
            if (message.getSenderId().equals(user.getId())) {
                partnerIds.add(message.getRecipientId());
            } else {
                partnerIds.add(message.getSenderId());
            }
        }
        
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
        // Get all messages where the user is either sender or recipient
        Query query = new Query();
        query.addCriteria(new Criteria().orOperator(
            Criteria.where("senderId").is(user.getId()),
            Criteria.where("recipientId").is(user.getId())
        ));
        
        List<Message> allMessages = mongoTemplate.find(query, Message.class);
        
        // Find distinct conversation partner IDs
        Set<String> partnerIds = new HashSet<>();
        for (Message message : allMessages) {
            if (message.getSenderId().equals(user.getId())) {
                partnerIds.add(message.getRecipientId());
            } else {
                partnerIds.add(message.getSenderId());
            }
        }
        
        // Get conversation details for each partner
        return partnerIds.stream()
            .map(partnerId -> {
                User partner = userRepository.findById(partnerId)
                    .orElse(null); // Skip if user no longer exists
                
                if (partner == null) return null;
                
                // Find the latest message between user and partner
                Query latestQuery = new Query();
                latestQuery.addCriteria(
                    new Criteria().orOperator(
                        Criteria.where("senderId").is(user.getId()).and("recipientId").is(partnerId),
                        Criteria.where("senderId").is(partnerId).and("recipientId").is(user.getId())
                    )
                );
                latestQuery.with(Sort.by(Sort.Direction.DESC, "timestamp"));
                latestQuery.limit(1);
                
                Message latestMessage = mongoTemplate.findOne(latestQuery, Message.class);
                
                // Set the user references in the message
                if (latestMessage != null) {
                    loadUserReferences(latestMessage);
                }
                
                // Count unread messages
                Query unreadQuery = new Query();
                unreadQuery.addCriteria(
                    Criteria.where("senderId").is(partnerId)
                        .and("recipientId").is(user.getId())
                        .and("read").is(false)
                );
                
                int unreadCount = (int) mongoTemplate.count(unreadQuery, Message.class);
                
                Map<String, Object> conversation = new HashMap<>();
                conversation.put("user", partner);
                conversation.put("lastMessage", latestMessage);
                conversation.put("unreadCount", unreadCount);
                
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
    public void deleteMessage(UUID messageId, User requestingUser) {
        Optional<Message> messageOpt = messageRepository.findById(messageId.toString());
        if (!messageOpt.isPresent()) {
            throw new ResourceNotFoundException("Message not found");
        }
        
        Message message = messageOpt.get();
        
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