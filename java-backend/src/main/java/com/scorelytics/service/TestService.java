package com.scorelytics.service;

import com.scorelytics.entity.Question;
import com.scorelytics.entity.TestResult;
import com.scorelytics.entity.User;
import com.scorelytics.repository.TestResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TestService {
    private final TestResultRepository resultRepository;

    public TestResult evaluateTest(User user, String testId, String testTitle, List<Question> questions, Map<String, String> userAnswers) {
        int score = 0;
        int quantCorrect = 0, quantTotal = 0;
        int reasoningCorrect = 0, reasoningTotal = 0;
        int verbalCorrect = 0, verbalTotal = 0;
        int easyCorrect = 0, easyTotal = 0;
        int mediumCorrect = 0, mediumTotal = 0;
        int hardCorrect = 0, hardTotal = 0;

        for (Question q : questions) {
            String userAnswer = userAnswers.get(q.getId());
            Question.Difficulty difficulty = q.getDifficulty() == null ? Question.Difficulty.Easy : q.getDifficulty();
            
            // Track subject totals
            switch (q.getCategory()) {
                case Quant -> quantTotal++;
                case Reasoning -> reasoningTotal++;
                case Verbal -> verbalTotal++;
            }

            switch (difficulty) {
                case Easy -> easyTotal++;
                case Medium -> mediumTotal++;
                case Hard -> hardTotal++;
            }

            if (q.getCorrectAnswer().equals(userAnswer)) {
                score++;
                switch (q.getCategory()) {
                    case Quant -> quantCorrect++;
                    case Reasoning -> reasoningCorrect++;
                    case Verbal -> verbalCorrect++;
                }

                switch (difficulty) {
                    case Easy -> easyCorrect++;
                    case Medium -> mediumCorrect++;
                    case Hard -> hardCorrect++;
                }
            }
        }

        List<String> weakAreas = new ArrayList<>();
        if (quantTotal > 0 && (double) quantCorrect / quantTotal < 0.5) weakAreas.add("Quant");
        if (reasoningTotal > 0 && (double) reasoningCorrect / reasoningTotal < 0.5) weakAreas.add("Reasoning");
        if (verbalTotal > 0 && (double) verbalCorrect / verbalTotal < 0.5) weakAreas.add("Verbal");

        Map<String, Integer> subjectWise = new HashMap<>();
        subjectWise.put("Quant", quantCorrect);
        subjectWise.put("Reasoning", reasoningCorrect);
        subjectWise.put("Verbal", verbalCorrect);

        Map<String, Integer> subjectTotals = new HashMap<>();
        subjectTotals.put("Quant", quantTotal);
        subjectTotals.put("Reasoning", reasoningTotal);
        subjectTotals.put("Verbal", verbalTotal);

        TestResult result = TestResult.builder()
                .userId(user.getId())
                .testId(testId)
                .testTitle(testTitle)
                .score(score)
                .totalQuestions(questions.size())
                .accuracy((double) score / questions.size() * 100)
                .subjectWise(subjectWise)
                .subjectTotals(subjectTotals)
                .weakAreas(weakAreas)
                .difficultyStats(TestResult.DifficultyStats.builder()
                        .easy(TestResult.DifficultyBucket.builder().correct(easyCorrect).total(easyTotal).build())
                        .medium(TestResult.DifficultyBucket.builder().correct(mediumCorrect).total(mediumTotal).build())
                        .hard(TestResult.DifficultyBucket.builder().correct(hardCorrect).total(hardTotal).build())
                        .build())
                .userName(user.getName())
                .userPhoto(user.getPhotoUrl())
                .timestamp(Instant.now().toString())
                .build();

        return resultRepository.save(result);
    }
}
