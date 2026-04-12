package com.scorelytics.controller;

import com.scorelytics.dto.LoginRequest;
import com.scorelytics.dto.RegisterRequest;
import com.scorelytics.entity.User;
import com.scorelytics.repository.UserRepository;
import com.scorelytics.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration:86400000}")
    private long jwtExpiration;

    /**
     * Register a new user
     */
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("error", "Email already exists"));
        }

        // Create new user
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(User.Role.USER);
        user.setGender("male");
        user.setCreatedAt(new Date());
        user.setLastSeenAt(new Date());

        User savedUser = userRepository.save(user);

        // Generate JWT token
        String token = jwtService.generateTokenForUserId(savedUser.getId());

        // Return response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("profile", toUserProfile(savedUser));

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Login user
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userRepository.findByEmail(request.getEmail());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        User user = userOpt.get();

        // Verify password
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid email or password"));
        }

        // Generate JWT token
        String token = jwtService.generateTokenForUserId(user.getId());

        // Mark user as active
        user.setLastSeenAt(new Date());
        userRepository.save(user);

        // Return response
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("profile", toUserProfile(user));

        return ResponseEntity.ok(response);
    }

    /**
     * Get current user profile (requires authentication)
     */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String userId = jwtService.extractUserId(token);

            Optional<User> userOpt = userRepository.findById(userId);

            if (userOpt.isEmpty()) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("error", "User not found"));
            }

            User user = userOpt.get();
            return ResponseEntity.ok(toUserProfile(user));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Invalid token"));
        }
    }

    private Map<String, Object> toUserProfile(User user) {
        // Match the frontend's UserProfile shape (src/types/index.ts)
        Map<String, Object> profile = new HashMap<>();
        profile.put("uid", user.getId());
        profile.put("name", user.getName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole());
        profile.put("photoUrl", user.getPhotoUrl());
        profile.put("gender", user.getGender());
        profile.put("phone", user.getPhone());
        profile.put("location", user.getLocation());
        profile.put("education", user.getEducation());
        profile.put("createdAt", user.getCreatedAt() == null ? null : user.getCreatedAt().toInstant().toString());
        profile.put("lastSeenAt", user.getLastSeenAt() == null ? null : user.getLastSeenAt().toInstant().toString());
        return profile;
    }

}
