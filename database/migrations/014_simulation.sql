-- Migration 014: Synthetic Attack Simulation Engine

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
