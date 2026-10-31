-- Migration 006: High-Frequency Process Telemetry

CREATE TABLE IF NOT EXISTS telemetry_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_name VARCHAR(100) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS telemetry_metrics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    metric_name VARCHAR(100) NOT NULL,
    metric_type VARCHAR(50) NOT NULL,
    unit VARCHAR(20) NULL,
    normal_min DOUBLE NULL,
    normal_max DOUBLE NULL,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tm_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT uk_asset_metric UNIQUE (asset_id, metric_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS telemetry_readings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    metric_id INT NOT NULL,
    timestamp DATETIME(3) NOT NULL,
    value DOUBLE NOT NULL,
    quality VARCHAR(20) DEFAULT 'GOOD',
    source VARCHAR(50) DEFAULT 'SENSOR',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tr_metric FOREIGN KEY (metric_id) REFERENCES telemetry_metrics(id) ON DELETE CASCADE,
    INDEX idx_tr_metric_ts (metric_id, timestamp),
    INDEX idx_tr_ts (timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
