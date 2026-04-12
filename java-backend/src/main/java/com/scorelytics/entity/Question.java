package com.scorelytics.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;

import java.util.List;

@Document(collection = "questions")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {
    @Id
    private String id;

    private String text;

    private List<String> options;

    private List<String> optionImages;

    private String correctAnswer;

    private Category category;

    private String imageUrl;

    private String createdAt;

    private String explanation;

    private String instructions;

    public enum Category {
        Quant, Reasoning, Verbal
    }
}
