-- Migration 007: Security Events & Anomaly Categorization

CREATE TABLE IF NOT EXISTS event_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS event_severity (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    weight INT NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS security_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_uuid VARCHAR(36) NOT NULL UNIQUE,
    timestamp DATETIME(3) NOT NULL,
    event_type_id INT NOT NULL,
    source_asset_id INT NULL,
    destination_asset_id INT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    confidence DOUBLE DEFAULT 0.8,
    description TEXT NOT NULL,
    evidence JSON NULL,
    status VARCHAR(20) DEFAULT 'UNPROCESSED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_se_type FOREIGN KEY (event_type_id) REFERENCES event_types(id),
    CONSTRAINT fk_se_src_asset FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_se_dst_asset FOREIGN KEY (destination_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    INDEX idx_se_ts_sev (timestamp, severity),
    INDEX idx_se_assets (source_asset_id, destination_asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
