-- Scorelytics MySQL Schema

CREATE DATABASE IF NOT EXISTS scorelytics;
USE scorelytics;

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    uid VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role ENUM('USER', 'ADMIN') DEFAULT 'USER',
    photo_url TEXT,
    phone VARCHAR(20),
    location VARCHAR(255),
    college VARCHAR(255),
    degree VARCHAR(100),
    specialization VARCHAR(100),
    graduation_year VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tests Table
CREATE TABLE IF NOT EXISTS tests (
    id VARCHAR(255) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    duration INT NOT NULL, -- in minutes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(255) PRIMARY KEY,
    text TEXT NOT NULL,
    options JSON NOT NULL, -- Array of strings
    correct_answer VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    explanation TEXT,
    image_url TEXT,
    instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for Tests and Questions (Many-to-Many)
CREATE TABLE IF NOT EXISTS test_questions (
    test_id VARCHAR(255),
    question_id VARCHAR(255),
    PRIMARY KEY (test_id, question_id),
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Test Results Table
CREATE TABLE IF NOT EXISTS test_results (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    test_id VARCHAR(255) NOT NULL,
    test_title VARCHAR(255) NOT NULL,
    score INT NOT NULL,
    total_questions INT NOT NULL,
    accuracy DOUBLE NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    subject_wise JSON NOT NULL, -- Map of subject scores
    weak_areas JSON NOT NULL, -- Array of weak subjects
    FOREIGN KEY (user_id) REFERENCES users(uid) ON DELETE CASCADE,
    FOREIGN KEY (test_id) REFERENCES tests(id) ON DELETE CASCADE
);
