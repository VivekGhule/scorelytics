package com.scorelytics.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.*;
import java.util.List;

@Document(collection = "tests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Test {
    @Id
    private String id;

    private String title;

    /**
     * Matches frontend shape: 'Quant' | 'Reasoning' | 'Verbal' | 'Mixed'
     */
    private String category;

    private Integer duration; // in minutes

    private List<String> questionIds;

    /**
     * ISO string (frontend sends new Date().toISOString()).
     */
    private String createdAt;
}
