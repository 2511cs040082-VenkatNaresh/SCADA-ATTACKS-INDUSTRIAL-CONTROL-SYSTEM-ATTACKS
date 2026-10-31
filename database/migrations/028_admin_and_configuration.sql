-- Migration 028: Administration & Configuration Center Subsystem

-- 1. Extend system_settings with metadata, category, defaults, and bounds
ALTER TABLE system_settings 
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'General',
  ADD COLUMN IF NOT EXISTS setting_type VARCHAR(20) DEFAULT 'STRING',
  ADD COLUMN IF NOT EXISTS default_value TEXT NULL,
  ADD COLUMN IF NOT EXISTS min_value DOUBLE NULL,
  ADD COLUMN IF NOT EXISTS max_value DOUBLE NULL,
  ADD COLUMN IF NOT EXISTS is_dangerous TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS requires_restart TINYINT(1) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS validation_regex VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS version INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS updated_by INT NULL;

-- 2. Configuration Change History (Audited Versioning & Rollback)
CREATE TABLE IF NOT EXISTS configuration_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    history_uuid VARCHAR(36) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL,
    setting_key VARCHAR(100) NOT NULL,
    previous_value TEXT NULL,
    new_value TEXT NOT NULL,
    version INT NOT NULL DEFAULT 1,
    change_reason TEXT NULL,
    changed_by INT NULL,
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ch_user FOREIGN KEY (changed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_ch_key (setting_key),
    INDEX idx_ch_cat (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Data Retention Policies Table
CREATE TABLE IF NOT EXISTS retention_policies (
    id INT AUTO_INCREMENT PRIMARY KEY,
    policy_uuid VARCHAR(36) NOT NULL UNIQUE,
    category VARCHAR(50) NOT NULL UNIQUE,
    retention_days INT NOT NULL DEFAULT 30,
    is_enabled TINYINT(1) NOT NULL DEFAULT 1,
    description TEXT NULL,
    preserve_evidence_override TINYINT(1) NOT NULL DEFAULT 1,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    updated_by INT NULL,
    CONSTRAINT fk_ret_user FOREIGN KEY (updated_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Simulation Scenario Lifecycle & Approval Table
CREATE TABLE IF NOT EXISTS simulation_scenario_lifecycle (
    id INT AUTO_INCREMENT PRIMARY KEY,
    scenario_id VARCHAR(100) NOT NULL UNIQUE,
    status VARCHAR(30) NOT NULL DEFAULT 'APPROVED',
    version VARCHAR(20) NOT NULL DEFAULT '1.0.0',
    is_approved TINYINT(1) NOT NULL DEFAULT 1,
    approved_by INT NULL,
    approved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    notes TEXT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sim_app_user FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Sessions table extension for revocation and activity tracking
ALTER TABLE sessions
  ADD COLUMN IF NOT EXISTS is_revoked TINYINT(1) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_activity DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE users
  ADD COLUMN IF NOT EXISTS last_activity DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 6. Seed Default System Configurations across 16 categories
INSERT INTO system_settings (setting_key, category, setting_value, setting_type, default_value, description, min_value, max_value, is_dangerous, requires_restart) VALUES
  ('system_name', 'General', 'ICS-SHIELD Defensive Platform', 'STRING', 'ICS-SHIELD Defensive Platform', 'Name of the SCADA/ICS Defense Platform', NULL, NULL, 0, 0),
  ('organization_name', 'General', 'Industrial Defense Corp', 'STRING', 'Industrial Defense Corp', 'Organization or Facility Name', NULL, NULL, 0, 0),
  ('environment_mode', 'General', 'LAB_SIMULATION', 'STRING', 'LAB_SIMULATION', 'Current operating environment (LAB_SIMULATION or LIVE)', NULL, NULL, 1, 0),
  ('maintenance_mode', 'General', 'false', 'BOOLEAN', 'false', 'Enable system-wide maintenance mode', NULL, NULL, 1, 0),

  ('session_timeout_minutes', 'Security', '60', 'NUMBER', '60', 'User session inactivity timeout in minutes', 5, 1440, 0, 0),
  ('refresh_token_lifetime_days', 'Security', '7', 'NUMBER', '7', 'JWT Refresh Token lifetime in days', 1, 30, 0, 0),
  ('password_min_length', 'Security', '8', 'NUMBER', '8', 'Minimum password character length', 6, 32, 0, 0),
  ('failed_login_threshold', 'Security', '5', 'NUMBER', '5', 'Max failed logins before account lock', 3, 10, 0, 0),
  ('account_lock_duration_minutes', 'Security', '15', 'NUMBER', '15', 'Account lock duration after consecutive failed logins', 1, 1440, 0, 0),
  ('api_rate_limit_per_min', 'Security', '300', 'NUMBER', '300', 'API endpoint rate limit per minute', 50, 10000, 0, 0),
  ('websocket_max_connections', 'Security', '100', 'NUMBER', '100', 'Max concurrent WebSocket client connections', 10, 1000, 0, 0),

  ('telemetry_collection_enabled', 'Telemetry', 'true', 'BOOLEAN', 'true', 'Master toggle for real-time telemetry ingestion', NULL, NULL, 1, 0),
  ('telemetry_event_batch_size', 'Telemetry', '100', 'NUMBER', '100', 'Telemetry batch processing size', 10, 1000, 0, 0),
  ('telemetry_queue_limit', 'Telemetry', '5000', 'NUMBER', '5000', 'Max in-memory telemetry queue size', 500, 50000, 0, 0),
  ('telemetry_ws_broadcast_rate', 'Telemetry', '10', 'NUMBER', '10', 'Max telemetry broadcasts per second', 1, 100, 0, 0),

  ('detection_engine_enabled', 'Detection', 'true', 'BOOLEAN', 'true', 'Master toggle for rule-based detection engine', NULL, NULL, 1, 0),
  ('detection_max_active_rules', 'Detection', '500', 'NUMBER', '500', 'Maximum active detection rules limit', 10, 2000, 0, 0),
  ('detection_cooldown_sec', 'Detection', '30', 'NUMBER', '30', 'Rule trigger cooldown period in seconds', 0, 3600, 0, 0),
  ('detection_suppression_window_sec', 'Detection', '300', 'NUMBER', '300', 'Rule suppression window', 10, 86400, 0, 0),

  ('behavior_baseline_window_hours', 'Behavior', '168', 'NUMBER', '168', 'Behavioral baseline training window in hours', 24, 720, 0, 0),
  ('behavior_min_sample_size', 'Behavior', '100', 'NUMBER', '100', 'Minimum telemetry samples required for valid baseline', 20, 10000, 0, 0),
  ('behavior_ewma_alpha', 'Behavior', '0.15', 'NUMBER', '0.15', 'Exponentially Weighted Moving Average alpha parameter', 0.01, 0.99, 0, 0),
  ('behavior_zscore_threshold', 'Behavior', '3.0', 'NUMBER', '3.0', 'Z-score threshold for statistical anomaly detection', 1.5, 6.0, 0, 0),
  ('behavior_exclude_simulation', 'Behavior', 'true', 'BOOLEAN', 'true', 'Exclude simulation data from production baseline metrics', NULL, NULL, 1, 0),

  ('ml_inference_enabled', 'ML', 'true', 'BOOLEAN', 'true', 'Master toggle for Machine Learning anomaly inference', NULL, NULL, 1, 0),
  ('ml_drift_threshold', 'ML', '0.15', 'NUMBER', '0.15', 'Drift score threshold requiring model validation', 0.01, 0.5, 0, 0),
  ('ml_confidence_cutoff', 'ML', '0.70', 'NUMBER', '0.70', 'Minimum ML prediction confidence score', 0.5, 0.99, 0, 0),
  ('ml_auto_activate_validated', 'ML', 'false', 'BOOLEAN', 'false', 'Allow automatic activation of newly trained ML models', NULL, NULL, 1, 0),

  ('alert_deduplication_window_sec', 'Alerts', '120', 'NUMBER', '120', 'Deduplication window in seconds', 10, 3600, 0, 0),
  ('alert_correlation_window_sec', 'Alerts', '600', 'NUMBER', '600', 'Alert correlation window in seconds', 60, 7200, 0, 0),
  ('alert_sla_high_minutes', 'Alerts', '30', 'NUMBER', '30', 'SLA target for High severity alerts in minutes', 5, 240, 0, 0),

  ('incident_auto_creation_enabled', 'Incidents', 'true', 'BOOLEAN', 'true', 'Auto-create incidents from correlated high-severity alerts', NULL, NULL, 0, 0),
  ('incident_escalation_timeout_min', 'Incidents', '60', 'NUMBER', '60', 'Unassigned incident escalation timeout in minutes', 15, 1440, 0, 0),

  ('mitre_active_version', 'MITRE', 'v14.1', 'STRING', 'v14.1', 'Active MITRE ATT&CK for ICS matrix version', NULL, NULL, 0, 0),
  ('mitre_auto_mapping_enabled', 'MITRE', 'true', 'BOOLEAN', 'true', 'Automatically map rule and ML detections to MITRE techniques', NULL, NULL, 0, 0),

  ('response_engine_enabled', 'Response', 'true', 'BOOLEAN', 'true', 'Master toggle for Defense & Response Engine', NULL, NULL, 1, 0),
  ('response_default_approval_policy', 'Response', 'ADMIN_APPROVAL', 'STRING', 'ADMIN_APPROVAL', 'Default policy for response execution approval', NULL, NULL, 1, 0),
  ('response_disallow_self_approval', 'Response', 'true', 'BOOLEAN', 'true', 'Enforce Separation of Duties (plan creator cannot approve)', NULL, NULL, 1, 0),
  ('response_simulation_only', 'Response', 'true', 'BOOLEAN', 'true', 'Enforce laboratory simulation execution only (Fail-Closed)', NULL, NULL, 1, 0),

  ('simulation_enabled', 'Simulation', 'true', 'BOOLEAN', 'true', 'Master toggle for ICS Attack Simulation Laboratory', NULL, NULL, 1, 0),
  ('simulation_training_mode', 'Simulation', 'true', 'BOOLEAN', 'true', 'Allow SOC Operator Training Mode with interactive hints', NULL, NULL, 0, 0),
  ('simulation_max_duration_min', 'Simulation', '60', 'NUMBER', '60', 'Maximum allowed simulation run duration in minutes', 5, 360, 0, 0),
  ('simulation_max_event_rate', 'Simulation', '50', 'NUMBER', '50', 'Max synthetic events per second limit', 1, 500, 0, 0),
  ('simulation_require_scenario_approval', 'Simulation', 'true', 'BOOLEAN', 'true', 'Require scenario approval before execution', NULL, NULL, 1, 0),
  ('simulation_baseline_exclusion', 'Simulation', 'true', 'BOOLEAN', 'true', 'Strictly exclude simulation events from production baselines', NULL, NULL, 1, 0),

  ('report_daily_generation_limit', 'Reports', '50', 'NUMBER', '50', 'Max report generations per day', 5, 500, 0, 0),
  ('report_auto_scheduler_enabled', 'Reports', 'true', 'BOOLEAN', 'true', 'Enable recurring report schedule processor', NULL, NULL, 0, 0),

  ('retention_default_days', 'Retention', '30', 'NUMBER', '30', 'Default global data retention period in days', 7, 365, 0, 0),
  ('retention_preserve_evidence', 'Retention', 'true', 'BOOLEAN', 'true', 'Preserve evidence linked to active incidents regardless of age', NULL, NULL, 1, 0),

  ('logging_level', 'Logging', 'INFO', 'STRING', 'INFO', 'System log verbosity level (DEBUG, INFO, WARN, ERROR)', NULL, NULL, 0, 0),
  ('logging_audit_all_edits', 'Logging', 'true', 'BOOLEAN', 'true', 'Record comprehensive audit logs for all setting mutations', NULL, NULL, 0, 0),

  ('ws_heartbeat_interval_sec', 'WebSocket', '15', 'NUMBER', '15', 'WebSocket client heartbeat ping interval', 5, 60, 0, 0),

  ('db_pool_max_connections', 'Performance', '20', 'NUMBER', '20', 'Database connection pool max size', 5, 100, 0, 0)
ON DUPLICATE KEY UPDATE 
  category = VALUES(category),
  setting_type = VALUES(setting_type),
  default_value = VALUES(default_value),
  description = VALUES(description),
  min_value = VALUES(min_value),
  max_value = VALUES(max_value),
  is_dangerous = VALUES(is_dangerous);

-- 7. Seed Default Retention Policies
INSERT INTO retention_policies (policy_uuid, category, retention_days, is_enabled, description, preserve_evidence_override) VALUES
  ('ret-001', 'telemetry', 30, 1, 'Raw SCADA sensor telemetry and process metrics', 1),
  ('ret-002', 'events', 60, 1, 'Security and operational system events', 1),
  ('ret-003', 'network_flows', 30, 1, 'Network packet headers and flow logs', 1),
  ('ret-004', 'protocol_events', 60, 1, 'Modbus, DNP3, Ethernet/IP protocol transactions', 1),
  ('ret-005', 'detections', 90, 1, 'Rule and behavioral detection triggers', 1),
  ('ret-006', 'anomalies', 90, 1, 'Statistical Z-score and EWMA anomalies', 1),
  ('ret-007', 'ml_predictions', 90, 1, 'Isolation Forest ML inference predictions', 1),
  ('ret-008', 'alerts', 180, 1, 'Correlated SOC Security Alerts', 1),
  ('ret-009', 'incidents', 365, 1, 'Investigation case files and evidence metadata', 1),
  ('ret-010', 'evidence', 365, 1, 'SHA-256 evidence files and artifacts', 1),
  ('ret-011', 'simulation_runs', 60, 1, 'Attack simulation laboratory execution traces', 0),
  ('ret-012', 'reports', 180, 1, 'Generated PDF/CSV/JSON security reports', 0),
  ('ret-013', 'audit_logs', 365, 1, 'Immutable application administrative audit records', 1)
ON DUPLICATE KEY UPDATE 
  retention_days = VALUES(retention_days),
  description = VALUES(description);

-- 8. Seed Default Permissions if missing
INSERT INTO permissions (name, category, description) VALUES
  ('dashboard.read', 'SYSTEM', 'View SOC Dashboard and overview metrics'),
  ('assets.read', 'ASSETS', 'View asset inventory and discovery'),
  ('assets.create', 'ASSETS', 'Register new industrial assets'),
  ('assets.update', 'ASSETS', 'Update asset properties and baselines'),
  ('assets.delete', 'ASSETS', 'Remove assets from inventory'),
  ('telemetry.read', 'TELEMETRY', 'View real-time telemetry stream'),
  ('network.read', 'NETWORK', 'View network sessions and protocol monitors'),
  ('detections.read', 'DETECTION', 'View rule and behavioral detections'),
  ('detections.manage', 'DETECTION', 'Configure detection rules and thresholds'),
  ('ml.read', 'ML', 'View ML anomaly models and predictions'),
  ('ml.manage', 'ML', 'Activate, retrain, or configure ML models'),
  ('alerts.read', 'ALERTS', 'View and search SOC alert queue'),
  ('alerts.manage', 'ALERTS', 'Acknowledge, suppress, or assign alerts'),
  ('incidents.read', 'INCIDENTS', 'View investigation cases'),
  ('incidents.manage', 'INCIDENTS', 'Create, assign, or resolve incident cases'),
  ('mitre.read', 'MITRE', 'Browse MITRE ATT&CK for ICS matrices'),
  ('mitre.manage', 'MITRE', 'Manage MITRE dataset mappings and versions'),
  ('response.read', 'RESPONSE', 'View response recommendations and playbooks'),
  ('response.manage', 'RESPONSE', 'Create response plans and playbooks'),
  ('response.approve', 'RESPONSE', 'Approve pending response plans'),
  ('response.execute', 'RESPONSE', 'Execute response actions in lab simulator'),
  ('simulation.read', 'SIMULATION', 'View attack simulation scenarios and runs'),
  ('simulation.manage', 'SIMULATION', 'Create and edit lab simulation scenarios'),
  ('simulation.approve', 'SIMULATION', 'Approve simulation scenarios for execution'),
  ('simulation.execute', 'SIMULATION', 'Start, pause, stop, or reset lab simulations'),
  ('reports.read', 'REPORTS', 'View generated reports library'),
  ('reports.create', 'REPORTS', 'Generate new custom security reports'),
  ('reports.export', 'REPORTS', 'Download PDF/CSV/JSON report exports'),
  ('reports.schedule', 'REPORTS', 'Configure automated report schedules'),
  ('users.manage', 'ADMIN', 'Manage user accounts, passwords, and sessions'),
  ('roles.manage', 'ADMIN', 'Manage RBAC roles and permission mappings'),
  ('settings.manage', 'ADMIN', 'Configure system-wide settings and policies'),
  ('audit.read', 'ADMIN', 'View administrative system audit logs')
ON DUPLICATE KEY UPDATE description = VALUES(description);
