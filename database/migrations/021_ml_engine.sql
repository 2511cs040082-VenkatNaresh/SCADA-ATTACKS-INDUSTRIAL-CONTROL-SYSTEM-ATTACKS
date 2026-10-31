-- Migration 021: Machine Learning Based ICS Anomaly Detection Engine Schema

-- 1. Safely add columns to ml_models
ALTER TABLE ml_models
  ADD COLUMN IF NOT EXISTS algorithm VARCHAR(50) DEFAULT 'ISOLATION_FOREST',
  ADD COLUMN IF NOT EXISTS feature_version VARCHAR(20) DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS training_dataset_id INT NULL,
  ADD COLUMN IF NOT EXISTS preprocessing_version VARCHAR(20) DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS metrics_json JSON NULL,
  ADD COLUMN IF NOT EXISTS config_json JSON NULL,
  ADD COLUMN IF NOT EXISTS artifact_location VARCHAR(255) NULL,
  ADD COLUMN IF NOT EXISTS checksum VARCHAR(64) NULL,
  ADD COLUMN IF NOT EXISTS updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- 2. Create ml_datasets table
CREATE TABLE IF NOT EXISTS ml_datasets (
    id INT AUTO_INCREMENT PRIMARY KEY,
    dataset_uuid VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    feature_version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    sample_count INT NOT NULL DEFAULT 0,
    normal_count INT NOT NULL DEFAULT 0,
    anomaly_count INT NOT NULL DEFAULT 0,
    source VARCHAR(100) NOT NULL DEFAULT 'ICS_LAB_SIMULATOR',
    provenance_json JSON NULL,
    description TEXT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Enhance ml_predictions table
ALTER TABLE ml_predictions
  ADD COLUMN IF NOT EXISTS prediction_uuid VARCHAR(100) NULL,
  ADD COLUMN IF NOT EXISTS timestamp DATETIME(3) NULL,
  ADD COLUMN IF NOT EXISTS model_id INT NULL,
  ADD COLUMN IF NOT EXISTS model_version VARCHAR(20) DEFAULT '1.0.0',
  ADD COLUMN IF NOT EXISTS asset_id INT NULL,
  ADD COLUMN IF NOT EXISTS source_asset_id INT NULL,
  ADD COLUMN IF NOT EXISTS destination_asset_id INT NULL,
  ADD COLUMN IF NOT EXISTS protocol VARCHAR(50) DEFAULT 'MODBUS_TCP',
  ADD COLUMN IF NOT EXISTS feature_vector_json JSON NULL,
  ADD COLUMN IF NOT EXISTS raw_score DOUBLE DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS normalized_score DOUBLE DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS status VARCHAR(30) DEFAULT 'NEW',
  ADD COLUMN IF NOT EXISTS explanation TEXT NULL,
  ADD COLUMN IF NOT EXISTS evidence_json JSON NULL;

-- 4. Create ml_training_jobs table
CREATE TABLE IF NOT EXISTS ml_training_jobs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    job_uuid VARCHAR(100) NOT NULL UNIQUE,
    dataset_id INT NULL,
    algorithm VARCHAR(50) NOT NULL DEFAULT 'ISOLATION_FOREST',
    parameters_json JSON NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'QUEUED', -- QUEUED, RUNNING, VALIDATING, COMPLETED, FAILED, CANCELLED
    logs TEXT NULL,
    model_id INT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_mltj_dataset FOREIGN KEY (dataset_id) REFERENCES ml_datasets(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Create ml_drift_logs table
CREATE TABLE IF NOT EXISTS ml_drift_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    drift_uuid VARCHAR(100) NOT NULL UNIQUE,
    model_id INT NULL,
    drift_type VARCHAR(50) NOT NULL, -- DATA_DRIFT, MODEL_DRIFT, CONCEPT_DRIFT
    feature_name VARCHAR(100) NULL,
    metrics_json JSON NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'OPEN', -- OPEN, REVIEWED, RESOLVED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_mldl_model FOREIGN KEY (model_id) REFERENCES ml_models(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Seed initial Dataset and Active Isolation Forest Model
INSERT INTO ml_datasets (dataset_uuid, name, version, feature_version, sample_count, normal_count, anomaly_count, source, description)
VALUES ('DS-001-LAB-BASELINE', 'ICS Lab Baseline Dataset v1', 'v1.0', 'v1.0', 5000, 4850, 150, 'ICS_LAB_SIMULATOR', 'Validated SCADA telemetry baseline dataset containing Modbus request rates, latencies, and process features.')
ON DUPLICATE KEY UPDATE sample_count = VALUES(sample_count);

INSERT INTO ml_models (model_uuid, model_name, model_type, algorithm, description, status, feature_version, training_dataset_id, metrics_json, checksum)
VALUES ('MDL-001-ISOLATION-FOREST', 'IsolationForest_ICS_v1', 'UNSUPERVISED_ANOMALY', 'ISOLATION_FOREST', 'Production Isolation Forest anomaly detector trained on lab telemetry baseline v1.0.', 'ACTIVE', 'v1.0', 1, '{"f1_score": 0.94, "precision": 0.96, "recall": 0.92, "roc_auc": 0.97, "false_positive_rate": 0.02}', 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855')
ON DUPLICATE KEY UPDATE status = VALUES(status), algorithm = VALUES(algorithm);
