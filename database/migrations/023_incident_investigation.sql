-- Migration 023: Incident Investigation & Case Management Engine

-- 1. Extend incidents table with incident numbering, category, impact, and root cause fields
ALTER TABLE incidents
  ADD COLUMN IF NOT EXISTS incident_uuid VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'UNAUTHORIZED_ACTIVITY',
  ADD COLUMN IF NOT EXISTS confidence DOUBLE DEFAULT 0.85,
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) NOT NULL DEFAULT 'ALERT',
  ADD COLUMN IF NOT EXISTS detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS closed_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS root_cause TEXT NULL,
  ADD COLUMN IF NOT EXISTS impact_summary TEXT NULL,
  ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'LAB_SIMULATION',
  ADD COLUMN IF NOT EXISTS metadata_json JSON NULL;

-- Remove legacy CHECK constraint on status if exists (MySQL 8 syntax safe)
ALTER TABLE incidents DROP CONSTRAINT IF EXISTS chk_inc_status;

-- Add indexes for fast SOC searches
CREATE INDEX IF NOT EXISTS idx_inc_num ON incidents(incident_number);
CREATE INDEX IF NOT EXISTS idx_inc_status_sev ON incidents(status, severity);
CREATE INDEX IF NOT EXISTS idx_inc_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_inc_cat ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_inc_first_last ON incidents(first_seen, last_seen);

-- 2. Incident Alerts Table (Links alerts to incident)
CREATE TABLE IF NOT EXISTS incident_alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    alert_id BIGINT NOT NULL,
    relationship_type VARCHAR(30) NOT NULL DEFAULT 'PRIMARY',
    added_by INT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    CONSTRAINT fk_ia_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    CONSTRAINT fk_ia_alt FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    INDEX idx_ia_inc (incident_id),
    INDEX idx_ia_alt (alert_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Incident Assets Table (Assets involved in incident case)
CREATE TABLE IF NOT EXISTS incident_assets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    asset_id INT NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'PRIMARY',
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    evidence_count INT NOT NULL DEFAULT 1,
    impact_indicator VARCHAR(30) DEFAULT 'MEDIUM',
    notes TEXT NULL,
    CONSTRAINT fk_ias_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    CONSTRAINT fk_ias_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_ias_inc (incident_id),
    INDEX idx_ias_asset (asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Incident Timeline Table (Normalized chronological timeline)
CREATE TABLE IF NOT EXISTS incident_timeline (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    event_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(100) NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    severity VARCHAR(20) DEFAULT 'MEDIUM',
    asset_id INT NULL,
    protocol VARCHAR(30) DEFAULT 'MODBUS_TCP',
    metadata_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_itl_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    INDEX idx_itl_inc_ts (incident_id, timestamp ASC),
    INDEX idx_itl_type (event_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Incident Evidence Table (SHA-256 evidence records)
CREATE TABLE IF NOT EXISTS incident_evidence_store (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    evidence_uuid VARCHAR(36) NOT NULL UNIQUE,
    incident_id BIGINT NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(100) NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    hash VARCHAR(64) NULL,
    hash_algorithm VARCHAR(20) DEFAULT 'SHA-256',
    collected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    collected_by INT NULL,
    integrity_status VARCHAR(20) NOT NULL DEFAULT 'VERIFIED',
    metadata_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ies_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    INDEX idx_ies_inc (incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Incident Tasks Table (Analyst action items)
CREATE TABLE IF NOT EXISTS incident_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    task_uuid VARCHAR(36) NOT NULL UNIQUE,
    incident_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    assigned_to INT NULL,
    priority VARCHAR(10) NOT NULL DEFAULT 'P3',
    status VARCHAR(20) NOT NULL DEFAULT 'TODO',
    due_at DATETIME NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    CONSTRAINT fk_itask_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    INDEX idx_itask_inc (incident_id),
    INDEX idx_itask_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Incident Hypotheses Table (Analyst hypotheses)
CREATE TABLE IF NOT EXISTS incident_hypotheses (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    hypothesis_uuid VARCHAR(36) NOT NULL UNIQUE,
    incident_id BIGINT NOT NULL,
    hypothesis TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN',
    confidence DOUBLE DEFAULT 0.5,
    evidence_for TEXT NULL,
    evidence_against TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ihypo_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    INDEX idx_ihypo_inc (incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Incident Findings Table (Facts & findings log)
CREATE TABLE IF NOT EXISTS incident_findings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    finding_uuid VARCHAR(36) NOT NULL UNIQUE,
    incident_id BIGINT NOT NULL,
    finding TEXT NOT NULL,
    category VARCHAR(50) NOT NULL DEFAULT 'OBSERVED_FACT',
    confidence DOUBLE DEFAULT 0.9,
    evidence_json JSON NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ifind_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    INDEX idx_ifind_inc (incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Incident Impact Assessment Table
CREATE TABLE IF NOT EXISTS incident_impact (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL UNIQUE,
    process_impact VARCHAR(20) DEFAULT 'LOW',
    asset_impact VARCHAR(20) DEFAULT 'LOW',
    network_impact VARCHAR(20) DEFAULT 'LOW',
    availability_impact VARCHAR(20) DEFAULT 'LOW',
    integrity_impact VARCHAR(20) DEFAULT 'LOW',
    confidentiality_impact VARCHAR(20) DEFAULT 'LOW',
    safety_indicator BOOLEAN DEFAULT FALSE,
    operational_notes TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_iimp_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Incident History Audit Table
CREATE TABLE IF NOT EXISTS incident_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_by INT NULL,
    change_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ihist_inc FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    INDEX idx_ihist_inc (incident_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
