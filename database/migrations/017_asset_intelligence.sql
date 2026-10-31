-- Migration 017: Asset Intelligence, Discovery, Health, Risk, Protocols, Baseline, Tags, Notes

CREATE TABLE IF NOT EXISTS asset_discoveries (
    id INT AUTO_INCREMENT PRIMARY KEY,
    discovery_uuid VARCHAR(36) NOT NULL UNIQUE,
    asset_id INT NULL,
    discovery_source VARCHAR(50) NOT NULL DEFAULT 'TELEMETRY',
    timestamp DATETIME(3) NOT NULL,
    ip_address VARCHAR(45) NOT NULL,
    mac_address VARCHAR(17) NULL,
    hostname VARCHAR(100) NULL,
    protocol VARCHAR(50) NULL,
    observed_type VARCHAR(50) NULL,
    identification_status VARCHAR(30) NOT NULL DEFAULT 'UNKNOWN',
    evidence JSON NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ad_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE SET NULL,
    INDEX idx_ad_status (identification_status),
    INDEX idx_ad_ip (ip_address)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_observations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    timestamp DATETIME(3) NOT NULL,
    source VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ONLINE',
    ip_address VARCHAR(45) NULL,
    mac_address VARCHAR(17) NULL,
    hostname VARCHAR(100) NULL,
    protocol VARCHAR(50) NULL,
    metadata JSON NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ao_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_ao_asset_ts (asset_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_health (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL UNIQUE,
    health_score INT NOT NULL DEFAULT 100,
    health_state VARCHAR(20) NOT NULL DEFAULT 'HEALTHY',
    connectivity_score INT DEFAULT 100,
    freshness_score INT DEFAULT 100,
    availability_score INT DEFAULT 100,
    error_score INT DEFAULT 100,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_ah_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_health_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    previous_state VARCHAR(20) NOT NULL,
    new_state VARCHAR(20) NOT NULL,
    health_score INT NOT NULL,
    reason VARCHAR(255) NULL,
    source VARCHAR(50) DEFAULT 'SYSTEM',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ahh_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_ahh_asset_ts (asset_id, timestamp)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_risk (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL UNIQUE,
    risk_score INT NOT NULL DEFAULT 10,
    risk_level VARCHAR(20) NOT NULL DEFAULT 'LOW',
    risk_factors JSON NULL,
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    calculation_version VARCHAR(20) DEFAULT 'v1.0.0',
    CONSTRAINT fk_ar_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_risk_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    risk_score INT NOT NULL,
    risk_level VARCHAR(20) NOT NULL,
    risk_factors JSON NULL,
    calculation_version VARCHAR(20) DEFAULT 'v1.0.0',
    calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_arh_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    INDEX idx_arh_asset_ts (asset_id, calculated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_protocols_observed (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    protocol_name VARCHAR(50) NOT NULL,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    observation_count INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_apo_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT uk_apo_asset_proto UNIQUE (asset_id, protocol_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_communication_baseline (
    id INT AUTO_INCREMENT PRIMARY KEY,
    source_asset_id INT NOT NULL,
    destination_asset_id INT NOT NULL,
    protocol VARCHAR(50) NOT NULL DEFAULT 'MODBUS/TCP',
    port INT DEFAULT 502,
    direction VARCHAR(20) DEFAULT 'INBOUND',
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    count INT DEFAULT 1,
    status VARCHAR(20) DEFAULT 'ACTIVE',
    CONSTRAINT fk_acb_src FOREIGN KEY (source_asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT fk_acb_dst FOREIGN KEY (destination_asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT uk_acb_pair UNIQUE (source_asset_id, destination_asset_id, protocol, port)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_tags (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    tag_name VARCHAR(50) NOT NULL,
    created_by VARCHAR(100) DEFAULT 'SYSTEM',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_at_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE,
    CONSTRAINT uk_asset_tag UNIQUE (asset_id, tag_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS asset_notes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    asset_id INT NOT NULL,
    author_id INT NULL,
    author_name VARCHAR(100) NOT NULL DEFAULT 'Analyst',
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_an_asset FOREIGN KEY (asset_id) REFERENCES assets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
