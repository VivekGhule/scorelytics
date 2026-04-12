package com.scorelytics.controller;

import com.scorelytics.entity.User;
import com.scorelytics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserRepository userRepository;

    /**
     * Get user profile by ID (public endpoint)
     */
    @GetMapping("/{uid}")
    public ResponseEntity<?> getUserProfile(@PathVariable String uid) {
        Optional<User> userOpt = userRepository.findById(uid);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(toUserProfile(userOpt.get()));
    }

    /**
     * Update profile for the authenticated user (or admin)
     */
    @PatchMapping("/{uid}")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable String uid,
            @RequestBody Map<String, Object> patch,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String requesterId = String.valueOf(authentication.getPrincipal());
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (!isAdmin && !Objects.equals(requesterId, uid)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Forbidden"));
        }

        Optional<User> userOpt = userRepository.findById(uid);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }

        User user = userOpt.get();

        if (patch.containsKey("name")) user.setName((String) patch.get("name"));
        if (patch.containsKey("phone")) user.setPhone((String) patch.get("phone"));
        if (patch.containsKey("location")) user.setLocation((String) patch.get("location"));

        if (patch.containsKey("gender")) {
            String gender = String.valueOf(patch.get("gender")).toLowerCase();
            if (!"male".equals(gender) && !"female".equals(gender)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid gender"));
            }
            user.setGender(gender);
        }

        if (patch.containsKey("education")) {
            Object educationRaw = patch.get("education");
            if (!(educationRaw instanceof Map<?, ?> educationMap)) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid education payload"));
            }
            User.Education education = user.getEducation() == null ? new User.Education() : user.getEducation();
            if (educationMap.containsKey("college")) education.setCollege((String) educationMap.get("college"));
            if (educationMap.containsKey("degree")) education.setDegree((String) educationMap.get("degree"));
            if (educationMap.containsKey("specialization")) education.setSpecialization((String) educationMap.get("specialization"));
            if (educationMap.containsKey("graduationYear")) education.setGraduationYear((String) educationMap.get("graduationYear"));
            user.setEducation(education);
        }

        User saved = userRepository.save(user);
        return ResponseEntity.ok(toUserProfile(saved));
    }

    private Map<String, Object> toUserProfile(User user) {
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
