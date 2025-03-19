package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.bson.Document;

@Configuration
public class MongoConfig {
    private static final Logger logger = LoggerFactory.getLogger(MongoConfig.class);
    private final MongoTemplate mongoTemplate;

    public MongoConfig(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    @EventListener(ApplicationReadyEvent.class)
    public void logConnectionStatus() {
        try {
            Document pingCommand = new Document("ping", 1);
            mongoTemplate.getDb().runCommand(pingCommand);
            String dbName = mongoTemplate.getDb().getName();
            logger.info("MongoDB connected successfully to database: " + dbName);
        } catch (Exception e) {
            logger.error("MongoDB connection failed");
        }
    }
}
