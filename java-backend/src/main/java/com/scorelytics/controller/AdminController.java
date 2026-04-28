package com.scorelytics.controller;

import com.scorelytics.entity.Question;
import com.scorelytics.entity.Test;
import com.scorelytics.entity.User;
import com.scorelytics.repository.QuestionRepository;
import com.scorelytics.repository.TestRepository;
import com.scorelytics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {
    private final QuestionRepository questionRepository;
    private final TestRepository testRepository;
    private final UserRepository userRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @GetMapping("/stats")
    public Map<String, Object> getStats() {
        Date cutoff = new Date(System.currentTimeMillis() - (10 * 60 * 1000));
        long activeUsers = userRepository.countByLastSeenAtAfter(cutoff);

        Map<String, Object> stats = new HashMap<>();
        stats.put("questions", questionRepository.count());
        stats.put("tests", testRepository.count());
        stats.put("users", userRepository.count());
        stats.put("activeUsers", activeUsers);
        stats.put("activeWindowMinutes", 10);
        return stats;
    }

    // User Management
    @GetMapping("/users")
    public List<Map<String, Object>> getAllUsers() {
        return userRepository.findAll().stream().map(this::toUserProfile).collect(Collectors.toList());
    }

    @PostMapping("/users")
    public User saveUser(@RequestBody User user) {
        if (user.getId() == null) {
            // New user creation - hash password
            user.setPassword(passwordEncoder.encode(user.getPassword()));
            if (user.getCreatedAt() == null) user.setCreatedAt(new Date());
            // New users are always created as USER. Promote-to-admin flow is disabled.
            if (user.getRole() == null || user.getRole() == User.Role.ADMIN) user.setRole(User.Role.USER);
            if (user.getGender() == null || user.getGender().isBlank()) user.setGender("male");
        }
        return userRepository.save(user);
    }

    @PatchMapping("/users/{id}")
    public ResponseEntity<?> updateUser(@PathVariable String id, @RequestBody Map<String, Object> patch) {
        Optional<User> userOpt = userRepository.findById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "User not found"));
        }
        User user = userOpt.get();

        if (patch.containsKey("name")) user.setName((String) patch.get("name"));
        if (patch.containsKey("photoUrl")) user.setPhotoUrl((String) patch.get("photoUrl"));
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

        if (patch.containsKey("role")) {
            try {
                User.Role requestedRole = User.Role.valueOf(String.valueOf(patch.get("role")));
                if (requestedRole == User.Role.ADMIN && user.getRole() != User.Role.ADMIN) {
                    return ResponseEntity.status(HttpStatus.FORBIDDEN)
                            .body(Map.of("error", "Promoting users to ADMIN is disabled"));
                }
                user.setRole(requestedRole);
            } catch (Exception e) {
                return ResponseEntity.badRequest().body(Map.of("error", "Invalid role"));
            }
        }

        User saved = Objects.requireNonNull(userRepository.save(user));
        return ResponseEntity.ok(toUserProfile(saved));
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        userRepository.deleteById(Objects.requireNonNull(id));
        return ResponseEntity.ok().build();
    }

    private Map<String, Object> toUserProfile(User user) {
        Map<String, Object> profile = new HashMap<>();
        long now = System.currentTimeMillis();
        boolean isActive = user.getLastSeenAt() != null && (now - user.getLastSeenAt().getTime()) <= (10 * 60 * 1000);
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
        profile.put("isActive", isActive);
        return profile;
    }

    // Question Management
    @GetMapping("/questions")
    public List<Question> getAllQuestions() {
        return questionRepository.findAll();
    }

    @PostMapping("/questions")
    public Question addQuestion(@RequestBody Question question) {
        question = normalizeQuestion(question);
        return Objects.requireNonNull(questionRepository.save(question));
    }

    @DeleteMapping("/questions/{id}")
    public ResponseEntity<?> deleteQuestion(@PathVariable String id) {
        questionRepository.deleteById(Objects.requireNonNull(id));
        return ResponseEntity.ok().build();
    }

    // Test Management
    @GetMapping("/tests")
    public List<Test> getAllTests() {
        return testRepository.findAll();
    }

    @PostMapping("/tests")
    public Test addTest(@RequestBody Test test) {
        if (test.getCreatedAt() == null || test.getCreatedAt().isBlank()) {
            test.setCreatedAt(java.time.Instant.now().toString());
        }
        return Objects.requireNonNull(testRepository.save(test));
    }

    @DeleteMapping("/tests/{id}")
    public ResponseEntity<?> deleteTest(@PathVariable String id) {
        testRepository.deleteById(Objects.requireNonNull(id));
        return ResponseEntity.ok().build();
    }

    private Question normalizeQuestion(Question question) {
        if (question.getDifficulty() == null) {
            question.setDifficulty(Question.Difficulty.Easy);
        }
        return question;
    }
}
