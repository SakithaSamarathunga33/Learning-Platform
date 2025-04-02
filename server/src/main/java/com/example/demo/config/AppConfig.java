package com.example.demo.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class AppConfig {
    
    @Value("${app.frontend.url:http://localhost:3030}")
    private String frontendUrl;
    
    @Value("${app.oauth2.google.prompt:select_account}")
    private String googlePrompt;

    @Value("${app.oauth2.google.access-type:offline}")
    private String googleAccessType;
    
    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
    
    public String getFrontendUrl() {
        return frontendUrl;
    }
    
    public String getGooglePrompt() {
        return googlePrompt;
    }
    
    public String getGoogleAccessType() {
        return googleAccessType;
    }
} 