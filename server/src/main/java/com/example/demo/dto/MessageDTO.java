package com.example.demo.dto;

import com.example.demo.model.Message;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MessageDTO {
    private String id;
    private String senderId;
    private String receiverId;
    private String content;
    private String timestamp;
    private boolean read;
    
    public static MessageDTO fromMessage(Message message) {
        return MessageDTO.builder()
                .id(message.getId().toString())
                .senderId(message.getSender().getId().toString())
                .receiverId(message.getRecipient().getId().toString())
                .content(message.getContent())
                .timestamp(message.getTimestamp().toString())
                .read(message.isRead())
                .build();
    }
} 