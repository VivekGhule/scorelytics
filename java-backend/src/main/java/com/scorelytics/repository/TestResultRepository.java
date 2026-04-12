package com.scorelytics.repository;

import com.scorelytics.entity.TestResult;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface TestResultRepository extends MongoRepository<TestResult, String> {
    List<TestResult> findByUserIdOrderByTimestampDesc(String userId);
}
