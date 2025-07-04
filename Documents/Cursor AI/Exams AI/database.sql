-- Exam Pattern Analyzer Database Schema
-- MySQL Database Setup

-- Create database
CREATE DATABASE IF NOT EXISTS exam_ai_db;
USE exam_ai_db;

-- Users table
CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255),
    provider ENUM('local', 'google', 'facebook') DEFAULT 'local',
    verified BOOLEAN DEFAULT FALSE,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    exam_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_provider (provider),
    INDEX idx_verified (verified)
);

-- Token management table
CREATE TABLE user_tokens (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    tokens_available INT DEFAULT 0,
    tokens_used INT DEFAULT 0,
    total_purchased INT DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
);

-- Payment transactions table
CREATE TABLE payment_transactions (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    tokens_purchased INT NOT NULL,
    payment_method VARCHAR(50) DEFAULT 'credit_card',
    transaction_status ENUM('pending', 'completed', 'failed', 'refunded') DEFAULT 'pending',
    stripe_payment_intent_id VARCHAR(255),
    card_last4 VARCHAR(4),
    card_brand VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (transaction_status),
    INDEX idx_created_at (created_at)
);

-- Token usage logs table
CREATE TABLE token_usage_logs (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    tokens_used INT NOT NULL,
    description TEXT,
    exam_type VARCHAR(100),
    subject VARCHAR(100),
    topic VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_action_type (action_type),
    INDEX idx_created_at (created_at)
);

-- Verification tokens table
CREATE TABLE verification_tokens (
    token VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_expires (expires_at)
);

-- User subjects table
CREATE TABLE user_subjects (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type ENUM('mandatory', 'optional') DEFAULT 'optional',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type)
);

-- Exam data cache table (for OpenAI responses)
CREATE TABLE exam_data_cache (
    id VARCHAR(36) PRIMARY KEY,
    exam_name VARCHAR(255) NOT NULL,
    grade_level VARCHAR(100),
    stream VARCHAR(100),
    subjects JSON,
    exam_info JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_exam_name (exam_name),
    INDEX idx_grade_stream (grade_level, stream)
);

-- User sessions table (optional, for session management)
CREATE TABLE user_sessions (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    data JSON,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_expires (expires_at)
);

-- Analytics table (for tracking usage)
CREATE TABLE analytics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(36),
    action VARCHAR(100) NOT NULL,
    exam_type VARCHAR(100),
    subject VARCHAR(100),
    topic VARCHAR(100),
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_created_at (created_at)
);

-- Insert sample data for testing
INSERT INTO users (id, email, name, password, provider, verified, onboarding_completed) VALUES
('test-user-1', 'test@example.com', 'Test User', '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj4J/HS.iK2', 'local', TRUE, TRUE);

-- Insert sample token data
INSERT INTO user_tokens (id, user_id, tokens_available, tokens_used, total_purchased) VALUES
('token-1', 'test-user-1', 100, 50, 150);

-- Create indexes for better performance
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_updated_at ON users(updated_at);
CREATE INDEX idx_verification_tokens_created_at ON verification_tokens(created_at);
CREATE INDEX idx_user_subjects_created_at ON user_subjects(created_at);
CREATE INDEX idx_exam_data_cache_created_at ON exam_data_cache(created_at);
CREATE INDEX idx_payment_transactions_created_at ON payment_transactions(created_at);
CREATE INDEX idx_token_usage_logs_created_at ON token_usage_logs(created_at); 