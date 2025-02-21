
CREATE DATABASE verification_system;

CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    fullname VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    lastLogin DATETIME DEFAULT CURRENT_TIMESTAMP,
    isVerified TINYINT(1) DEFAULT 0,
    resetPasswordToken VARCHAR(255),
    resetPasswordExpiresAt DATETIME,
    verificationToken VARCHAR(6),
    verificationTokenExpiresAt DATETIME,
    role ENUM('user', 'admin', 'moderator') DEFAULT 'user',
    status ENUM('active', 'inactive', 'banned') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
