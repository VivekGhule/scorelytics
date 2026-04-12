package com.scorelytics.repository;

import com.scorelytics.entity.Test;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface TestRepository extends MongoRepository<Test, String> {
}
