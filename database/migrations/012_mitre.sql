-- Migration 012: MITRE ATT&CK for ICS (v14) Framework Mapping

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
