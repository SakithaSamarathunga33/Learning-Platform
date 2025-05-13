package com.example.demo.controller;

import com.example.demo.model.Message;
import com.example.demo.model.User;
import com.example.demo.service.MessageService;
import com.example.demo.service.UserService;
import com.example.demo.util.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = "*", allowedHeaders = "*")
public class MessageController {

    private final MessageService messageService;
    private final UserService userService;
    private final AuthUtil authUtil;

    @Autowired
    public MessageController(MessageService messageService, UserService userService, AuthUtil authUtil) {
        this.messageService = messageService;
        this.userService = userService;
        this.authUtil = authUtil;
    }

    @PostMapping("/send/{recipientUsername}")
    public ResponseEntity<?> sendMessage(
            @PathVariable String recipientUsername,
            @RequestBody Map<String, String> messageRequest
    ) {
        User sender = authUtil.getCurrentUser();
        User recipient = userService.findUserByUsername(recipientUsername);
        
        Message message = messageService.sendMessage(
                sender,
                recipient,
                messageRequest.get("content")
        );
        
        return ResponseEntity.status(HttpStatus.CREATED).body(message);
    }

    @GetMapping("/conversation/{username}")
    public ResponseEntity<List<Message>> getConversation(@PathVariable String username) {
        User currentUser = authUtil.getCurrentUser();
        User otherUser = userService.findUserByUsername(username);
        
        List<Message> messages = messageService.getMessagesBetweenUsers(currentUser, otherUser);
        
        // Mark messages from the other user to the current user as read
        messageService.markMessagesAsRead(otherUser, currentUser);
        
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/conversations")
    public ResponseEntity<List<Map<String, Object>>> getUserConversations() {
        User currentUser = authUtil.getCurrentUser();
        List<Map<String, Object>> conversations = messageService.getUserConversations(currentUser);
        return ResponseEntity.ok(conversations);
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Map<String, Integer>> getUnreadMessageCount() {
        User currentUser = authUtil.getCurrentUser();
        int count = messageService.getUnreadMessageCount(currentUser);
        return ResponseEntity.ok(Map.of("count", count));
    }

    @DeleteMapping("/{messageId}")
    public ResponseEntity<?> deleteMessage(@PathVariable UUID messageId) {
        User currentUser = authUtil.getCurrentUser();
        messageService.deleteMessage(messageId, currentUser);
        return ResponseEntity.ok().build();
    }
    
    // Debug endpoint to check message service configuration
    @GetMapping("/debug")
    public ResponseEntity<?> debug() {
        User currentUser = authUtil.getCurrentUser();
        return ResponseEntity.ok(Map.of(
            "currentUser", currentUser.getUsername(),
            "unreadCount", messageService.getUnreadMessageCount(currentUser),
            "serviceStatus", "ok"
        ));
    }
} 