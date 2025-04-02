package com.example.demo.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.bson.Document;
import org.springframework.data.mongodb.config.EnableMongoAuditing;

/**
 * MongoDB configuration to enable auditing features
 * This allows fields with @CreatedDate annotations to be automatically populated
 */
@Configuration
@EnableMongoAuditing
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
            
            // Log some extra details
            logger.info("[DB] MongoDB connected successfully to database: " + dbName);
            logger.info("[DB] MongoDB collections: " + mongoTemplate.getCollectionNames());
            
            // Ensure the comments collection exists
            if (!mongoTemplate.collectionExists("comments")) {
                logger.info("[DB] Creating comments collection");
                mongoTemplate.createCollection("comments");
            }
        } catch (Exception e) {
            logger.error("[!] MongoDB connection failed: " + e.getMessage(), e);
        }
    }
}
