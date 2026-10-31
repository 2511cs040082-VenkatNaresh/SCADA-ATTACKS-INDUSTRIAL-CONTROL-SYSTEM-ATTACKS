-- Migration 013: Defensive Response & Playbooks

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
