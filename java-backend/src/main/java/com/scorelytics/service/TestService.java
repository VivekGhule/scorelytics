package com.scorelytics.service;

import com.scorelytics.entity.Question;
import com.scorelytics.entity.TestResult;
import com.scorelytics.entity.User;
import com.scorelytics.repository.TestResultRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class TestService {
    private final TestResultRepository resultRepository;

    public TestResult evaluateTest(User user, String testTitle, List<Question> questions, Map<String, String> userAnswers) {
        int score = 0;
        int quantCorrect = 0, quantTotal = 0;
        int reasoningCorrect = 0, reasoningTotal = 0;
        int verbalCorrect = 0, verbalTotal = 0;

        for (Question q : questions) {
            String userAnswer = userAnswers.get(q.getId());
            
            // Track subject totals
            switch (q.getCategory()) {
                case Quant -> quantTotal++;
                case Reasoning -> reasoningTotal++;
                case Verbal -> verbalTotal++;
            }

            if (q.getCorrectAnswer().equals(userAnswer)) {
                score++;
                switch (q.getCategory()) {
                    case Quant -> quantCorrect++;
                    case Reasoning -> reasoningCorrect++;
                    case Verbal -> verbalCorrect++;
                }
            }
        }

        List<String> weakAreas = new ArrayList<>();
        if (quantTotal > 0 && (double) quantCorrect / quantTotal < 0.5) weakAreas.add("Quant");
        if (reasoningTotal > 0 && (double) reasoningCorrect / reasoningTotal < 0.5) weakAreas.add("Reasoning");
        if (verbalTotal > 0 && (double) verbalCorrect / verbalTotal < 0.5) weakAreas.add("Verbal");

        TestResult result = TestResult.builder()
                .userId(user.getId())
                .testTitle(testTitle)
                .score(score)
                .totalQuestions(questions.size())
                .accuracy((double) score / questions.size() * 100)
                .weakAreas(weakAreas)
                .userName(user.getName())
                .userPhoto(user.getPhotoUrl())
                .timestamp(Instant.now().toString())
                .build();

        return resultRepository.save(result);
    }
}
