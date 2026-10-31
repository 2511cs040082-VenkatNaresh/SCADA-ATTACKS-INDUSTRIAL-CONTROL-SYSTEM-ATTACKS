-- Migration 025: Defense & Response Engine (Phase 14)

-- 1. Response Plans Table
CREATE TABLE IF NOT EXISTS response_plans (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    plan_uuid VARCHAR(36) NOT NULL UNIQUE,
    response_number VARCHAR(50) NOT NULL UNIQUE,
    incident_id BIGINT NULL,
    alert_id BIGINT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    reason TEXT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'P2',
    severity VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    status VARCHAR(30) NOT NULL DEFAULT 'DRAFT',
    risk_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    environment VARCHAR(50) NOT NULL DEFAULT 'LAB_SIMULATION',
    simulation_mode BOOLEAN NOT NULL DEFAULT TRUE,
    created_by INT NULL,
    approved_by INT NULL,
    approved_at DATETIME NULL,
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    failed_at DATETIME NULL,
    cancelled_at DATETIME NULL,
    rollback_status VARCHAR(30) NOT NULL DEFAULT 'NONE',
    metadata_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_rp_number (response_number),
    INDEX idx_rp_incident (incident_id),
    INDEX idx_rp_alert (alert_id),
    INDEX idx_rp_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Response Recommendations Table
CREATE TABLE IF NOT EXISTS response_recommendations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    recommendation_uuid VARCHAR(36) NOT NULL UNIQUE,
    incident_id BIGINT NULL,
    alert_id BIGINT NULL,
    technique_id VARCHAR(50) NULL,
    recommendation_type VARCHAR(50) NOT NULL,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    reason TEXT NULL,
    priority VARCHAR(20) NOT NULL DEFAULT 'P2',
    risk_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    confidence DOUBLE NOT NULL DEFAULT 0.85,
    recommended_playbook_id INT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    expires_at DATETIME NULL,
    metadata_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rr_incident (incident_id),
    INDEX idx_rr_alert (alert_id),
    INDEX idx_rr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Response Plan Actions Table
CREATE TABLE IF NOT EXISTS response_plan_actions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    action_uuid VARCHAR(36) NOT NULL UNIQUE,
    response_plan_id BIGINT NOT NULL,
    action_type VARCHAR(60) NOT NULL,
    sequence_number INT NOT NULL DEFAULT 1,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    description TEXT NULL,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    approval_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    execution_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    started_at DATETIME NULL,
    completed_at DATETIME NULL,
    failed_at DATETIME NULL,
    rollback_supported BOOLEAN NOT NULL DEFAULT TRUE,
    rollback_status VARCHAR(30) NOT NULL DEFAULT 'NONE',
    result_json JSON NULL,
    error_message TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_rpa_plan FOREIGN KEY (response_plan_id) REFERENCES response_plans(id) ON DELETE CASCADE,
    INDEX idx_rpa_plan (response_plan_id),
    INDEX idx_rpa_target (target_type, target_id),
    INDEX idx_rpa_status (execution_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Response Approvals Table
CREATE TABLE IF NOT EXISTS response_approvals (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    approval_uuid VARCHAR(36) NOT NULL UNIQUE,
    response_plan_id BIGINT NOT NULL,
    action_id BIGINT NULL,
    requested_by INT NOT NULL,
    approved_by INT NULL,
    approval_type VARCHAR(50) NOT NULL DEFAULT 'SINGLE_APPROVAL',
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    reason TEXT NULL,
    requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    approved_at DATETIME NULL,
    rejected_at DATETIME NULL,
    expires_at DATETIME NULL,
    metadata_json JSON NULL,
    CONSTRAINT fk_ra_plan FOREIGN KEY (response_plan_id) REFERENCES response_plans(id) ON DELETE CASCADE,
    INDEX idx_ra_plan (response_plan_id),
    INDEX idx_ra_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Response Action Evidence Table
CREATE TABLE IF NOT EXISTS response_action_evidence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    response_plan_id BIGINT NOT NULL,
    action_id BIGINT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    evidence_id VARCHAR(100) NOT NULL,
    description TEXT NULL,
    payload_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_rae_plan (response_plan_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Response Policies Table
CREATE TABLE IF NOT EXISTS response_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(60) NOT NULL UNIQUE,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    requires_approval BOOLEAN NOT NULL DEFAULT TRUE,
    approval_type VARCHAR(50) NOT NULL DEFAULT 'SINGLE_APPROVAL',
    requires_two_person BOOLEAN NOT NULL DEFAULT FALSE,
    simulation_only BOOLEAN NOT NULL DEFAULT TRUE,
    allow_auto_execute BOOLEAN NOT NULL DEFAULT FALSE,
    max_retries INT NOT NULL DEFAULT 0,
    rollback_supported BOOLEAN NOT NULL DEFAULT TRUE,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Extend Existing response_playbooks and response_executions
ALTER TABLE response_playbooks
  ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'MODBUS',
  ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'HIGH',
  ADD COLUMN IF NOT EXISTS applicable_incident_types JSON NULL,
  ADD COLUMN IF NOT EXISTS applicable_asset_types JSON NULL,
  ADD COLUMN IF NOT EXISTS applicable_mitre_techniques JSON NULL,
  ADD COLUMN IF NOT EXISTS required_role VARCHAR(50) DEFAULT 'SECURITY_ANALYST',
  ADD COLUMN IF NOT EXISTS approval_type VARCHAR(50) DEFAULT 'SINGLE_APPROVAL',
  ADD COLUMN IF NOT EXISTS is_simulation_only BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE response_executions
  ADD COLUMN IF NOT EXISTS response_plan_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS action_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS execution_number INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS duration_ms INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS error_code VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS error_message TEXT NULL,
  ADD COLUMN IF NOT EXISTS rollback_available BOOLEAN DEFAULT TRUE;
