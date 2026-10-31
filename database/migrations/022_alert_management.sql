-- Migration 022: Real-Time Alert Management & Correlation Engine Foundation

-- 1. Extend alerts table with priority, correlation, SLA, and multi-source tracking
ALTER TABLE alerts
  ADD COLUMN IF NOT EXISTS priority VARCHAR(10) NOT NULL DEFAULT 'P3',
  ADD COLUMN IF NOT EXISTS source_type VARCHAR(50) NOT NULL DEFAULT 'RULE_DETECTION',
  ADD COLUMN IF NOT EXISTS source_detection_id VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'SECURITY_ANOMALY',
  ADD COLUMN IF NOT EXISTS source_asset_id INT NULL,
  ADD COLUMN IF NOT EXISTS destination_asset_id INT NULL,
  ADD COLUMN IF NOT EXISTS protocol VARCHAR(30) NULL DEFAULT 'MODBUS_TCP',
  ADD COLUMN IF NOT EXISTS rule_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS model_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS behavioral_anomaly_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS evidence_json JSON NULL,
  ADD COLUMN IF NOT EXISTS metadata_json JSON NULL,
  ADD COLUMN IF NOT EXISTS occurrence_count INT NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS dedup_key VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS group_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS acknowledged_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS acknowledged_by INT NULL,
  ADD COLUMN IF NOT EXISTS duplicate_of_alert_id BIGINT NULL;

-- Add indexes for efficient SOC queries
CREATE INDEX IF NOT EXISTS idx_alerts_priority ON alerts(priority);
CREATE INDEX IF NOT EXISTS idx_alerts_source_type ON alerts(source_type);
CREATE INDEX IF NOT EXISTS idx_alerts_dedup ON alerts(dedup_key);
CREATE INDEX IF NOT EXISTS idx_alerts_src_dst ON alerts(source_asset_id, destination_asset_id);
CREATE INDEX IF NOT EXISTS idx_alerts_first_last ON alerts(first_seen, last_seen);

-- 2. Alert Correlations Table
CREATE TABLE IF NOT EXISTS alert_correlations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    correlation_uuid VARCHAR(36) NOT NULL UNIQUE,
    primary_alert_id BIGINT NOT NULL,
    related_alert_id BIGINT NOT NULL,
    correlation_type VARCHAR(50) NOT NULL DEFAULT 'TIME_ASSET_CORRELATION',
    strength DOUBLE NOT NULL DEFAULT 0.85,
    explanation TEXT NOT NULL,
    evidence_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ac_primary FOREIGN KEY (primary_alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    CONSTRAINT fk_ac_related FOREIGN KEY (related_alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    INDEX idx_ac_primary (primary_alert_id),
    INDEX idx_ac_related (related_alert_id),
    INDEX idx_ac_type (correlation_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Alert Groups Table
CREATE TABLE IF NOT EXISTS alert_groups (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    group_uuid VARCHAR(36) NOT NULL UNIQUE,
    group_key VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    priority VARCHAR(10) NOT NULL DEFAULT 'P3',
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    asset_scope VARCHAR(255) NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    alert_count INT NOT NULL DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_ag_key (group_key),
    INDEX idx_ag_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Alert Assignments Table
CREATE TABLE IF NOT EXISTS alert_assignments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_id BIGINT NOT NULL,
    assigned_to INT NOT NULL,
    assigned_by INT NULL,
    assignment_state VARCHAR(30) NOT NULL DEFAULT 'ASSIGNED',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_aa_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    CONSTRAINT fk_aa_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_aa_assigner FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_aa_alert (alert_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Alert Suppressions Table
CREATE TABLE IF NOT EXISTS alert_suppressions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    suppression_uuid VARCHAR(36) NOT NULL UNIQUE,
    rule_name VARCHAR(100) NOT NULL,
    target_asset_id INT NULL,
    target_rule_id BIGINT NULL,
    target_category VARCHAR(50) NULL,
    maintenance_window_start DATETIME NULL,
    maintenance_window_end DATETIME NULL,
    reason TEXT NOT NULL,
    created_by INT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_as_asset FOREIGN KEY (target_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    INDEX idx_as_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Alert Notifications Table
CREATE TABLE IF NOT EXISTS alert_notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    notification_uuid VARCHAR(36) NOT NULL UNIQUE,
    alert_id BIGINT NOT NULL,
    channel VARCHAR(20) NOT NULL DEFAULT 'IN_APP',
    notification_type VARCHAR(50) NOT NULL DEFAULT 'NEW_ALERT',
    recipient VARCHAR(255) NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SENT',
    read_status BOOLEAN NOT NULL DEFAULT FALSE,
    sent_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    error_message TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_an_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    INDEX idx_an_alert (alert_id),
    INDEX idx_an_read (read_status),
    INDEX idx_an_channel (channel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Alert Analyst Notes Table
CREATE TABLE IF NOT EXISTS alert_notes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_id BIGINT NOT NULL,
    author_id INT NULL,
    author_username VARCHAR(100) NOT NULL DEFAULT 'SOC Analyst',
    note TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_anotes_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    INDEX idx_anotes_alert (alert_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Alert SLA Tracking Table
CREATE TABLE IF NOT EXISTS alert_sla (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_id BIGINT NOT NULL UNIQUE,
    priority VARCHAR(10) NOT NULL DEFAULT 'P3',
    target_ack_minutes INT NOT NULL DEFAULT 15,
    target_resolve_minutes INT NOT NULL DEFAULT 120,
    ack_deadline DATETIME NOT NULL,
    resolution_deadline DATETIME NOT NULL,
    acknowledged_at DATETIME NULL,
    resolved_at DATETIME NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_asla_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    INDEX idx_asla_status (status),
    INDEX idx_asla_ack_dl (ack_deadline),
    INDEX idx_asla_res_dl (resolution_deadline)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
