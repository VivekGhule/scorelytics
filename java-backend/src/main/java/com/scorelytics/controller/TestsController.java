package com.scorelytics.controller;

import com.scorelytics.entity.Test;
import com.scorelytics.repository.TestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tests")
@RequiredArgsConstructor
public class TestsController {

    private final TestRepository testRepository;

    /**
     * Get all tests (public endpoint)
     */
    @GetMapping
    public ResponseEntity<List<Test>> getAllTests() {
        List<Test> tests = testRepository.findAll();
        return ResponseEntity.ok(tests);
    }

    /**
     * Get test by ID (public endpoint)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTestById(@PathVariable String id) {
        return testRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Create test (admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createTest(@RequestBody Test test) {
        if (test.getTitle() == null || test.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "title is required"));
        }
        if (test.getDuration() == null || test.getDuration() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "duration must be > 0"));
        }
        if (test.getQuestionIds() == null || test.getQuestionIds().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "questionIds must contain at least one id"));
        }
        if (test.getCategory() == null || test.getCategory().isBlank()) {
            test.setCategory("Mixed");
        }
        if (test.getCreatedAt() == null || test.getCreatedAt().isBlank()) {
            test.setCreatedAt(Instant.now().toString());
        }

        Test saved = testRepository.save(test);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Update test (admin only)
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateTest(@PathVariable String id, @RequestBody Test patch) {
        var existingOpt = testRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Test not found"));
        }

        if (patch.getTitle() != null && patch.getTitle().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "title cannot be empty"));
        }
        if (patch.getDuration() != null && patch.getDuration() <= 0) {
            return ResponseEntity.badRequest().body(Map.of("error", "duration must be > 0"));
        }
        if (patch.getQuestionIds() != null && patch.getQuestionIds().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "questionIds must contain at least one id"));
        }

        Test existing = existingOpt.get();

        if (patch.getTitle() != null) {
            existing.setTitle(patch.getTitle().trim());
        }
        if (patch.getCategory() != null) {
            existing.setCategory(patch.getCategory().isBlank() ? "Mixed" : patch.getCategory());
        }
        if (patch.getDuration() != null) {
            existing.setDuration(patch.getDuration());
        }
        if (patch.getQuestionIds() != null) {
            existing.setQuestionIds(patch.getQuestionIds());
        }

        Test saved = testRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    /**
     * Delete test (admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteTest(@PathVariable String id) {
        if (!testRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Test not found"));
        }
        testRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}
