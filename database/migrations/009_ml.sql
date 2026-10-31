-- Migration 009: Machine Learning Models & Inference Tracking

CREATE TABLE IF NOT EXISTS ml_models (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_uuid VARCHAR(36) NOT NULL UNIQUE,
    model_name VARCHAR(100) NOT NULL UNIQUE,
    model_type VARCHAR(50) NOT NULL,
    description TEXT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ml_model_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    model_id INT NOT NULL,
    version VARCHAR(20) NOT NULL,
    model_path VARCHAR(255) NOT NULL,
    training_dataset VARCHAR(255) NULL,
    accuracy DOUBLE NULL,
    precision_score DOUBLE NULL,
    recall_score DOUBLE NULL,
    f1_score DOUBLE NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mlmv_model FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS ml_predictions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_version_id INT NOT NULL,
    event_id BIGINT NOT NULL,
    prediction VARCHAR(100) NOT NULL,
    confidence DOUBLE NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mlp_mv FOREIGN KEY (model_version_id) REFERENCES ml_model_versions(id) ON DELETE CASCADE,
    CONSTRAINT fk_mlp_event FOREIGN KEY (event_id) REFERENCES security_events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
