-- Migration 015: System Audit Logging

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_uuid VARCHAR(36) NOT NULL UNIQUE,
    user_id INT NULL,
    action VARCHAR(50) NOT NULL,
    resource_type VARCHAR(50) NOT NULL,
    resource_id VARCHAR(100) NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    result VARCHAR(20) NOT NULL DEFAULT 'SUCCESS',
    details JSON NULL,
    CONSTRAINT fk_al_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_ts (timestamp),
    INDEX idx_audit_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
