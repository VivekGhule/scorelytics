package com.scorelytics.dto;

import lombok.Data;
import java.util.Map;

@Data
public class SubmitTestRequest {
    private String testId;
    private String testTitle;
    private Map<String, String> answers; // questionId -> selectedOption
}
