-- Migration 020: Behavioral & Statistical Anomaly Detection Engine Schema

CREATE TABLE IF NOT EXISTS behavioral_baselines (
    id INT AUTO_INCREMENT PRIMARY KEY,
    baseline_uuid VARCHAR(100) NOT NULL UNIQUE,
    entity_type VARCHAR(50) NOT NULL, -- ASSET, COMMUNICATION_PAIR, PROTOCOL, PROCESS, TIME_PERIOD
    entity_id VARCHAR(100) NOT NULL, -- e.g., PLC-001, HMI-001->PLC-001, tank_level
    feature VARCHAR(100) NOT NULL, -- request_rate, byte_rate, latency, process_value, write_frequency
    context VARCHAR(100) NOT NULL DEFAULT 'NORMAL', -- NORMAL, STARTUP, HIGH_LOAD, MAINTENANCE
    time_window VARCHAR(20) NOT NULL DEFAULT '1m',
    mean DOUBLE NOT NULL DEFAULT 0.0,
    median DOUBLE NOT NULL DEFAULT 0.0,
    stddev DOUBLE NOT NULL DEFAULT 0.0,
    mad DOUBLE NOT NULL DEFAULT 0.0,
    iqr DOUBLE NOT NULL DEFAULT 0.0,
    min_val DOUBLE NOT NULL DEFAULT 0.0,
    max_val DOUBLE NOT NULL DEFAULT 0.0,
    p50 DOUBLE NOT NULL DEFAULT 0.0,
    p90 DOUBLE NOT NULL DEFAULT 0.0,
    p95 DOUBLE NOT NULL DEFAULT 0.0,
    p99 DOUBLE NOT NULL DEFAULT 0.0,
    sample_count INT NOT NULL DEFAULT 0,
    quality VARCHAR(30) NOT NULL DEFAULT 'MEDIUM', -- HIGH, MEDIUM, LOW
    state VARCHAR(30) NOT NULL DEFAULT 'LEARNING', -- INSUFFICIENT_DATA, LEARNING, STABLE, FROZEN, STALE, INVALID
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_bb_entity_feature (entity_type, entity_id, feature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS behavioral_features (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    feature_uuid VARCHAR(100) NOT NULL UNIQUE,
    timestamp DATETIME(3) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    feature VARCHAR(100) NOT NULL,
    value DOUBLE NOT NULL,
    window VARCHAR(20) NOT NULL DEFAULT '1m',
    context VARCHAR(100) NOT NULL DEFAULT 'NORMAL',
    source VARCHAR(50) NOT NULL DEFAULT 'TELEMETRY',
    quality VARCHAR(30) NOT NULL DEFAULT 'GOOD',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_bf_ts (timestamp),
    INDEX idx_bf_entity (entity_type, entity_id, feature)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS behavioral_anomaly_results (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    anomaly_uuid VARCHAR(100) NOT NULL UNIQUE,
    timestamp DATETIME(3) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    asset_id INT NULL,
    source_asset_id INT NULL,
    destination_asset_id INT NULL,
    protocol VARCHAR(50) NOT NULL DEFAULT 'MODBUS_TCP',
    feature VARCHAR(100) NOT NULL,
    observed_value DOUBLE NOT NULL,
    expected_value DOUBLE NOT NULL,
    baseline_id INT NULL,
    baseline_version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    detector VARCHAR(50) NOT NULL, -- Z_SCORE, MODIFIED_Z_SCORE, IQR, PERCENTILE, WEIGHTED_MULTIVARIATE
    score DOUBLE NOT NULL, -- 0-100 normalized anomaly score
    confidence VARCHAR(20) NOT NULL DEFAULT 'HIGH', -- HIGH, MEDIUM, LOW
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM', -- LOW, MEDIUM, HIGH, CRITICAL
    status VARCHAR(30) NOT NULL DEFAULT 'NEW', -- NEW, OBSERVED, REVIEWING, BENIGN, CONFIRMED_ANOMALY, CORRELATED, SUPPRESSED, RESOLVED
    explanation TEXT NULL,
    evidence_json JSON NULL,
    metadata JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bar_src_asset FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_bar_dst_asset FOREIGN KEY (destination_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    INDEX idx_bar_ts (timestamp),
    INDEX idx_bar_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS behavioral_suppressions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NULL,
    feature VARCHAR(100) NULL,
    detector VARCHAR(50) NULL,
    cooldown_until DATETIME NOT NULL,
    reason TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bsup_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS behavioral_clusters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cluster_uuid VARCHAR(100) NOT NULL UNIQUE,
    time_range_start DATETIME(3) NOT NULL,
    time_range_end DATETIME(3) NOT NULL,
    assets_json JSON NULL,
    features_json JSON NULL,
    anomaly_count INT NOT NULL DEFAULT 1,
    combined_score DOUBLE NOT NULL DEFAULT 50.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed initial baselines for SCADA Laboratory assets
INSERT INTO behavioral_baselines
(baseline_uuid, entity_type, entity_id, feature, context, time_window, mean, median, stddev, mad, iqr, min_val, max_val, p50, p90, p95, p99, sample_count, quality, state, version)
VALUES
('BASE-001-REQ-RATE', 'ASSET', 'HMI-001', 'request_rate', 'NORMAL', '1m', 2.30, 2.20, 0.45, 0.30, 0.50, 1.00, 4.00, 2.20, 2.90, 3.10, 3.80, 1200, 'HIGH', 'STABLE', '1.0.0'),
('BASE-002-BYTE-RATE', 'ASSET', 'HMI-001', 'byte_rate', 'NORMAL', '1m', 256.0, 250.0, 42.0, 30.0, 50.0, 180.0, 410.0, 250.0, 310.0, 340.0, 390.0, 1200, 'HIGH', 'STABLE', '1.0.0'),
('BASE-003-LATENCY', 'PROTOCOL', 'MODBUS_TCP', 'average_latency', 'NORMAL', '1m', 12.50, 11.80, 2.10, 1.50, 2.50, 8.00, 22.00, 11.80, 15.20, 16.80, 19.50, 1200, 'HIGH', 'STABLE', '1.0.0'),
('BASE-004-WRITE-FREQ', 'ASSET', 'HMI-001', 'write_frequency', 'NORMAL', '1m', 0.15, 0.10, 0.08, 0.05, 0.10, 0.00, 0.50, 0.10, 0.25, 0.30, 0.45, 1200, 'HIGH', 'STABLE', '1.0.0'),
('BASE-005-TANK-LEVEL', 'PROCESS', 'tank_level', 'NORMAL', '1m', 50.20, 50.00, 2.40, 1.80, 3.20, 42.00, 58.00, 50.00, 53.50, 54.80, 57.20, 1200, 'HIGH', 'STABLE', '1.0.0'),
('BASE-006-PRESSURE', 'PROCESS', 'system_pressure', 'NORMAL', '1m', 4.20, 4.15, 0.35, 0.25, 0.40, 3.20, 5.20, 4.15, 4.65, 4.80, 5.10, 1200, 'HIGH', 'STABLE', '1.0.0')
ON DUPLICATE KEY UPDATE
  mean = VALUES(mean),
  stddev = VALUES(stddev),
  state = VALUES(state);
