package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Component;

@Component
public class StartupListener {
    
    @Autowired
    private MongoTemplate mongoTemplate;
    
    @EventListener(ApplicationStartedEvent.class)
    public void onApplicationStarted() {
        System.out.print("\033[H\033[2J");  // Clear screen
        System.out.flush();
        
        System.out.println("\n\033[32m✨ Server is ready!\033[0m");
        System.out.println("\033[32m📡 Tomcat started on port 8080\033[0m");
        
        try {
            // Test MongoDB connection
            mongoTemplate.getDb().runCommand(new org.bson.Document("ping", 1));
            System.out.println("\033[32m🍃 MongoDB connected successfully\033[0m\n");
        } catch (Exception e) {
            System.out.println("\033[31m❌ MongoDB connection failed: " + e.getMessage() + "\033[0m\n");
        }
    }
}
