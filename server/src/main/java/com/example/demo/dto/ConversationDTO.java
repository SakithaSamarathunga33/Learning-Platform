package com.example.demo.dto;

import com.example.demo.model.Message;
import com.example.demo.model.User;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConversationDTO {
    private String userId;
    private String username;
    private String fullName;
    private String profilePicture;
    private String lastMessage;
    private LocalDateTime lastMessageTime;
    private boolean unread;
    private int unreadCount;
    
    public static ConversationDTO fromUserAndMessage(User user, Message lastMessage, boolean unread, int unreadCount) {
        ConversationDTO dto = new ConversationDTO();
        dto.setUserId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getName());
        dto.setProfilePicture(user.getPicture());
        
        if (lastMessage != null) {
            dto.setLastMessage(lastMessage.getContent());
            dto.setLastMessageTime(lastMessage.getTimestamp());
        }
        
        dto.setUnread(unread);
        dto.setUnreadCount(unreadCount);
        
        return dto;
    }
} 