package com.scorelytics.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class to load environment variables from .env file
 * This runs automatically when the application starts
 */
@Configuration
public class EnvironmentConfig {
    
    static {
        // Load .env file and set environment variables
        // The .env file is expected to be in the project root directory
        Dotenv dotenv = Dotenv.configure()
                .ignoreIfMissing() // Don't fail if .env doesn't exist
                .load();
        
        // Get all environment variables from .env and set them as system properties
        dotenv.entries().forEach(entry -> 
            System.setProperty(entry.getKey(), entry.getValue())
        );
    }
}
