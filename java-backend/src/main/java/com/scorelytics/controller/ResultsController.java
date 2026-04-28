package com.scorelytics.controller;

import com.scorelytics.entity.TestResult;
import com.scorelytics.repository.TestResultRepository;
import com.scorelytics.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/results")
@RequiredArgsConstructor
public class ResultsController {
    
    private final TestResultRepository resultRepository;
    private final UserRepository userRepository;
    
    /**
     * Get all results (public endpoint)
     */
    @GetMapping
    public ResponseEntity<List<TestResult>> getAllResults() {
        Set<String> adminUserIds = userRepository.findAll().stream()
                .filter(user -> user.getRole() == com.scorelytics.entity.User.Role.ADMIN)
                .map(com.scorelytics.entity.User::getId)
                .collect(Collectors.toSet());

        List<TestResult> results = resultRepository.findAll().stream()
                .filter(result -> !adminUserIds.contains(result.getUserId()))
                .toList();
        return ResponseEntity.ok(results);
    }
    
    /**
     * Get results by user ID (public endpoint)
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getResultsByUserId(@PathVariable String userId) {
        List<TestResult> results = resultRepository.findByUserIdOrderByTimestampDesc(userId);
        return ResponseEntity.ok(results);
    }
    
    /**
     * Get result by ID (public endpoint)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getResultById(@PathVariable String id) {
        return resultRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Save a test result for a regular user.
     * Frontend posts the computed result after finishing a test.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('USER','ADMIN')")
    public ResponseEntity<?> saveResult(@RequestBody TestResult result, Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        String authUserId = authentication.getPrincipal().toString();
        boolean isAdmin = authentication.getAuthorities().stream().anyMatch(a -> "ROLE_ADMIN".equals(a.getAuthority()));

        if (isAdmin) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Admins cannot submit test results"));
        }

        result.setUserId(authUserId);

        if (result.getTestTitle() == null || result.getTestTitle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "testTitle is required"));
        }
        if (result.getScore() == null || result.getTotalQuestions() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "score and totalQuestions are required"));
        }
        if (result.getTimestamp() == null || result.getTimestamp().isBlank()) {
            result.setTimestamp(Instant.now().toString());
        }

        TestResult saved = resultRepository.save(result);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }
}
