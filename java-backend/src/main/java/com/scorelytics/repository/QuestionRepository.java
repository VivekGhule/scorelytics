package com.scorelytics.repository;

import com.scorelytics.entity.Question;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface QuestionRepository extends MongoRepository<Question, String> {
}
