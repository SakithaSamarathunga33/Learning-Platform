package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.Map;
import java.util.HashMap;
import java.security.MessageDigest;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/cloudinary")
public class CloudinaryController {
    
    private static final Logger logger = LoggerFactory.getLogger(CloudinaryController.class);
    
    @Value("${cloudinary.api-secret}")
    private String apiSecret;
    
    @Value("${cloudinary.upload-preset}")
    private String uploadPreset;
    
    @GetMapping("/signature")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getSignature(Authentication authentication) {
        try {
            long timestamp = Instant.now().getEpochSecond();
            logger.debug("Generating signature for user: {} at timestamp: {}", 
                authentication.getName(), timestamp);
            
            // Parameters to sign
            Map<String, Object> params = new HashMap<>();
            params.put("timestamp", timestamp);
            params.put("upload_preset", uploadPreset);
            
            // Generate signature
            String signature = generateSignature(params);
            
            // Return response
            Map<String, String> response = new HashMap<>();
            response.put("signature", signature);
            response.put("timestamp", String.valueOf(timestamp));
            response.put("upload_preset", uploadPreset);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error generating signature: {}", e.getMessage());
            return ResponseEntity.internalServerError().body(Map.of("error", "Failed to generate signature"));
        }
    }
    
    private String generateSignature(Map<String, Object> params) throws Exception {
        // Sort parameters alphabetically
        StringBuilder stringToSign = new StringBuilder();
        params.entrySet().stream()
            .sorted(Map.Entry.comparingByKey())
            .forEach(entry -> {
                if (entry.getValue() != null) {
                    stringToSign.append(entry.getKey())
                        .append("=")
                        .append(entry.getValue())
                        .append("&");
                }
            });
            
        // Append API secret
        stringToSign.append(apiSecret);
        
        logger.debug("String to sign: {}", stringToSign);
        
        // Generate SHA-1 hash
        MessageDigest digest = MessageDigest.getInstance("SHA-1");
        byte[] hash = digest.digest(stringToSign.toString().getBytes(StandardCharsets.UTF_8));
        
        // Convert to hex
        StringBuilder hexString = new StringBuilder();
        for (byte b : hash) {
            String hex = Integer.toHexString(0xff & b);
            if (hex.length() == 1) hexString.append('0');
            hexString.append(hex);
        }
        
        return hexString.toString();
    }
}
