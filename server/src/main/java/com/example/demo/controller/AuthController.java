package com.example.demo.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.http.*;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtUtils;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.net.URI;
import java.util.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3030")
public class AuthController {

    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    @Value("${GOOGLE_CLIENT_ID}")
    private String googleClientId;

    @Value("${GOOGLE_CLIENT_SECRET}")
    private String googleClientSecret;

    @Value("${app.oauth2.redirectUri}")
    private String redirectUri;

    @Value("${app.frontend.url}")
    private String frontendUrl;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtils jwtUtils;

    @Autowired
    private RestTemplate restTemplate;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@RequestBody Map<String, String> credentials) {
        String username = credentials.get("username");
        String password = credentials.get("password");

        logger.info("Login attempt for user: {}", username);

        try {
            Optional<User> userOptional = userRepository.findByUsername(username);
            if (!userOptional.isPresent()) {
                logger.error("User not found: {}", username);
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "User not found"));
            }

            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(username, password)
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            String jwt = jwtUtils.generateJwtToken(authentication);

            User user = userOptional.get();
            Map<String, Object> response = new HashMap<>();
            response.put("token", jwt);
            response.put("user", Map.of(
                "id", user.getId(),
                "username", user.getUsername(),
                "email", user.getEmail(),
                "roles", user.getRoles()
            ));

            logger.info("Login successful for user: {} with roles: {}", username, user.getRoles());
            return ResponseEntity.ok(response);

        } catch (BadCredentialsException e) {
            logger.error("Invalid credentials for user: {}", username);
            return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(Collections.singletonMap("message", "Invalid username or password"));
        } catch (Exception e) {
            logger.error("Login error for user {}: {}", username, e.getMessage());
            return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("message", "An error occurred during login"));
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody User user) {
        logger.info("Registration attempt for username: {}, email: {}", user.getUsername(), user.getEmail());

        try {
            Optional<User> existingUser = userRepository.findByUsername(user.getUsername());
            if (existingUser.isPresent()) {
                logger.warn("Registration failed: Username {} is already taken", user.getUsername());
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Username is already taken"));
            }

            Optional<User> existingEmail = userRepository.findByEmail(user.getEmail());
            if (existingEmail.isPresent()) {
                logger.warn("Registration failed: Email {} is already in use", user.getEmail());
                return ResponseEntity.badRequest().body(Collections.singletonMap("message", "Email is already in use"));
            }

            user.setPassword(passwordEncoder.encode(user.getPassword()));
            user.setProvider("LOCAL");
            user.setRoles(Collections.singleton("ROLE_USER"));
            user.setEnabled(true);

            User savedUser = userRepository.save(user);
            logger.info("User registered successfully: {}", savedUser.getUsername());
            return ResponseEntity.ok(Collections.singletonMap("message", "User registered successfully"));
        } catch (Exception e) {
            logger.error("Registration error for username {}: {}", user.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("message", "An error occurred during registration"));
        }
    }

    @PostMapping("/init-admin")
    public ResponseEntity<?> initializeAdmin() {
        try {
            Optional<User> adminUserOptional = userRepository.findByUsername("admin");
            if (adminUserOptional.isPresent()) {
                // Delete existing admin user to recreate it
                userRepository.delete(adminUserOptional.get());
            }

            User adminUser = new User();
            adminUser.setUsername("admin");
            String rawPassword = "admin";
            String encodedPassword = passwordEncoder.encode(rawPassword);
            adminUser.setPassword(encodedPassword);
            adminUser.setEmail("admin@example.com");
            adminUser.setProvider("LOCAL");
            adminUser.setRoles(Collections.singleton("ROLE_ADMIN"));
            adminUser.setEnabled(true);

            User savedUser = userRepository.save(adminUser);
            logger.info("Admin user created successfully with username: {} and encoded password", savedUser.getUsername());
            
            return ResponseEntity.ok("Admin user created successfully");
        } catch (Exception e) {
            logger.error("Error creating admin user: ", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error creating admin user: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.badRequest().body("Not authenticated");
        }
        
        Optional<User> userOptional = userRepository.findByUsername(authentication.getName());
        if (!userOptional.isPresent()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOptional.get();
        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("email", user.getEmail());
        response.put("roles", user.getRoles());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/current-user")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            if (authHeader == null || !authHeader.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "No token provided"));
            }

            String token = authHeader.substring(7);
            if (!jwtUtils.validateJwtToken(token)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Collections.singletonMap("message", "Invalid token"));
            }

            String username = jwtUtils.getUserNameFromJwtToken(token);
            Optional<User> userOptional = userRepository.findByUsername(username);
            
            if (!userOptional.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Collections.singletonMap("message", "User not found"));
            }

            User user = userOptional.get();
            Map<String, Object> response = new HashMap<>();
            response.put("id", user.getId());
            response.put("username", user.getUsername());
            response.put("email", user.getEmail());
            response.put("roles", user.getRoles());
            response.put("enabled", user.isEnabled());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Collections.singletonMap("message", "Error processing request"));
        }
    }

    @GetMapping("/google")
    public ResponseEntity<Void> googleAuth() {
        String state = Base64.getEncoder().encodeToString(UUID.randomUUID().toString().getBytes());
        String googleAuthUrl = String.format(
            "https://accounts.google.com/o/oauth2/v2/auth" +
            "?client_id=%s" +
            "&redirect_uri=%s" +
            "&response_type=code" +
            "&scope=email%%20profile" +
            "&state=%s" +
            "&access_type=offline" +
            "&prompt=consent",
            googleClientId,
            redirectUri,
            state
        );
        
        return ResponseEntity.status(HttpStatus.FOUND)
            .location(URI.create(googleAuthUrl))
            .build();
    }

    @GetMapping("/google/callback")
    public ResponseEntity<?> googleCallback(
        @RequestParam("code") String code,
        @RequestParam(value = "state", required = false) String state) {
        try {
            String tokenEndpoint = "https://oauth2.googleapis.com/token";
            MultiValueMap<String, String> tokenRequest = new LinkedMultiValueMap<>();
            tokenRequest.add("client_id", googleClientId);
            tokenRequest.add("client_secret", googleClientSecret);
            tokenRequest.add("code", code);
            tokenRequest.add("redirect_uri", redirectUri);
            tokenRequest.add("grant_type", "authorization_code");

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            HttpEntity<MultiValueMap<String, String>> tokenRequestEntity = 
                new HttpEntity<>(tokenRequest, headers);

            ResponseEntity<Map> tokenResponse = restTemplate.postForEntity(
                tokenEndpoint,
                tokenRequestEntity,
                Map.class
            );

            if (!tokenResponse.getStatusCode().is2xxSuccessful()) {
                throw new RuntimeException("Failed to get token from Google");
            }

            String accessToken = (String) tokenResponse.getBody().get("access_token");

            // Get user info from Google
            String userInfoEndpoint = "https://www.googleapis.com/oauth2/v3/userinfo";
            HttpHeaders userInfoHeaders = new HttpHeaders();
            userInfoHeaders.setBearerAuth(accessToken);
            HttpEntity<String> userInfoRequestEntity = new HttpEntity<>("", userInfoHeaders);

            ResponseEntity<Map> userInfoResponse = restTemplate.exchange(
                userInfoEndpoint,
                HttpMethod.GET,
                userInfoRequestEntity,
                Map.class
            );

            Map<String, Object> userInfo = userInfoResponse.getBody();
            String email = (String) userInfo.get("email");
            String name = (String) userInfo.get("name");
            String picture = (String) userInfo.get("picture");

            // Process user data and generate JWT
            User user = processGoogleUser(email, name, picture);
            String jwt = generateTokenForUser(user);

            // Redirect to frontend with token
            String redirectUrl = String.format("%s/auth/callback?token=%s",
                frontendUrl, jwt);

            return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(redirectUrl))
                .build();

        } catch (Exception e) {
            logger.error("Google authentication error: ", e);
            return ResponseEntity.status(HttpStatus.FOUND)
                .location(URI.create(frontendUrl + "/login?error=auth_failed"))
                .build();
        }
    }

    private User processGoogleUser(String email, String name, String picture) {
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            user.setName(name);
            user.setPicture(picture);
        } else {
            user = new User();
            user.setEmail(email);
            user.setUsername(email);
            user.setName(name);
            user.setPicture(picture);
            user.setProvider("GOOGLE");
            user.setEnabled(true);
            user.setRoles(Collections.singleton("ROLE_USER"));
        }

        return userRepository.save(user);
    }

    private String generateTokenForUser(User user) {
        Authentication authentication = new UsernamePasswordAuthenticationToken(
            user,  // Pass the User object directly since it implements UserDetails
            null,
            user.getAuthorities()
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);
        return jwtUtils.generateJwtToken(authentication);
    }
}
