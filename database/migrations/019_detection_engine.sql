-- Migration 019: Rule-Based ICS Attack Detection Engine Foundation

-- 1. Safely add columns to detection_rules
ALTER TABLE detection_rules 
  ADD COLUMN IF NOT EXISTS protocol VARCHAR(50) DEFAULT 'MODBUS_TCP',
  ADD COLUMN IF NOT EXISTS condition_json JSON NULL,
  ADD COLUMN IF NOT EXISTS threshold INT DEFAULT 1,
  ADD COLUMN IF NOT EXISTS time_window INT DEFAULT 60,
  ADD COLUMN IF NOT EXISTS cooldown_seconds INT DEFAULT 300,
  ADD COLUMN IF NOT EXISTS confidence DOUBLE DEFAULT 0.9,
  ADD COLUMN IF NOT EXISTS mitre_tactic_id VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS mitre_technique_id VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS trigger_count INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_triggered_at DATETIME NULL;

-- 2. Safely add columns to detection_results
ALTER TABLE detection_results
  ADD COLUMN IF NOT EXISTS rule_version VARCHAR(20) DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS source_asset_id INT NULL,
  ADD COLUMN IF NOT EXISTS destination_asset_id INT NULL,
  ADD COLUMN IF NOT EXISTS source_ip VARCHAR(45) NULL,
  ADD COLUMN IF NOT EXISTS destination_ip VARCHAR(45) NULL,
  ADD COLUMN IF NOT EXISTS protocol VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS severity VARCHAR(20) DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS evidence_json JSON NULL,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS security_event_id BIGINT NULL,
  ADD COLUMN IF NOT EXISTS alert_id BIGINT NULL;

-- 3. Table for tracking active deduplication & cooldown windows
CREATE TABLE IF NOT EXISTS detection_suppressions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    rule_id INT NOT NULL,
    source_asset_id INT NULL,
    destination_asset_id INT NULL,
    cooldown_until DATETIME NOT NULL,
    occurrence_count INT DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_dsup_rule FOREIGN KEY (rule_id) REFERENCES detection_rules(id) ON DELETE CASCADE,
    INDEX idx_dsup_rule_assets (rule_id, source_asset_id, destination_asset_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Table for analyst feedback on detections
CREATE TABLE IF NOT EXISTS detection_feedback (
    id INT AUTO_INCREMENT PRIMARY KEY,
    detection_id BIGINT NOT NULL,
    analyst_id INT NULL,
    feedback VARCHAR(30) NOT NULL, -- TRUE_POSITIVE, FALSE_POSITIVE, BENIGN, NEEDS_REVIEW
    comments TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_dfb_detection FOREIGN KEY (detection_id) REFERENCES detection_results(id) ON DELETE CASCADE,
    CONSTRAINT fk_dfb_analyst FOREIGN KEY (analyst_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Seed default records for the 13 required detection rules
INSERT INTO detection_rules 
(rule_uuid, rule_name, description, category, protocol, severity, enabled, version, condition_json, threshold, time_window, cooldown_seconds, confidence, mitre_tactic_id, mitre_technique_id)
VALUES
('RULE-001-ASSET-COMM', 'Unexpected Asset Communication', 'Communication between assets not in communication baseline', 'NETWORK_ANOMALY', 'ANY', 'HIGH', 1, '1.0.0', '{"field": "is_in_baseline", "operator": "==", "value": false}', 1, 60, 300, 0.90, 'TA0102', 'T0843'),

('RULE-002-UNEXP-PROTO', 'Unexpected Protocol', 'Unbaselined protocol traffic detected between assets', 'PROTOCOL_ANOMALY', 'ANY', 'MEDIUM', 1, '1.0.0', '{"field": "protocol_matched", "operator": "==", "value": false}', 1, 60, 300, 0.85, 'TA0104', 'T0855'),

('RULE-003-MODBUS-FC', 'Unexpected Modbus Function', 'Modbus function code outside normal operational whitelist', 'COMMAND_ANOMALY', 'MODBUS_TCP', 'HIGH', 1, '1.0.0', '{"field": "function_code", "operator": "NOT_IN", "value": [1, 2, 3, 4, 5, 6, 15, 16]}', 1, 60, 300, 0.95, 'TA0104', 'T0855'),

('RULE-004-MODBUS-WRITE', 'Unauthorized Modbus Write', 'Modbus write operation issued by non-authoritative host', 'UNAUTHORIZED_WRITE', 'MODBUS_TCP', 'CRITICAL', 1, '1.0.0', '{"logical": "AND", "conditions": [{"field": "is_write_function", "operator": "==", "value": true}, {"field": "source_role", "operator": "!=", "value": "HMI"}]}', 1, 60, 180, 0.98, 'TA0105', 'T0836'),

('RULE-005-MODBUS-RATE', 'Excessive Modbus Request Rate', 'High frequency Modbus requests exceeding safety threshold', 'TRAFFIC_SPIKE', 'MODBUS_TCP', 'MEDIUM', 1, '1.0.0', '{"field": "request_rate_per_sec", "operator": ">", "value": 50}', 50, 10, 300, 0.85, 'TA0106', 'T0814'),

('RULE-006-MODBUS-TIMEOUT', 'Modbus Response Timeout', 'Modbus request sent without PLC response', 'COMM_FAILURE', 'MODBUS_TCP', 'MEDIUM', 1, '1.0.0', '{"field": "response_status", "operator": "==", "value": "TIMEOUT"}', 3, 60, 300, 0.80, 'TA0106', 'T0826'),

('RULE-007-MODBUS-EXCEPT', 'Modbus Exception Spike', 'Elevated rate of Modbus exception responses from target PLC', 'PROTOCOL_ERROR', 'MODBUS_TCP', 'HIGH', 1, '1.0.0', '{"field": "exception_rate_per_min", "operator": ">", "value": 5}', 5, 60, 300, 0.90, 'TA0102', 'T0843'),

('RULE-008-MODBUS-UNKFC', 'Unknown Modbus Function', 'Non-standard or reserved Modbus function code detected', 'MALFORMED_TRAFFIC', 'MODBUS_TCP', 'HIGH', 1, '1.0.0', '{"field": "is_valid_fc", "operator": "==", "value": false}', 1, 60, 300, 0.95, 'TA0104', 'T0855'),

('RULE-009-UNEXP-DIR', 'Unexpected Direction', 'Protocol traffic initiated in prohibited direction (e.g., PLC to HMI)', 'FLOW_ANOMALY', 'MODBUS_TCP', 'HIGH', 1, '1.0.0', '{"logical": "AND", "conditions": [{"field": "source_type", "operator": "==", "value": "PLC"}, {"field": "destination_type", "operator": "==", "value": "HMI"}]}', 1, 60, 300, 0.92, 'TA0108', 'T0886'),

('RULE-010-NEW-PARTNER', 'New Communication Partner', 'First observed connection between an asset and a new IP/MAC address', 'NETWORK_ANOMALY', 'ANY', 'LOW', 1, '1.0.0', '{"field": "is_known_partner", "operator": "==", "value": false}', 1, 60, 600, 0.75, 'TA0102', 'T0843'),

('RULE-011-CORRELATION', 'Process/Network Correlation', 'Network write command correlates with severe process threshold breach', 'PROCESS_ANOMALY', 'MODBUS_TCP', 'CRITICAL', 1, '1.0.0', '{"logical": "AND", "conditions": [{"field": "network_write_detected", "operator": "==", "value": true}, {"field": "process_anomaly_detected", "operator": "==", "value": true}]}', 1, 60, 120, 0.99, 'TA0105', 'T0836'),

('RULE-012-ASSET-STATE', 'Asset State Anomaly', 'Asset transmitting telemetry while in degraded or critical state', 'ASSET_ANOMALY', 'ANY', 'HIGH', 1, '1.0.0', '{"field": "asset_health_status", "operator": "IN", "value": ["CRITICAL", "OFFLINE_UNEXPECTED", "DEGRADED"]}', 1, 60, 300, 0.88, 'TA0106', 'T0816'),

('RULE-013-PORT-MISMATCH', 'Protocol Port Mismatch', 'Modbus TCP traffic detected on non-standard port or non-Modbus on port 502', 'PORT_ANOMALY', 'ANY', 'MEDIUM', 1, '1.0.0', '{"logical": "OR", "conditions": [{"logical": "AND", "conditions": [{"field": "detected_protocol", "operator": "==", "value": "MODBUS_TCP"}, {"field": "destination_port", "operator": "!=", "value": 502}]}, {"logical": "AND", "conditions": [{"field": "destination_port", "operator": "==", "value": 502}, {"field": "detected_protocol", "operator": "!=", "value": "MODBUS_TCP"}]}]}', 1, 60, 300, 0.85, 'TA0104', 'T0885')
ON DUPLICATE KEY UPDATE
  description = VALUES(description),
  category = VALUES(category),
  protocol = VALUES(protocol),
  severity = VALUES(severity),
  condition_json = VALUES(condition_json),
  threshold = VALUES(threshold),
  time_window = VALUES(time_window),
  cooldown_seconds = VALUES(cooldown_seconds),
  confidence = VALUES(confidence),
  mitre_tactic_id = VALUES(mitre_tactic_id),
  mitre_technique_id = VALUES(mitre_technique_id);
