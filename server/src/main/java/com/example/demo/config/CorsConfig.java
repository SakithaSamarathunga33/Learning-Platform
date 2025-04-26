package com.example.demo.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import java.util.Arrays;

@Configuration
public class CorsConfig {

    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Allow frontend origins and OAuth providers
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000",
            "http://localhost:3030",
            "http://localhost:3001", // Add additional local development ports
            "http://localhost:8080",
            "https://accounts.google.com"
        ));
        
        // Allow all HTTP methods
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"
        ));
        
        // Allow all headers
        config.addAllowedHeader("*");
        config.addAllowedHeader("Authorization");
        config.addAllowedHeader("Content-Type");
        config.addAllowedHeader("X-Admin-Access");
        
        // Expose headers to the frontend
        config.addExposedHeader("*");
        
        // Allow credentials
        config.setAllowCredentials(true);
        
        // Max age
        config.setMaxAge(3600L);
        
        // Apply to all endpoints
        source.registerCorsConfiguration("/**", config);
        
        return new CorsFilter(source);
    }
}
