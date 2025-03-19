package com.example.demo.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.context.event.ApplicationStartedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class ServerStartupListener {
    
    private static final Logger logger = LoggerFactory.getLogger(ServerStartupListener.class);
    
    @Value("${server.port}")
    private String serverPort;
    
    @EventListener(ApplicationStartedEvent.class)
    public void onApplicationStarted() {
        logger.info("[+] Server started on port: " + serverPort);
    }
} 