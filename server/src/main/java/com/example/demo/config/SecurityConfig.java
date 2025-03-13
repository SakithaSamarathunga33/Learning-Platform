package com.example.demo.config;

import com.example.demo.security.JwtAuthenticationFilter;
import com.example.demo.security.CustomUserDetailsService;
import com.example.demo.security.JwtUtils;
import com.example.demo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.core.Authentication;
import java.util.Arrays;
import java.util.Collections;
import org.springframework.security.oauth2.client.registration.ClientRegistration;
import org.springframework.security.oauth2.client.registration.ClientRegistrationRepository;
import org.springframework.security.oauth2.client.registration.InMemoryClientRegistrationRepository;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.security.oauth2.core.oidc.IdTokenClaimNames;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private JwtUtils jwtUtils;

    @Value("${app.cors.allowed-origins:http://localhost:3000}")
    private String allowedOrigins;

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String googleClientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String googleClientSecret;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfig = new CorsConfiguration();
                corsConfig.setAllowedOrigins(Arrays.asList("http://localhost:3030"));
                corsConfig.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                corsConfig.setAllowedHeaders(Arrays.asList("*"));
                corsConfig.setAllowCredentials(true);
                return corsConfig;
            }))
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/**").permitAll()
                .requestMatchers("/api/public/**").permitAll()
                .anyRequest().authenticated()
            )
            .oauth2Login(oauth2 -> oauth2
                .clientRegistrationRepository(clientRegistrationRepository())
                .authorizationEndpoint(authorization -> authorization
                    .baseUri("/api/auth/oauth2/authorize")
                )
                .redirectionEndpoint(redirection -> redirection
                    .baseUri("/api/auth/oauth2/callback/*")
                )
                .successHandler((request, response, authentication) -> {
                    OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
                    String email = oauth2User.getAttribute("email");
                    String name = oauth2User.getAttribute("name");
                    String picture = oauth2User.getAttribute("picture");
                    
                    // Generate JWT token
                    String token = jwtUtils.generateJwtToken(email);
                    
                    // Redirect to frontend
                    response.sendRedirect(allowedOrigins + "/auth/callback?token=" + token);
                })
                .failureHandler((request, response, exception) -> {
                    response.sendRedirect(allowedOrigins + "/login?error=auth_failed");
                })
            )
            .userDetailsService(userDetailsService)
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(10); // Using strength of 10
    }

    @Bean
    public ClientRegistrationRepository clientRegistrationRepository() {
        ClientRegistration googleRegistration = ClientRegistration
            .withRegistrationId("google")
            .clientId(googleClientId)
            .clientSecret(googleClientSecret)
            .clientName("Google")
            .authorizationGrantType(AuthorizationGrantType.AUTHORIZATION_CODE)
            .redirectUri("{baseUrl}/api/auth/oauth2/callback")
            .scope("email", "profile")
            .authorizationUri("https://accounts.google.com/o/oauth2/v2/auth")
            .tokenUri("https://www.googleapis.com/oauth2/v4/token")
            .userInfoUri("https://www.googleapis.com/oauth2/v3/userinfo")
            .userNameAttributeName(IdTokenClaimNames.SUB)
            .jwkSetUri("https://www.googleapis.com/oauth2/v3/certs")
            .build();

        return new InMemoryClientRegistrationRepository(googleRegistration);
    }
}
