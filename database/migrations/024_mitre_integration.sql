-- Migration 024: MITRE ATT&CK for ICS Integration, Versioning & Multi-Source Mapping

-- 1. Dataset Versions Table
CREATE TABLE IF NOT EXISTS mitre_dataset_versions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    version VARCHAR(30) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL DEFAULT 'MITRE ATT&CK for ICS',
    source VARCHAR(100) NOT NULL DEFAULT 'MITRE ATT&CK Official STIX v14.1',
    source_url VARCHAR(255) NULL,
    release_date DATETIME NULL,
    imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    checksum VARCHAR(64) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    tactic_count INT NOT NULL DEFAULT 0,
    technique_count INT NOT NULL DEFAULT 0,
    subtechnique_count INT NOT NULL DEFAULT 0,
    relationship_count INT NOT NULL DEFAULT 0,
    metadata_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by INT NULL,
    INDEX idx_mdv_version (version),
    INDEX idx_mdv_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Extend Tactics, Techniques, and Subtechniques
ALTER TABLE mitre_tactics
  ADD COLUMN IF NOT EXISTS dataset_version_id INT NULL,
  ADD COLUMN IF NOT EXISTS short_name VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS reference_url VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS display_order INT DEFAULT 0;

ALTER TABLE mitre_techniques
  ADD COLUMN IF NOT EXISTS dataset_version_id INT NULL,
  ADD COLUMN IF NOT EXISTS external_id VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS platform VARCHAR(100) DEFAULT 'ICS',
  ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ACTIVE',
  ADD COLUMN IF NOT EXISTS metadata_json JSON NULL;

ALTER TABLE mitre_subtechniques
  ADD COLUMN IF NOT EXISTS dataset_version_id INT NULL,
  ADD COLUMN IF NOT EXISTS subtechnique_external_id VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS metadata_json JSON NULL;

-- 3. Data Sources Table
CREATE TABLE IF NOT EXISTS mitre_data_sources (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    dataset_version_id INT NULL,
    metadata_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mds_ext (external_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Mitigations Table
CREATE TABLE IF NOT EXISTS mitre_mitigations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    external_id VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    dataset_version_id INT NULL,
    metadata_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mmit_ext (external_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Generic Relationships Table
CREATE TABLE IF NOT EXISTS mitre_relationships (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(100) NOT NULL,
    relationship_type VARCHAR(50) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id VARCHAR(100) NOT NULL,
    dataset_version_id INT NULL,
    metadata_json JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mrel_src (source_type, source_id),
    INDEX idx_mrel_tgt (target_type, target_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Alert MITRE Mappings Table
CREATE TABLE IF NOT EXISTS alert_mitre_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mapping_uuid VARCHAR(36) NOT NULL UNIQUE,
    alert_id BIGINT NOT NULL,
    technique_id INT NULL,
    technique_external_id VARCHAR(50) NOT NULL,
    mapping_status VARCHAR(30) NOT NULL DEFAULT 'AUTO_SUGGESTED',
    confidence VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    reason TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_amm_alert FOREIGN KEY (alert_id) REFERENCES alerts(id) ON DELETE CASCADE,
    INDEX idx_amm_alert (alert_id),
    INDEX idx_amm_status (mapping_status),
    INDEX idx_amm_tech (technique_external_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Anomaly MITRE Mappings Table (Phase 9 Behavioral)
CREATE TABLE IF NOT EXISTS anomaly_mitre_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mapping_uuid VARCHAR(36) NOT NULL UNIQUE,
    anomaly_id BIGINT NOT NULL,
    technique_id INT NULL,
    technique_external_id VARCHAR(50) NOT NULL,
    mapping_status VARCHAR(30) NOT NULL DEFAULT 'AUTO_SUGGESTED',
    confidence VARCHAR(20) NOT NULL DEFAULT 'MEDIUM',
    reason TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_anmm_anom (anomaly_id),
    INDEX idx_anmm_status (mapping_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. ML MITRE Mappings Table (Phase 10 ML Engine)
CREATE TABLE IF NOT EXISTS ml_mitre_mappings (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mapping_uuid VARCHAR(36) NOT NULL UNIQUE,
    ml_prediction_id BIGINT NOT NULL,
    technique_id INT NULL,
    technique_external_id VARCHAR(50) NOT NULL,
    mapping_status VARCHAR(30) NOT NULL DEFAULT 'AUTO_SUGGESTED',
    confidence VARCHAR(20) NOT NULL DEFAULT 'HIGH',
    reason TEXT NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_mlmm_pred (ml_prediction_id),
    INDEX idx_mlmm_status (mapping_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Extend detection_mitre_mappings and incident_mitre_mappings
ALTER TABLE detection_mitre_mappings
  ADD COLUMN IF NOT EXISTS mapping_uuid VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS technique_external_id VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS mapping_status VARCHAR(30) DEFAULT 'AUTO_SUGGESTED',
  ADD COLUMN IF NOT EXISTS reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS created_by INT NULL,
  ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE incident_mitre_mappings
  ADD COLUMN IF NOT EXISTS mapping_uuid VARCHAR(36) NULL,
  ADD COLUMN IF NOT EXISTS technique_external_id VARCHAR(50) NULL,
  ADD COLUMN IF NOT EXISTS relationship_type VARCHAR(30) DEFAULT 'PRIMARY',
  ADD COLUMN IF NOT EXISTS mapping_status VARCHAR(30) DEFAULT 'ANALYST_CONFIRMED',
  ADD COLUMN IF NOT EXISTS confidence VARCHAR(20) DEFAULT 'HIGH',
  ADD COLUMN IF NOT EXISTS reason TEXT NULL,
  ADD COLUMN IF NOT EXISTS created_by INT NULL,
  ADD COLUMN IF NOT EXISTS created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 10. Mapping Evidence Table
CREATE TABLE IF NOT EXISTS mitre_mapping_evidence (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mapping_type VARCHAR(50) NOT NULL,
    mapping_id BIGINT NOT NULL,
    evidence_type VARCHAR(50) NOT NULL,
    evidence_id VARCHAR(100) NOT NULL,
    description TEXT NULL,
    source_reference VARCHAR(255) NULL,
    created_by INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mme_map (mapping_type, mapping_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Mapping Audit History Table
CREATE TABLE IF NOT EXISTS mitre_mapping_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    mapping_type VARCHAR(50) NOT NULL,
    mapping_id BIGINT NOT NULL,
    previous_status VARCHAR(30) NULL,
    new_status VARCHAR(30) NOT NULL,
    previous_confidence VARCHAR(20) NULL,
    new_confidence VARCHAR(20) NULL,
    changed_by INT NULL,
    change_reason TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_mmh_map (mapping_type, mapping_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
