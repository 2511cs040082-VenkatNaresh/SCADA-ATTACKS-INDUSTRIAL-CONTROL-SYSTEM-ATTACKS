-- ICS-SHIELD Unified Database Schema (Phase 2 Full Model)
-- Target Engine: MySQL 8.0+
-- Database Name: ics_shield

CREATE DATABASE IF NOT EXISTS ics_shield DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ics_shield;

-- 1. Identity & Access Control (RBAC)
CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    role_uuid VARCHAR(36) NOT NULL UNIQUE,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS permissions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL DEFAULT 'SYSTEM',
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS role_permissions (
    role_id INT NOT NULL,
    permission_id INT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_uuid VARCHAR(36) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    last_login DATETIME NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS user_roles (
    user_id INT NOT NULL,
    role_id INT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_ur_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_ur_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_uuid VARCHAR(36) NOT NULL UNIQUE,
    user_id INT NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    expires_at DATETIME NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sessions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. ICS Asset Management
CREATE TABLE IF NOT EXISTS asset_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(20) NOT NULL UNIQUE,
    description VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS assets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_uuid VARCHAR(36) NOT NULL UNIQUE,
    asset_name VARCHAR(100) NOT NULL UNIQUE,
    hostname VARCHAR(100) NULL,
    ip_address VARCHAR(45) NOT NULL,
    mac_address VARCHAR(17) NULL,
    asset_type_id INT NOT NULL,
    vendor VARCHAR(100) NULL,
    model VARCHAR(100) NULL,
    firmware_version VARCHAR(50) NULL,
    zone_id INT NULL,
    criticality VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    status VARCHAR(20) NOT NULL DEFAULT 'UNKNOWN',
    description TEXT NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_assets_type FOREIGN KEY (asset_type_id) REFERENCES asset_types(id),
    CONSTRAINT fk_assets_zone FOREIGN KEY (zone_id) REFERENCES asset_zones(id) ON DELETE SET NULL,
    CONSTRAINT chk_asset_criticality CHECK (criticality IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_interfaces (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    interface_name VARCHAR(50) NOT NULL,
    ip_address VARCHAR(45) NULL,
    mac_address VARCHAR(17) NULL,
    interface_type VARCHAR(50) NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_interfaces_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_protocols (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    protocol_name VARCHAR(50) NOT NULL,
    port INT NULL,
    is_default BOOLEAN DEFAULT FALSE,
    CONSTRAINT fk_asset_protocols_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Network & Purdue Model Topology
CREATE TABLE IF NOT EXISTS network_zones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    purdue_level INT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS network_segments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    zone_id INT NOT NULL,
    segment_name VARCHAR(100) NOT NULL,
    cidr_block VARCHAR(45) NOT NULL,
    vlan_id INT NULL,
    description TEXT NULL,
    CONSTRAINT fk_net_seg_zone FOREIGN KEY (zone_id) REFERENCES network_zones(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS network_connections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_asset_id INT NOT NULL,
    destination_asset_id INT NOT NULL,
    protocol VARCHAR(50) NULL,
    port INT NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_net_conn_src FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_net_conn_dst FOREIGN KEY (destination_asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_relationships (
    id INT AUTO_INCREMENT PRIMARY KEY,
    parent_asset_id INT NOT NULL,
    child_asset_id INT NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rel_parent FOREIGN KEY (parent_asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_rel_child FOREIGN KEY (child_asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Industrial Protocol Metadata & Telemetry Events
CREATE TABLE IF NOT EXISTS protocols (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    default_port INT NULL,
    layer VARCHAR(50) NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS protocol_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_uuid VARCHAR(36) NOT NULL UNIQUE,
    protocol_id INT NOT NULL,
    source_asset_id INT NULL,
    destination_asset_id INT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_ps_proto FOREIGN KEY (protocol_id) REFERENCES protocols(id),
    CONSTRAINT fk_ps_src FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_ps_dst FOREIGN KEY (destination_asset_id) REFERENCES assets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS protocol_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    event_uuid VARCHAR(36) NOT NULL UNIQUE,
    timestamp DATETIME(3) NOT NULL,
    protocol_id INT NOT NULL,
    source_asset_id INT NULL,
    destination_asset_id INT NULL,
    source_ip VARCHAR(45) NOT NULL,
    destination_ip VARCHAR(45) NOT NULL,
    source_port INT NULL,
    destination_port INT NULL,
    function_code VARCHAR(50) NULL,
    request_type VARCHAR(100) NULL,
    response_status VARCHAR(50) NULL,
    payload_metadata JSON NULL,
    anomaly_flag BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pe_proto FOREIGN KEY (protocol_id) REFERENCES protocols(id),
    CONSTRAINT fk_pe_src FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_pe_dst FOREIGN KEY (destination_asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    INDEX idx_pe_ts_proto (timestamp, protocol_id),
    INDEX idx_pe_ips (source_ip, destination_ip)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. High-Frequency Process Telemetry
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

-- 6. Security Events & Anomaly Categorization
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

-- 7. Detection Engine Rules & Results
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
    detection_type VARCHAR(50) NOT NULL,
    confidence DOUBLE DEFAULT 0.8,
    risk_score DOUBLE DEFAULT 50.0,
    explanation TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dres_event FOREIGN KEY (event_id) REFERENCES security_events(id) ON DELETE CASCADE,
    CONSTRAINT fk_dres_rule FOREIGN KEY (rule_id) REFERENCES detection_rules(id) ON DELETE SET NULL,
    INDEX idx_dres_event (event_id),
    INDEX idx_dres_rule (rule_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Machine Learning Models & Inference
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

-- 9. Alert Management
CREATE TABLE IF NOT EXISTS alert_statuses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(100) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alerts (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_uuid VARCHAR(36) NOT NULL UNIQUE,
    detection_id BIGINT NOT NULL,
    asset_id INT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    confidence DOUBLE DEFAULT 0.8,
    risk_score DOUBLE DEFAULT 50.0,
    status VARCHAR(30) NOT NULL DEFAULT 'NEW',
    assigned_to INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    CONSTRAINT fk_alerts_detection FOREIGN KEY (detection_id) REFERENCES detection_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_alerts_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    CONSTRAINT fk_alerts_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_alerts_status_sev (status, severity),
    INDEX idx_alerts_asset (asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS alert_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    alert_id BIGINT NOT NULL,
    old_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    changed_by INT NULL,
    change_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ah_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    CONSTRAINT fk_ah_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Incident Management
CREATE TABLE IF NOT EXISTS incidents (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_number VARCHAR(64) NOT NULL UNIQUE,
    title VARCHAR(255) NOT NULL,
    description TEXT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    status VARCHAR(30) NOT NULL DEFAULT 'DETECTED',
    priority VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    created_by INT NULL,
    assigned_to INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    resolved_at DATETIME NULL,
    CONSTRAINT fk_inc_creator FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT fk_inc_assignee FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT chk_inc_status CHECK (status IN ('DETECTED', 'TRIAGED', 'INVESTIGATING', 'CONTAINMENT_RECOMMENDED', 'MITIGATION', 'VALIDATION', 'RESOLVED', 'CLOSED'))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS incident_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    event_id BIGINT NOT NULL,
    added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ie_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    CONSTRAINT fk_ie_event FOREIGN KEY (event_id) REFERENCES security_events(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS incident_assignments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    user_id INT NOT NULL,
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ia_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    CONSTRAINT fk_ia_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS incident_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    author_id INT NOT NULL,
    note_text TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_in_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    CONSTRAINT fk_in_author FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS incident_evidence (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    evidence_path VARCHAR(255) NULL,
    metadata JSON NULL,
    uploaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_iev_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. MITRE ATT&CK for ICS (v14)
CREATE TABLE IF NOT EXISTS mitre_tactics (
    id INT AUTO_INCREMENT PRIMARY KEY,
    tactic_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mitre_techniques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    technique_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    tactic_id VARCHAR(50) NOT NULL,
    description TEXT NULL,
    version VARCHAR(20) DEFAULT 'v14',
    reference_url VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS mitre_subtechniques (
    id INT AUTO_INCREMENT PRIMARY KEY,
    subtechnique_id VARCHAR(50) NOT NULL UNIQUE,
    parent_technique_id INT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    CONSTRAINT fk_mst_parent FOREIGN KEY (parent_technique_id) REFERENCES mitre_techniques(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS detection_mitre_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    detection_id BIGINT NOT NULL,
    technique_id INT NOT NULL,
    confidence DOUBLE DEFAULT 0.9,
    CONSTRAINT fk_dmm_detection FOREIGN KEY (detection_id) REFERENCES detection_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_dmm_technique FOREIGN KEY (technique_id) REFERENCES mitre_techniques(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS incident_mitre_mappings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    incident_id BIGINT NOT NULL,
    technique_id INT NOT NULL,
    CONSTRAINT fk_imm_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE CASCADE,
    CONSTRAINT fk_imm_technique FOREIGN KEY (technique_id) REFERENCES mitre_techniques(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 12. Defensive Response Playbooks & Actions
CREATE TABLE IF NOT EXISTS response_playbooks (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playbook_uuid VARCHAR(36) NOT NULL UNIQUE,
    title VARCHAR(150) NOT NULL,
    description TEXT NULL,
    trigger_condition JSON NULL,
    is_simulated BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS response_steps (
    id INT AUTO_INCREMENT PRIMARY KEY,
    playbook_id INT NOT NULL,
    step_order INT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    description TEXT NULL,
    action_config JSON NULL,
    CONSTRAINT fk_rs_playbook FOREIGN KEY (playbook_id) REFERENCES response_playbooks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS response_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    is_controlled BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS response_executions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    execution_uuid VARCHAR(36) NOT NULL UNIQUE,
    playbook_id INT NOT NULL,
    incident_id BIGINT NULL,
    alert_id BIGINT NULL,
    executed_by INT NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    result JSON NULL,
    executed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_re_playbook FOREIGN KEY (playbook_id) REFERENCES response_playbooks(id),
    CONSTRAINT fk_re_incident FOREIGN KEY (incident_id) REFERENCES incidents(id) ON DELETE SET NULL,
    CONSTRAINT fk_re_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE SET NULL,
    CONSTRAINT fk_re_user FOREIGN KEY (executed_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 13. Attack Simulation Framework
CREATE TABLE IF NOT EXISTS simulation_scenarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scenario_uuid VARCHAR(36) NOT NULL UNIQUE,
    scenario_name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    enabled BOOLEAN DEFAULT TRUE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS simulation_runs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    run_uuid VARCHAR(36) NOT NULL UNIQUE,
    scenario_id INT NOT NULL,
    start_time DATETIME NOT NULL,
    end_time DATETIME NULL,
    status VARCHAR(20) DEFAULT 'COMPLETED',
    events_generated INT DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sr_scenario FOREIGN KEY (scenario_id) REFERENCES simulation_scenarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS simulation_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    run_id BIGINT NOT NULL,
    event_type VARCHAR(50) NOT NULL,
    payload JSON NOT NULL,
    timestamp DATETIME(3) NOT NULL,
    CONSTRAINT fk_se_run FOREIGN KEY (run_id) REFERENCES simulation_runs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 14. Audit Logging
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

-- 15. System Settings
CREATE TABLE IF NOT EXISTS system_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NOT NULL,
    setting_type VARCHAR(20) DEFAULT 'STRING',
    description TEXT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
