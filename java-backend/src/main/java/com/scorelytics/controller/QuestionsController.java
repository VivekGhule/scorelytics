package com.scorelytics.controller;

import com.scorelytics.entity.Question;
import com.scorelytics.repository.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionsController {
    
    private final QuestionRepository questionRepository;
    
    /**
     * Get all questions (public endpoint)
     */
    @GetMapping
    public ResponseEntity<?> getAllQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String difficulty
    ) {
        Question.Category parsedCategory;
        Question.Difficulty parsedDifficulty;

        try {
            parsedCategory = parseCategory(category);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid category"));
        }

        try {
            parsedDifficulty = parseDifficulty(difficulty);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid difficulty"));
        }

        List<Question> questions = questionRepository.findAll().stream()
                .map(this::normalizeQuestion)
                .filter(question -> parsedCategory == null || question.getCategory() == parsedCategory)
                .filter(question -> parsedDifficulty == null || question.getDifficulty() == parsedDifficulty)
                .toList();
        return ResponseEntity.ok(questions);
    }
    
    /**
     * Get question by ID (public endpoint)
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getQuestionById(@PathVariable String id) {
        return questionRepository.findById(id)
                .map(this::normalizeQuestion)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    /**
     * Create question (admin only)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createQuestion(@RequestBody Question question) {
        if ((question.getText() == null || question.getText().isBlank())
                && (question.getImageUrl() == null || question.getImageUrl().isBlank())) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question text or image is required"));
        }
        if (question.getOptions() == null || question.getOptions().size() < 2) {
            return ResponseEntity.badRequest().body(Map.of("error", "At least 2 options are required"));
        }
        if (question.getCorrectAnswer() == null || question.getCorrectAnswer().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "correctAnswer is required"));
        }
        if (question.getCategory() == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "category is required"));
        }
        normalizeQuestion(question);
        if (question.getCreatedAt() == null || question.getCreatedAt().isBlank()) {
            question.setCreatedAt(Instant.now().toString());
        }

        Question saved = questionRepository.save(question);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Update question (admin only)
     */
    @PatchMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateQuestion(@PathVariable String id, @RequestBody Question patch) {
        var existingOpt = questionRepository.findById(id);
        if (existingOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Question not found"));
        }

        Question existing = existingOpt.get();
        if (patch.getText() != null) existing.setText(patch.getText());
        if (patch.getOptions() != null) existing.setOptions(patch.getOptions());
        if (patch.getOptionImages() != null) existing.setOptionImages(patch.getOptionImages());
        if (patch.getCorrectAnswer() != null) existing.setCorrectAnswer(patch.getCorrectAnswer());
        if (patch.getCategory() != null) existing.setCategory(patch.getCategory());
        if (patch.getDifficulty() != null) existing.setDifficulty(patch.getDifficulty());
        if (patch.getImageUrl() != null) existing.setImageUrl(patch.getImageUrl());
        if (patch.getExplanation() != null) existing.setExplanation(patch.getExplanation());
        if (patch.getInstructions() != null) existing.setInstructions(patch.getInstructions());

        normalizeQuestion(existing);
        Question saved = questionRepository.save(existing);
        return ResponseEntity.ok(saved);
    }

    /**
     * Delete question (admin only)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> deleteQuestion(@PathVariable String id) {
        if (!questionRepository.existsById(id)) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", "Question not found"));
        }
        questionRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }

    private Question normalizeQuestion(Question question) {
        if (question.getDifficulty() == null) {
            question.setDifficulty(Question.Difficulty.Easy);
        }
        return question;
    }

    private Question.Category parseCategory(String rawCategory) {
        if (!StringUtils.hasText(rawCategory) || "all".equalsIgnoreCase(rawCategory)) {
            return null;
        }

        return switch (rawCategory.trim().toLowerCase()) {
            case "quant" -> Question.Category.Quant;
            case "reasoning" -> Question.Category.Reasoning;
            case "verbal" -> Question.Category.Verbal;
            default -> throw new IllegalArgumentException("Invalid category");
        };
    }

    private Question.Difficulty parseDifficulty(String rawDifficulty) {
        if (!StringUtils.hasText(rawDifficulty) || "all".equalsIgnoreCase(rawDifficulty)) {
            return null;
        }

        return switch (rawDifficulty.trim().toLowerCase()) {
            case "easy" -> Question.Difficulty.Easy;
            case "medium" -> Question.Difficulty.Medium;
            case "hard" -> Question.Difficulty.Hard;
            default -> throw new IllegalArgumentException("Invalid difficulty");
        };
    }
}

