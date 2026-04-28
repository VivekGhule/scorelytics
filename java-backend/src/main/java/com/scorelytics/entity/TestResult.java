package com.scorelytics.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.util.List;
import java.util.Map;

@Document(collection = "test_results")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TestResult {
    @Id
    private String id;

    // Matches frontend payload (src/types/index.ts)
    private String userId;
    private String testId;
    private String testTitle;
    private Integer score;
    private Integer totalQuestions;
    private Double accuracy;

    private Map<String, Integer> subjectWise;
    private Map<String, Integer> subjectTotals;
    private List<String> weakAreas;
    private DifficultyStats difficultyStats;

    private String userName;
    private String userPhoto;

    // ISO string
    private String timestamp;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DifficultyBucket {
        private Integer correct;
        private Integer total;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class DifficultyStats {
        private DifficultyBucket easy;
        private DifficultyBucket medium;
        private DifficultyBucket hard;
    }
}
