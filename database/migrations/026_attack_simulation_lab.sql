-- Migration 026: Controlled ICS Attack Simulation & Security Validation Laboratory (Phase 15)

-- 1. Extend simulation_scenarios
ALTER TABLE simulation_scenarios
  ADD COLUMN IF NOT EXISTS scenario_code VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS category VARCHAR(50) DEFAULT 'PROTOCOL_ANOMALY',
  ADD COLUMN IF NOT EXISTS difficulty VARCHAR(20) DEFAULT 'INTERMEDIATE',
  ADD COLUMN IF NOT EXISTS risk_level VARCHAR(20) DEFAULT 'MEDIUM',
  ADD COLUMN IF NOT EXISTS version VARCHAR(20) DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS simulation_only BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS duration INT DEFAULT 60,
  ADD COLUMN IF NOT EXISTS target_assets JSON NULL,
  ADD COLUMN IF NOT EXISTS target_protocols JSON NULL,
  ADD COLUMN IF NOT EXISTS prerequisites JSON NULL,
  ADD COLUMN IF NOT EXISTS expected_events JSON NULL,
  ADD COLUMN IF NOT EXISTS expected_detections JSON NULL,
  ADD COLUMN IF NOT EXISTS expected_alerts JSON NULL,
  ADD COLUMN IF NOT EXISTS expected_incidents JSON NULL,
  ADD COLUMN IF NOT EXISTS expected_mitre_mappings JSON NULL,
  ADD COLUMN IF NOT EXISTS recommended_response_playbook VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS created_by INT NULL,
  ADD COLUMN IF NOT EXISTS approved_by INT NULL,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Extend simulation_runs
ALTER TABLE simulation_runs
  ADD COLUMN IF NOT EXISTS run_number VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS name VARCHAR(150) NULL,
  ADD COLUMN IF NOT EXISTS description TEXT NULL,
  ADD COLUMN IF NOT EXISTS environment VARCHAR(50) DEFAULT 'LAB_SIMULATION',
  ADD COLUMN IF NOT EXISTS simulation_mode BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS started_by INT NULL,
  ADD COLUMN IF NOT EXISTS paused_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS resumed_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS completed_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS stopped_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS failed_at DATETIME NULL,
  ADD COLUMN IF NOT EXISTS duration_ms INT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS seed INT DEFAULT 1337,
  ADD COLUMN IF NOT EXISTS configuration_json JSON NULL,
  ADD COLUMN IF NOT EXISTS expected_results_json JSON NULL,
  ADD COLUMN IF NOT EXISTS actual_results_json JSON NULL,
  ADD COLUMN IF NOT EXISTS evaluation_json JSON NULL,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 3. Simulation Steps Table
CREATE TABLE IF NOT EXISTS simulation_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    scenario_id INT NOT NULL,
    sequence INT NOT NULL,
    action_type VARCHAR(60) NOT NULL,
    target_asset_id VARCHAR(50) NOT NULL,
    parameters JSON NULL,
    delay_seconds INT DEFAULT 0,
    timeout_seconds INT DEFAULT 30,
    expected_result TEXT NULL,
    failure_policy VARCHAR(30) DEFAULT 'STOP_SCENARIO',
    CONSTRAINT fk_ss_scenario FOREIGN KEY (scenario_id) REFERENCES simulation_scenarios(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Simulation Run Steps Execution Table
CREATE TABLE IF NOT EXISTS simulation_run_steps (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    run_id BIGINT NOT NULL,
    step_id BIGINT NULL,
    sequence INT NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING',
    executed_at DATETIME NULL,
    duration_ms INT DEFAULT 0,
    result_json JSON NULL,
    error_message TEXT NULL,
    CONSTRAINT fk_srs_run FOREIGN KEY (run_id) REFERENCES simulation_runs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Simulation Evaluations Table
CREATE TABLE IF NOT EXISTS simulation_evaluations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    run_id BIGINT NOT NULL UNIQUE,
    expected_detections_count INT DEFAULT 0,
    observed_detections_count INT DEFAULT 0,
    expected_alerts_count INT DEFAULT 0,
    observed_alerts_count INT DEFAULT 0,
    expected_incidents_count INT DEFAULT 0,
    observed_incidents_count INT DEFAULT 0,
    expected_mitre_count INT DEFAULT 0,
    observed_mitre_count INT DEFAULT 0,
    evaluation_summary TEXT NULL,
    classification_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_se_run_eval FOREIGN KEY (run_id) REFERENCES simulation_runs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Simulation Training Sessions Table
CREATE TABLE IF NOT EXISTS simulation_training_sessions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    session_uuid VARCHAR(36) NOT NULL UNIQUE,
    run_id BIGINT NOT NULL,
    trainer_id INT NULL,
    trainee_id INT NULL,
    training_mode VARCHAR(30) DEFAULT 'TRAINING_MODE',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME NULL,
    evaluation_notes TEXT NULL,
    CONSTRAINT fk_sts_run FOREIGN KEY (run_id) REFERENCES simulation_runs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
