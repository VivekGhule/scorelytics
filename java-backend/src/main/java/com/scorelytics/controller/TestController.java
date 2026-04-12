package com.scorelytics.controller;

import com.scorelytics.dto.SubmitTestRequest;
import com.scorelytics.entity.Question;
import com.scorelytics.entity.TestResult;
import com.scorelytics.entity.User;
import com.scorelytics.repository.QuestionRepository;
import com.scorelytics.repository.TestResultRepository;
import com.scorelytics.repository.UserRepository;
import com.scorelytics.service.TestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/user/tests")
@RequiredArgsConstructor
public class TestController {

    private final TestService testService;
    private final QuestionRepository questionRepository;
    private final UserRepository userRepository;
    private final TestResultRepository resultRepository;

    @PostMapping("/submit")
    public ResponseEntity<TestResult> submitTest(
            @RequestBody SubmitTestRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<String> questionIds = request.getAnswers().keySet().stream().collect(Collectors.toList());
        List<Question> questions = questionRepository.findAllById(questionIds);

        TestResult result = testService.evaluateTest(
                user, 
                request.getTestTitle(), 
                questions, 
                request.getAnswers()
        );

        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public List<TestResult> getHistory(@AuthenticationPrincipal UserDetails userDetails) {
        User user = userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return resultRepository.findByUserIdOrderByTimestampDesc(user.getId());
    }
}
