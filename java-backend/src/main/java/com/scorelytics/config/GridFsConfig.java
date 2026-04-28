package com.scorelytics.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.convert.MongoConverter;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;

@Configuration
public class GridFsConfig {

    @Bean
    public GridFsTemplate gridFsTemplate(
            MongoDatabaseFactory mongoDatabaseFactory,
            MongoConverter mongoConverter,
            @Value("${app.gridfs.bucket:studyResourcesFiles}") String bucketName
    ) {
        return new GridFsTemplate(mongoDatabaseFactory, mongoConverter, bucketName);
    }
}
