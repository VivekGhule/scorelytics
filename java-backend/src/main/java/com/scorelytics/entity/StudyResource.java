package com.scorelytics.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "study_resources")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudyResource {
    @Id
    private String id;

    private String title;
    private String description;
    private Category category;
    private ResourceType type;
    private String noteContent;
    private String fileId;
    private String fileName;
    private String createdAt;
    private String updatedAt;

    public enum Category {
        Quant, Reasoning, Verbal
    }

    public enum ResourceType {
        NOTE, PDF
    }
}
