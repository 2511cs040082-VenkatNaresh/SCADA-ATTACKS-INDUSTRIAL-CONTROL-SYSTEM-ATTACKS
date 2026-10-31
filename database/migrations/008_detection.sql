-- Migration 008: Detection Engine Rules & Results

CREATE TABLE IF NOT EXISTS detection_rules (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_uuid VARCHAR(36) NOT NULL UNIQUE,
    rule_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    category VARCHAR(50) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    enabled BOOLEAN DEFAULT TRUE,
    version VARCHAR(20) DEFAULT '1.0.0',
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dr_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detection_rule_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_id INT NOT NULL,
    version VARCHAR(20) NOT NULL,
    logic_definition JSON NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_drv_rule FOREIGN KEY (rule_id) REFERENCES detection_rules(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detection_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    feature_name VARCHAR(100) NOT NULL UNIQUE,
    data_type VARCHAR(50) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detection_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    result_uuid VARCHAR(36) NOT NULL UNIQUE,
    event_id BIGINT NOT NULL,
    rule_id INT NULL,
    detection_type VARCHAR(50) NOT NULL, -- RULE_BASED, ML_BASED, STATISTICAL, CORRELATION
    confidence DOUBLE DEFAULT 0.8,
    risk_score DOUBLE DEFAULT 50.0,
    explanation TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dres_event FOREIGN KEY (event_id) REFERENCES security_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_dres_rule FOREIGN KEY (rule_id) REFERENCES detection_rules(id) ON DELETE SET NULL,
    INDEX idx_dres_event (event_id),
    INDEX idx_dres_rule (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
