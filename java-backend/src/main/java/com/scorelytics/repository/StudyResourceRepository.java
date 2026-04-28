package com.scorelytics.repository;

import com.scorelytics.entity.StudyResource;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface StudyResourceRepository extends MongoRepository<StudyResource, String> {
    List<StudyResource> findAllByOrderByCreatedAtDesc();
}
